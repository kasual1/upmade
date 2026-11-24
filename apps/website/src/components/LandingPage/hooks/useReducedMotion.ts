import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(QUERY).matches;
}

/** The server (and hydration) assumes motion is allowed; the client switches right after if it is not. */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Whether the visitor asks for reduced motion, kept up to date when the setting changes (unlike a one-off
 * matchMedia read). The landing pages' own hook; the agents keep theirs (src/components/Agents is read-only here).
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
