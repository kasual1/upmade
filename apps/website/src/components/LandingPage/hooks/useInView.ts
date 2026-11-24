import { useEffect, useState, type RefObject } from "react";

export interface InViewOptions {
  /** grows (or shrinks) the viewport for the test; by default elements count as in view 200 px early */
  rootMargin?: string;
  /** the share of the element that must be visible (IntersectionObserver threshold) */
  threshold?: number;
  /** stay `true` once the element has been in view (for one-off starts) */
  once?: boolean;
}

type Listener = (inView: boolean) => void;

interface SharedObserver {
  observer: IntersectionObserver;
  listeners: Map<Element, Set<Listener>>;
}

/** One IntersectionObserver per set of options, shared by every element that uses those options. */
const observers = new Map<string, SharedObserver>();

function sharedObserver(rootMargin: string, threshold: number): SharedObserver {
  const key = `${rootMargin}|${threshold}`;
  let shared = observers.get(key);
  if (!shared) {
    const listeners = new Map<Element, Set<Listener>>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) listeners.get(entry.target)?.forEach((listener) => listener(entry.isIntersecting));
      },
      { rootMargin, threshold },
    );
    shared = { observer, listeners };
    observers.set(key, shared);
  }
  return shared;
}

/** Watches `element` through the shared observer for these options; returns the function that stops watching. */
export function observeInView(
  element: Element,
  listener: Listener,
  { rootMargin = "200px 0px", threshold = 0 }: Pick<InViewOptions, "rootMargin" | "threshold"> = {},
): () => void {
  const shared = sharedObserver(rootMargin, threshold);
  let set = shared.listeners.get(element);
  if (!set) {
    set = new Set();
    shared.listeners.set(element, set);
    shared.observer.observe(element);
  }
  set.add(listener);
  return () => {
    const current = shared.listeners.get(element);
    if (!current) return;
    current.delete(listener);
    if (current.size === 0) {
      shared.listeners.delete(element);
      shared.observer.unobserve(element);
    }
  };
}

/**
 * Whether `ref`'s element is on screen (within `rootMargin`). `false` on the server and until the first report, so
 * work that depends on it (timers, media, animations) starts only in the browser and only in view. Without
 * IntersectionObserver the element counts as in view.
 */
export function useInView(ref: RefObject<Element | null>, { rootMargin, threshold, once = false }: InViewOptions = {}): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    let stop = () => {};
    stop = observeInView(
      element,
      (visible) => {
        setInView(visible);
        if (visible && once) stop();
      },
      { rootMargin, threshold },
    );
    return () => stop();
  }, [ref, rootMargin, threshold, once]);
  return inView;
}
