import { useRef } from "react";

export type SignalListener = (name: string) => void;
/** Adds a listener; returns the function that removes it. */
export type Subscribe = (listener: SignalListener) => () => void;

export interface SectionSignal {
  /** tells every current listener that `name` happened (an agent event, e.g. "flip") */
  emit(name: string): void;
  subscribe: Subscribe;
}

/** A plain emit/subscribe channel (no React state, so emitting never renders). */
export function createSectionSignal(): SectionSignal {
  const listeners = new Set<SignalListener>();
  return {
    emit(name) {
      // a copy, so a listener that unsubscribes (or subscribes) while handling does not disturb the loop
      [...listeners].forEach((listener) => listener(name));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/**
 * A section-local event channel between a section's agent and its media (plan §3.5): the section passes `emit` to
 * the agent and `subscribe` to the media, which react imperatively. The object is created once per component and
 * stays the same across renders.
 *
 * Sections/Showcase passes `emit` as the corner agent's `onEvent` (plan M11). Media must still be correct when nothing
 * emits (reduced motion, or the agent off screen), so each keeps a fallback of its own.
 */
export function useSectionSignal(): SectionSignal {
  const ref = useRef<SectionSignal | null>(null);
  if (!ref.current) ref.current = createSectionSignal();
  return ref.current;
}
