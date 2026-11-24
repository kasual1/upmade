import type { AgentAnimation } from "../types";

/** Standing about: breathing, a glance to each side and two blinks. Works with every shape. */
export const idle: AgentAnimation = {
  duration: 4800,
  rest: 0,
  body: { breathe: 0.012 },
  eyes: {
    look: [[0, [0, 0]], [1100, [0, 0]], [1250, [1.6, -0.4]], [2200, [1.6, -0.4]], [2350, [-1.4, 0.2]], [3300, [-1.4, 0.2]], [3450, [0, 0]]],
    blinks: [700, 3900, 4100],
  },
};
