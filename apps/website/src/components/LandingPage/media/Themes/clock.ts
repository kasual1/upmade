import { FALLBACK_AFTER_MS, HAT_LOOP_MS, nextTheme, themeAfterPutOns } from "./themes";

export interface ThemeClock {
  /** the hat-swapping agent put on its next hat: wear the matching theme, and stand the fallback down */
  putOn(): void;
  /** the media is on screen (or not): the fallback only counts while it is */
  setActive(active: boolean): void;
  /** the current theme's index in THEMES */
  readonly index: number;
  /** stops every timer, for good */
  dispose(): void;
}

/**
 * Which theme the media wears, from the corner agent's "putOn" events with a fallback clock of its own (no React,
 * no DOM; `apply` does the drawing). Timers use the global setTimeout, so the spec drives it with fake timers.
 *
 * - Each "putOn" wears the theme of the agent's new hat (the agent starts in the first theme's hat, so the n-th
 *   putOn wears theme n), which is the next one whenever the events flow, and keeps hat and theme matched even if
 *   the fallback moved on in between.
 * - While active and no "putOn" arrived for FALLBACK_AFTER_MS (1.5 agent loops), the clock moves on by itself, one
 *   theme per HAT_LOOP_MS, until the next "putOn" stops it. So the media is right before the agent's events are
 *   wired, and whenever none arrive.
 */
export function createThemeClock(apply: (index: number) => void): ThemeClock {
  let index = 0;
  let putOns = 0;
  let active = false;
  let disposed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const show = (next: number) => {
    if (next === index) return;
    index = next;
    apply(index);
  };
  const stop = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  };
  /** waits `ms` (FALLBACK_AFTER_MS of silence, then one loop per theme) and moves on */
  const arm = (ms: number) => {
    stop();
    if (!active) return;
    timer = setTimeout(() => {
      timer = undefined;
      show(nextTheme(index));
      arm(HAT_LOOP_MS);
    }, ms);
  };

  return {
    putOn() {
      putOns += 1;
      show(themeAfterPutOns(putOns));
      arm(FALLBACK_AFTER_MS);
    },
    setActive(next) {
      if (disposed || next === active) return;
      active = next;
      if (active) arm(FALLBACK_AFTER_MS);
      else stop();
    },
    get index() {
      return index;
    },
    dispose() {
      disposed = true;
      active = false;
      stop();
    },
  };
}
