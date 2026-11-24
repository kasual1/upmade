import { useEffect, type DependencyList, type RefObject } from "react";

/** Schedules steps of a scripted demo; see `useTimeline`. */
export interface Timeline {
  /** runs `fn` `ms` after now (unless the timeline is cleared or the component unmounts first) */
  at(ms: number, fn: () => void): void;
  /** cancels every step that has not run yet; a loop calls it before scheduling its next round */
  clear(): void;
}

export interface TimelineOptions {
  /** the share of the element that must be visible before the timeline starts (IntersectionObserver threshold) */
  threshold?: number;
}

/**
 * Plays a scripted, timer-driven demo once its element scrolls into view: `start(timeline)` is called once, the
 * first time `ref` is at least `threshold` visible, and schedules its steps with `timeline.at(ms, fn)` (a loop
 * calls `timeline.clear()` and schedules itself again). Nothing runs with reduced motion, so the component keeps
 * its initial (final) state. Every pending step is cancelled on unmount or when `deps` change.
 *
 * Browser APIs are only touched in the effect, so components using it render on the server.
 */
export function useTimeline(
  ref: RefObject<Element | null>,
  start: (timeline: Timeline) => void,
  deps: DependencyList = [],
  { threshold = 0.3 }: TimelineOptions = {},
): void {
  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let timers: number[] = [];
    const timeline: Timeline = {
      at: (ms, fn) => {
        timers.push(window.setTimeout(fn, ms));
      },
      clear: () => {
        timers.forEach(window.clearTimeout);
        timers = [];
      },
    };

    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!started && entries.some((entry) => entry.isIntersecting)) {
          started = true;
          observer.disconnect();
          start(timeline);
        }
      },
      { threshold },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      timeline.clear();
    };
    // `start` is read when the element comes into view; callers list what it depends on in `deps`.
  }, [ref, threshold, ...deps]);
}
