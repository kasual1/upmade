/**
 * FAQ answers are plain text that may hold `code` spans (backticks), nothing else (FaqSection in types.ts). Pure, so
 * tests/landing-faq.spec.ts can import it; the JSON-LD strips the same backticks (seo.ts stripBackticks).
 */
export interface AnswerPart {
  code: boolean;
  text: string;
}

/**
 * Splits an answer into text and code parts. A pair of backticks makes a code span; an empty pair is dropped, and an
 * unmatched backtick is dropped too, exactly as seo.ts stripBackticks does, so the visible text and the JSON-LD
 * match. Adjacent text parts are merged, empty ones are left out.
 */
export function splitCodeSpans(answer: string): AnswerPart[] {
  const parts: AnswerPart[] = [];
  const push = (code: boolean, text: string) => {
    if (!text) return;
    const last = parts[parts.length - 1];
    if (!code && last && !last.code) last.text += text;
    else parts.push({ code, text });
  };
  const re = /`([^`]*)`/g;
  let at = 0;
  for (let m = re.exec(answer); m; m = re.exec(answer)) {
    push(false, answer.slice(at, m.index));
    push(true, m[1]);
    at = m.index + m[0].length;
  }
  push(false, answer.slice(at).replace(/`/g, ""));
  return parts;
}
