/**
 * The corner agents' sizes (the design's .mech, .fw-anchor and .perf-agent): the agent's box in px, and how far the
 * box is pushed past the frame's corner (`dx` sideways, `dy` down), on wide screens and at 620px and below.
 */
export interface CornerSize {
  px: number;
  dx: number;
  dy: number;
  phone: { px: number; dx: number; dy: number };
}

export type CornerSizeKey = "s" | "m" | "l";

export const CORNER_SIZES: Record<CornerSizeKey, CornerSize> = {
  // the cycling glasses (.perf-agent)
  s: { px: 136, dx: 28, dy: 32, phone: { px: 96, dx: 10, dy: 22 } },
  // the framework sign (.fw-anchor)
  m: { px: 150, dx: 34, dy: 30, phone: { px: 104, dx: 14, dy: 24 } },
  // the juggler (.mech)
  l: { px: 200, dx: 42, dy: 30, phone: { px: 136, dx: 18, dy: 22 } },
};

export const DEFAULT_CORNER_SIZE: CornerSizeKey = "m";
