// TEMP: dev-only global script (see `globalScript` in stencil.config.ts). Gives the <upmade-editor> of the dev page
// a chat session that talks to Gemini directly, instead of going through a chat server. Delete this folder when done.
//
// URL options of the dev page (http://localhost:3333):
//   ?mode=user           the model works as the user instead of as an agent with its own cursor (default: agent)
//   ?model=gemini-3.1-pro-preview  another Gemini model (default: GEMINI_MODEL from .env, else gemini-3-flash-preview)
//   ?fallback=a,b        models tried when it is overloaded (default: GEMINI_FALLBACK_MODELS from .env, else a lite chain)
//   ?instant             agent mode: skip the cursor animation
//   ?log=0               no request/answer logging in the console
import { Env } from '@stencil/core';
import { UPMADE_DEFAULT_OBJECT_TITLEBAR, UpmadeAgent, UpmadeChatSession, UpmadeIframeObject } from '@upmade/core';
import { createGeminiTransport } from './gemini-transport';

const SYSTEM = `You draw on a whiteboard. Look at the canvas before you change it. Build anything interactive or \
data-like, such as a weather card, a timer or a chart, as a widget with create_iframe.`;

/** What a real chat server would add to the app's instructions. */
const SERVER_SYSTEM = `You work on an infinite whiteboard through the tools you are given. When the user's message \
lists objects (chips), the request is about those objects. Use the object IDs returned by earlier tool calls to refer \
to what you created. Reply in one short sentence; the canvas shows the result.`;

export default function setupDevChat() {
  if (typeof window === 'undefined') {
    return;
  }
  const params = new URLSearchParams(location.search);
  const apiKey = Env.GEMINI_API_KEY ?? '';
  // gemini-flash-latest is often overloaded (503) on the free tier; these answered reliably in Nov 2026.
  const model = params.get('model') || Env.GEMINI_MODEL || 'gemini-3-flash-preview';
  const fallbackModels = (params.get('fallback') || Env.GEMINI_FALLBACK_MODELS || 'gemini-3.5-flash-lite,gemini-flash-lite-latest,gemini-3.1-flash-lite')
    .split(',')
    .map(name => name.trim())
    .filter(Boolean);
  const mode = params.get('mode') === 'user' ? 'user' : 'agent';

  if (!apiKey) {
    console.warn('[dev-chat] GEMINI_API_KEY is not set in the root .env: the chat box cannot reach the model.');
  }

  const session = new UpmadeChatSession({
    transport: createGeminiTransport({ apiKey, model, fallbackModels, serverSystem: SERVER_SYSTEM, log: params.get('log') !== '0' }),
    system: SYSTEM,
    canvasTools: { iframes: true },
    instant: params.has('instant'),
    ...(mode === 'agent' ? { agent: new UpmadeAgent({ id: 'assistant', name: 'Assistant', color: '#7C3AED' }) } : {}),
  });
  session.on('tool-call', update => {
    if (update.state === 'done') {
      console.debug(`[dev-chat] ${update.name}`, update.input, '→', update.result?.isError ? 'ERROR' : 'ok', update.result?.output);
    }
  });
  session.on('end', result => console.info('[dev-chat] prompt ended:', result.status, result.error ?? ''));

  // For poking at it from the console.
  (window as unknown as { upmadeDevChat: unknown }).upmadeDevChat = session;
  console.info(`[dev-chat] Gemini ${model} (fallbacks: ${fallbackModels.join(', ') || 'none'}), ${mode} mode. The session is window.upmadeDevChat.`);

  const attach = () => {
    document.querySelectorAll('upmade-editor').forEach(el => {
      el.chatSession = session;
      el.isChatBoxVisible = true;
      el.objectConfig ??= {
        hasTitlebar: (object: unknown) => object instanceof UpmadeIframeObject,
        isRotatable: (object: unknown) => !(object instanceof UpmadeIframeObject),
      };
      el.objectTitlebar ??= UPMADE_DEFAULT_OBJECT_TITLEBAR;
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attach, { once: true });
  } else {
    attach();
  }
}
