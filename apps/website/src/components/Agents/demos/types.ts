import type { ComponentType } from "react";

/**
 * A demo file in this folder is picked up by the /agent page automatically. It exports either
 *   `label`, `order` (optional, lower comes first) and a default component, or
 *   `demos`: a list of { key, label, order, Demo } for several entries from one file.
 * The component draws its <Agent> with the className it is given (that sets its size).
 */
export interface DemoProps {
  className?: string;
}
export interface DemoEntry {
  key: string;
  label: string;
  order: number;
  Demo: ComponentType<DemoProps>;
}
