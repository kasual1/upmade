/**
 * The code typer's timing (the design's script, as on today's site): each framework's turn starts with a short lead,
 * types its snippet like a person (quick characters, a pause at each line break), settles, then holds the finished
 * snippet before the next framework's turn. Pure, so the unit tests import it directly.
 *
 * The framework sign (Agents/animations/frameworkSign.ts) documents the same turns as its clock: React 6170 ms,
 * Vue 6824 ms, Angular 9348 ms (a 22342 ms loop), each 500 ms flip ending as the next turn starts. Its `flip` event
 * comes halfway through the flip, as the sign is edge-on (the logo swaps), so FLIP_LEAD_MS before the next turn.
 * The typer follows the flips, and runs on the documented turns only until a flip arrives (index.tsx).
 */

/** before the first character of a turn */
export const LEAD_MS = 350;
/** per character */
export const CHAR_MS = 22;
/** per line break (instead of CHAR_MS) */
export const LINE_MS = 140;
/** after the last character, until the caret starts blinking */
export const SETTLE_MS = 75;
/** after the last character, until the next turn */
export const HOLD_MS = 2950;
/**
 * from the sign's `flip` event to the next framework's turn: the flip (500 ms) ends as the turn starts, and the event
 * comes halfway through it (tests/landing-m11.spec.ts checks this against the animation's events)
 */
export const FLIP_LEAD_MS = 250;

/** The framework sign's documented turns, by framework id (its loop is their sum). */
export const SIGN_TURNS_MS: Readonly<Record<string, number>> = { react: 6170, vue: 6824, angular: 9348 };

/**
 * When each character is typed, from the start of the turn: `times[n - 1]` is when the first `n` characters show
 * (n = 1 … code.length).
 */
export function typingTimes(code: string): number[] {
  const times: number[] = [];
  let t = LEAD_MS;
  for (let i = 0; i < code.length; i++) {
    t += code[i] === "\n" ? LINE_MS : CHAR_MS;
    times.push(t);
  }
  return times;
}

/** When the last character is typed, from the start of the turn. */
export function typingEnd(code: string): number {
  const times = typingTimes(code);
  return times.length ? times[times.length - 1] : LEAD_MS;
}

/** A turn's length as typed: the lead, the typing and the hold. */
export function computedTurnMs(code: string): number {
  return typingEnd(code) + HOLD_MS;
}

/** A framework's turn: the sign's documented turn for it, or (for a framework the sign does not know) as typed. */
export function turnMs(framework: { id: string; code: string }): number {
  return Object.prototype.hasOwnProperty.call(SIGN_TURNS_MS, framework.id)
    ? SIGN_TURNS_MS[framework.id]
    : computedTurnMs(framework.code);
}
