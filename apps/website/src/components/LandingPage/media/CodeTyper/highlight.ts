/**
 * The code typer's light syntax highlighting (ported from Landing/Sections.tsx `highlight`, which is the design's
 * `hilite`): strings, a few keywords, decorators and JSX/HTML tags. Pure, so the unit tests import it directly.
 */

/** What a token is: a string, a keyword, a decorator or a tag (the design's .s, .k, .d and .tg). */
export type TokenKind = "string" | "keyword" | "decorator" | "tag";

export interface CodeToken {
  text: string;
  /** none: plain text */
  kind?: TokenKind;
}

/**
 * The design's tokenizer. Quotes may be unclosed, because a line is highlighted while it is being typed (so a string
 * turns green as soon as its opening quote appears).
 */
const CODE_TOKEN =
  /('[^'\n]*'?|"[^"\n]*"?|`[^`\n]*`?)|\b(import|from|export|function|return|class|setup)\b|(@\w+)|(<\/?[A-Za-z][\w-]*|\/?>)/g;

/**
 * Splits one (possibly partly typed) line into tokens. Concatenating the tokens' text gives the line back; plain
 * runs between tokens have no `kind`, and no token is empty.
 */
export function tokenizeLine(line: string): CodeToken[] {
  const tokens: CodeToken[] = [];
  let last = 0;
  for (const match of line.matchAll(CODE_TOKEN)) {
    const [text, string, keyword, decorator] = match;
    const index = match.index ?? 0;
    if (index > last) tokens.push({ text: line.slice(last, index) });
    const kind: TokenKind = string ? "string" : keyword ? "keyword" : decorator ? "decorator" : "tag";
    tokens.push({ text, kind });
    last = index + text.length;
  }
  if (last < line.length) tokens.push({ text: line.slice(last) });
  return tokens;
}
