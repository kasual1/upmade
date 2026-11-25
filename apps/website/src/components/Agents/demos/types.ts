import type { ComponentType } from "react";

/**
 * A demo file in this folder is picked up by the /agent page automatically. It exports either
 *   `label`, `order` (optional, lower comes first) and a default component, or
 *   `demos`: a list of { key, label, order, Demo } for several entries from one file.
 * The component draws its <Agent> with the className it is given (that sets its size).
 */
export interface DemoProps {
  className?: string;
  /**
   * Optional hooks for pages that pair an agent with something else (the landing pages); /agent passes none, so the
   * demos look and play the same there. `onEvent` is called with each animation event, after the demo's own state
   * update for it; `start` and `rate` are passed to the demo's main <Agent> (see AgentProps).
   */
  onEvent?: (name: string) => void;
  start?: number;
  rate?: number;
}
export interface DemoEntry {
  key: string;
  label: string;
  order: number;
  Demo: ComponentType<DemoProps>;
}
