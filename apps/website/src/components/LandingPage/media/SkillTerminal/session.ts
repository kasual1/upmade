/**
 * The skill terminal's script, as pure functions of the time since a round started (the design's and the legacy
 * Landing/Sections.tsx `useTerminalSession` timings): the command is typed 35 ms a character after 250 ms, then the
 * banner, the question, its answer, the "added" line and the fresh prompt follow; the finished session holds for
 * 2950 ms after the answer, then the next round starts from an empty prompt. Pure, so the unit tests import it.
 */

/** What the terminal shows at a moment of a round. */
export interface SessionState {
  /** how many characters of the command are typed */
  typed: number;
  /** the command is being typed: a solid cursor after it */
  typing: boolean;
  /** the Upmade banner and its welcome line */
  banner: boolean;
  /** the "Install the upmade skill…?" question */
  question: boolean;
  /** its answer, "› Yes" */
  answered: boolean;
  /** the green "Added the upmade skill" line */
  added: boolean;
  /** the fresh prompt with a blinking cursor */
  prompt: boolean;
}

/** before the first character */
export const LEAD_MS = 250;
/** per character of the command */
export const CHAR_MS = 35;
/** from the last character to the end of typing (the cursor goes) */
export const AFTER_TYPING_MS = 75;
/** from the end of typing: the banner, the question and the answer */
export const BANNER_MS = 225;
export const QUESTION_MS = 650;
export const ANSWER_MS = 1100;
/** from the answer: the "added" line, the prompt and the next round */
export const ADDED_MS = 300;
export const PROMPT_MS = 500;
export const LOOP_MS = 2950;

/** The moments of a round for a command `length` characters long, in ms from the round's start. */
export function sessionTimes(length: number) {
  const n = Math.max(0, Math.floor(length));
  const typed = LEAD_MS + n * CHAR_MS + AFTER_TYPING_MS;
  const answered = typed + ANSWER_MS;
  return {
    typed,
    banner: typed + BANNER_MS,
    question: typed + QUESTION_MS,
    answered,
    added: answered + ADDED_MS,
    prompt: answered + PROMPT_MS,
    /** the round's length: the next one starts here */
    round: answered + LOOP_MS,
  };
}

/** The finished session (the server's, reduced motion's and off-screen state). */
export function finalState(length: number): SessionState {
  return { typed: length, typing: false, banner: true, question: true, answered: true, added: true, prompt: true };
}

/** What a round shows `ms` after it started (`ms` past the round's end shows the finished session). */
export function sessionAt(length: number, ms: number): SessionState {
  const t = sessionTimes(length);
  const typed = Math.min(length, Math.max(0, Math.floor((ms - LEAD_MS) / CHAR_MS)));
  return {
    typed,
    typing: ms < t.typed,
    banner: ms >= t.banner,
    question: ms >= t.question,
    answered: ms >= t.answered,
    added: ms >= t.added,
    prompt: ms >= t.prompt,
  };
}

/** The next moment after `ms` at which the round's state changes, or its end (`sessionTimes().round`). */
export function nextChangeAt(length: number, ms: number): number {
  const t = sessionTimes(length);
  if (ms < LEAD_MS + length * CHAR_MS) {
    // the next character (character i shows at LEAD_MS + i * CHAR_MS)
    const i = Math.max(1, Math.floor((ms - LEAD_MS) / CHAR_MS) + 1);
    return LEAD_MS + i * CHAR_MS;
  }
  for (const at of [t.typed, t.banner, t.question, t.answered, t.added, t.prompt]) if (at > ms) return at;
  return t.round;
}

/**
 * The scale of the session in a body `available` px wide (inside its padding) holding a session `content` px wide
 * (at least the design's 454 px; wider when a minimum font size enlarges its text): 1 at most, never 0.
 */
export function sessionScale(available: number, content: number): number {
  if (!(available > 0) || !(content > 0)) return 1;
  return Math.round(Math.min(1, available / content) * 10000) / 10000;
}
