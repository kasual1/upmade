// TEMP: dev-only stand-in for a chat backend. It calls Gemini straight from the browser with GEMINI_API_KEY from the
// root .env, so the editor's own dev page (`npm run dev -w libs/editor/core`) can talk to a real model. Only the dev
// build loads it (see `globalScript` in stencil.config.ts); delete this folder when it is no longer needed.
// Adapted from apps/demos/angular/src/app/pages/examples/generative-ui/browser-transport.ts.
import type {
  UpmadeChatMessage,
  UpmadeChatPart,
  UpmadeChatRequest,
  UpmadeChatStopReason,
  UpmadeChatStreamEvent,
  UpmadeChatTransport,
} from '@upmade/core';

export interface GeminiTransportOptions {
  apiKey: string;
  /** e.g. `'gemini-flash-latest'`, `'gemini-2.5-flash'`, `'gemini-2.5-pro'`. */
  model: string;
  /** Models tried in order when `model` stays overloaded (503) or rate-limited (429). */
  fallbackModels?: string[];
  /** What a real server adds to the app's instructions. */
  serverSystem?: string;
  /** Logs each request and answer to the console. */
  log?: boolean;
}

interface GeminiPart {
  text?: string;
  thought?: boolean;
  thoughtSignature?: string;
  functionCall?: { id?: string; name: string; args?: Record<string, unknown> };
  [key: string]: unknown;
}

interface GeminiChunk {
  candidates?: { finishReason?: string; finishMessage?: string; content?: { parts?: GeminiPart[] } }[];
  promptFeedback?: { blockReason?: string };
  usageMetadata?: Record<string, unknown>;
  error?: { message?: string };
}

/** Gemini doesn't always name its calls, so the transport does. The prefix tells these IDs apart from Gemini's own. */
const GEMINI_CALL_ID_PREFIX = 'upmade-call-';

/**
 * Gemini wants a thought signature on the first call of every model turn. A turn that Gemini didn't write in one
 * piece, e.g. one the user stopped, gets this placeholder, which skips the check.
 */
const GEMINI_SKIP_SIGNATURE = 'skip_thought_signature_validator';

/** Tries per model before moving on to the next fallback model. */
const ATTEMPTS = 2;

/** How long to wait for a model to start answering. */
const HEADERS_TIMEOUT_MS = 20_000;

export function createGeminiTransport(options: GeminiTransportOptions): UpmadeChatTransport {
  let step = 0;
  return (request, { signal }) => {
    if (!options.apiKey) {
      throw new Error('GEMINI_API_KEY is not set. Add it to the .env at the repository root and restart the dev server.');
    }
    return streamGemini(options, request, signal, ++step);
  };
}

async function* streamGemini(
  options: GeminiTransportOptions,
  request: UpmadeChatRequest,
  signal: AbortSignal,
  step: number,
): AsyncGenerator<UpmadeChatStreamEvent> {
  const system = [request.system, options.serverSystem].filter(Boolean).join('\n\n');
  // The body depends on the model: thought signatures only go back to the model that wrote them.
  const bodyFor = (model: string) => ({
    ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
    contents: toGeminiContents(request.messages, model),
    tools: [
      {
        functionDeclarations: request.tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          parametersJsonSchema: tool.inputSchema,
        })),
      },
    ],
  });

  // A busy model (503 "overloaded", a hang, or 429 on the free tier) is tried again once, then the next one in line.
  const models = [...new Set([options.model, ...(options.fallbackModels ?? [])])];
  let response: Response | undefined;
  let usedModel = options.model;
  for (const [index, model] of models.entries()) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`;
    const body = bodyFor(model);
    if (options.log) {
      console.groupCollapsed(`[gemini] step ${step} → ${model} (${request.mode} mode, ${request.messages.length} messages)`);
      console.log('upmade request', request);
      console.log('gemini body', body);
      console.groupEnd();
    }
    try {
      response = await post(url, options.apiKey, body, signal);
      usedModel = model;
      break;
    } catch (error) {
      const busy = (error as { status?: number }).status === 503 || (error as { status?: number }).status === 429;
      if (!busy || index === models.length - 1) throw error;
      console.warn(`[gemini] ${model} is busy (${(error as Error).message}); trying ${models[index + 1]}`);
    }
  }

  // Gemini's own parts, thought signatures included, are sent back unchanged with the next request.
  const parts: GeminiPart[] = [];
  let calls = 0;
  let finishReason: string | undefined;
  let finishMessage: string | undefined;
  let usage: Record<string, unknown> | undefined;
  for await (const data of readServerSentEvents(response!)) {
    const chunk = parseEvent<GeminiChunk>(data);
    if (chunk.error) {
      throw new Error(`Gemini: ${chunk.error.message ?? 'The answer broke off.'}`);
    }
    if (chunk.promptFeedback?.blockReason) {
      throw new Error(`Gemini blocked the prompt (${chunk.promptFeedback.blockReason}).`);
    }
    usage = chunk.usageMetadata ?? usage;
    const candidate = chunk.candidates?.[0];
    for (const part of candidate?.content?.parts ?? []) {
      parts.push(part);
      if (part.functionCall) {
        // Gemini writes each call in one piece, so it runs as soon as it arrives.
        const id = part.functionCall.id ?? `${GEMINI_CALL_ID_PREFIX}${crypto.randomUUID()}`;
        const providerData = part.thoughtSignature
          ? { gemini: { thoughtSignature: part.thoughtSignature, model: usedModel } }
          : undefined;
        calls++;
        yield { type: 'tool-call-start', id, name: part.functionCall.name };
        yield {
          type: 'part',
          part: { type: 'tool-call', id, name: part.functionCall.name, input: part.functionCall.args ?? {}, providerData },
        };
      } else if (part.text && !part.thought) {
        yield { type: 'text-delta', text: part.text };
      }
    }
    finishReason = candidate?.finishReason ?? finishReason;
    finishMessage = candidate?.finishMessage ?? finishMessage;
  }

  if (options.log) {
    console.groupCollapsed(`[gemini] step ${step} ← ${usedModel}: ${finishReason ?? 'no finish'} (${calls} tool calls)`);
    console.log('parts', parts);
    if (usage) console.log('usage', usage);
    console.groupEnd();
  }

  if (!finishReason) {
    throw new Error('Gemini: The answer broke off. Try again.');
  }
  const cutOff = finishReason === 'MAX_TOKENS' || finishReason === 'CONTINUATION';
  if (!calls && finishReason !== 'STOP' && !cutOff) {
    throw new Error(`Gemini stopped without an answer (${finishMessage || finishReason}).`);
  }
  const stopReason: UpmadeChatStopReason = calls ? 'tool-calls' : cutOff ? 'max-tokens' : 'end';
  yield { type: 'finish', stopReason, providerData: { gemini: { parts, model: usedModel } } };
}

/** Gemini calls the assistant "model" and takes tool results as user content. */
function toGeminiContents(messages: UpmadeChatMessage[], model: string): { role: string; parts: unknown[] }[] {
  const contents: { role: string; parts: unknown[] }[] = [];
  for (const message of messages) {
    const gemini = message.providerData?.['gemini'] as { parts?: unknown[]; model?: string } | undefined;
    // Gemini's own parts go back unchanged, but only to the model that wrote them (signatures are per model).
    const original = gemini?.model === model ? gemini.parts : undefined;
    const role = message.role === 'assistant' ? 'model' : 'user';
    const parts = message.role === 'assistant' && original?.length ? original : toGeminiParts(message, model);
    if (!parts.length) {
      continue;
    }
    // Gemini expects the roles to take turns, e.g. the tool results and the next prompt in one user turn.
    const last = contents[contents.length - 1];
    if (last?.role === role) {
      last.parts.push(...parts);
    } else {
      contents.push({ role, parts: [...parts] });
    }
  }
  return contents;
}

function toGeminiParts(message: UpmadeChatMessage, model: string): GeminiPart[] {
  const parts = message.parts.flatMap(part => toGeminiPart(part, model));
  const firstCall = parts.find(part => part.functionCall);
  if (message.role === 'assistant' && firstCall && !firstCall.thoughtSignature) {
    firstCall.thoughtSignature = GEMINI_SKIP_SIGNATURE;
  }
  return parts;
}

function toGeminiPart(part: UpmadeChatPart, model: string): GeminiPart[] {
  switch (part.type) {
    case 'text':
      return part.text ? [{ text: part.text }] : [];
    case 'image':
      return part.data ? [{ inlineData: { mimeType: part.mediaType, data: part.data } }] : [{ text: `Image: ${part.url}` }];
    case 'tool-call': {
      const gemini = part.providerData?.['gemini'] as { thoughtSignature?: string; model?: string } | undefined;
      const signature = gemini?.model === model ? gemini.thoughtSignature : undefined;
      return [
        {
          functionCall: { ...geminiCallId(part.id), name: part.name, args: toInputObject(part.input) },
          ...(signature ? { thoughtSignature: signature } : {}),
        },
      ];
    }
    case 'tool-result': {
      const response = toResponseObject(part.output);
      return [
        {
          functionResponse: {
            ...geminiCallId(part.toolCallId),
            name: part.name,
            response: part.isError ? { error: response } : response,
          },
        },
      ];
    }
  }
}

/** The ID of a call as Gemini knows it: none when the transport made it up. */
function geminiCallId(id: string): { id?: string } {
  return id.startsWith(GEMINI_CALL_ID_PREFIX) ? {} : { id };
}

/** Gemini takes a tool result as an object. */
function toResponseObject(output: string): Record<string, unknown> {
  try {
    const value: unknown = JSON.parse(output);
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : { result: value };
  } catch {
    return { result: output };
  }
}

/** Posts JSON to Gemini. Rate limits (frequent on the free tier), server and connection errors are tried again. */
async function post(url: string, apiKey: string, body: unknown, signal: AbortSignal): Promise<Response> {
  for (let attempt = 1; ; attempt++) {
    let response: Response;
    // Overloaded models sometimes hang instead of answering 503: give up on them after a while, so the next model
    // in line gets its turn. The timer only covers the wait for the answer to start, not its streaming.
    const timeout = new AbortController();
    const timer = setTimeout(() => timeout.abort(), HEADERS_TIMEOUT_MS);
    try {
      response = await fetch(url, {
        method: 'POST',
        signal: AbortSignal.any([signal, timeout.signal]),
        headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify(body),
      });
    } catch (error) {
      if (signal.aborted) {
        throw error;
      }
      if (timeout.signal.aborted) {
        throw Object.assign(new Error(`Gemini did not answer within ${HEADERS_TIMEOUT_MS / 1000}s (503)`), { status: 503 });
      }
      if (attempt < ATTEMPTS) {
        await wait(500 * 2 ** attempt, signal);
        continue;
      }
      throw Object.assign(new Error('Could not reach Gemini. Check your connection and try again.'), { cause: error });
    } finally {
      clearTimeout(timer);
    }
    if (response.ok) {
      return response;
    }
    if ((response.status === 429 || response.status >= 500) && attempt < ATTEMPTS) {
      await response.body?.cancel().catch(() => undefined);
      await wait(Number(response.headers.get('retry-after')) * 1000 || 1500, signal);
      continue;
    }
    const json = (await response.json().catch(() => undefined)) as
      | { error?: { message?: string } }
      | { error?: { message?: string } }[]
      | undefined;
    // Gemini wraps its error in an array.
    const message = (Array.isArray(json) ? json[0] : json)?.error?.message || response.statusText || 'The request failed.';
    throw Object.assign(new Error(`Gemini: ${message} (${response.status})`), { status: response.status });
  }
}

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(done, Math.min(ms, 10_000));
    signal.addEventListener('abort', abort, { once: true });
    function done() {
      signal.removeEventListener('abort', abort);
      resolve();
    }
    function abort() {
      clearTimeout(timer);
      reject(signal.reason);
    }
  });
}

/** Yields the data of each event of a server-sent events stream. */
async function* readServerSentEvents(response: Response): AsyncGenerator<string> {
  if (!response.body) {
    throw new Error('Gemini: The answer was empty.');
  }
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  try {
    for (;;) {
      const { value, done } = await reader.read();
      const text = `${buffer}${value ?? ''}`;
      const pendingCr = !done && text.endsWith('\r');
      buffer = (pendingCr ? text.slice(0, -1) : text).replace(/\r\n?/g, '\n') + (pendingCr ? '\r' : '');
      for (let end = buffer.indexOf('\n\n'); end >= 0; end = buffer.indexOf('\n\n')) {
        const event = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        const data = event
          .split('\n')
          .filter(line => line.startsWith('data:'))
          .map(line => line.slice(5).replace(/^ /, ''))
          .join('\n');
        if (data) {
          yield data;
        }
      }
      if (done) {
        if (buffer.trim().startsWith('data:')) {
          yield buffer.trim().slice(5).replace(/^ /, '');
        }
        return;
      }
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
}

function parseEvent<T>(data: string): T {
  try {
    return JSON.parse(data) as T;
  } catch {
    throw new Error('Gemini: The answer broke off. Try again.');
  }
}

/** Gemini takes the input of an earlier call as an object, also when it was cut off. */
function toInputObject(input: unknown): Record<string, unknown> {
  let value = input;
  if (typeof input === 'string') {
    try {
      value = input.trim() ? JSON.parse(input) : {};
    } catch {
      value = {};
    }
  }
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}
