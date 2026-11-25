import { LANDING_AGENTS, type AgentKey, type LandingAgentEntry } from "../../agents";

/**
 * The corner agents' box sizes in px (the design's .mech, .fw-anchor and .perf-agent), on wide screens and at 620px
 * and below.
 */
export interface CornerSize {
  px: number;
  phone: { px: number };
  /** at 420px and below, if smaller again (the "Agentic" design shrinks its corner agents on the smallest phones) */
  small?: { px: number };
}

export type CornerSizeKey = "xs" | "s" | "m" | "l";

export const CORNER_SIZES: Record<CornerSizeKey, CornerSize> = {
  // the /agentic corner agents (the "Agentic" design's .bouquet-agent, .love-agent and .dress-agent): as "s" on wide
  // screens, smaller on phones, and smaller again at 420px and below
  xs: { px: 136, phone: { px: 80 }, small: { px: 66 } },
  // the cycling glasses (.perf-agent)
  s: { px: 136, phone: { px: 96 } },
  // the framework sign (.fw-anchor)
  m: { px: 150, phone: { px: 104 } },
  // the juggler (.mech)
  l: { px: 200, phone: { px: 136 } },
};

export const DEFAULT_CORNER_SIZE: CornerSizeKey = "m";

/** The box size at 420px and below: `small` if the size has one, else the phone size. */
export const smallPx = (size: CornerSize): number => size.small?.px ?? size.phone.px;

/**
 * How far a corner agent's BODY hangs past the frame's corner, as a fraction of the body's own width (sideways, past
 * the frame's side on the agent's corner) and height (down, past the frame's bottom edge).
 */
export const CORNER_OVERLAP = { x: 0.25, y: 0.3 } as const;

/**
 * Where to put a corner agent's box so that its body overlaps the frame's corner by CORNER_OVERLAP: `dx` is how far
 * the box's outer side (left for "bl", right for "br") sits past the frame's side, `dy` how far the box's bottom sits
 * below the frame's bottom edge. Placing by the body (agents.ts `body`) rather than the box keeps the overlap right
 * whatever empty room a demo leaves around its drawing.
 */
export function cornerOffset(key: AgentKey, corner: "bl" | "br", px: number): { dx: number; dy: number } {
  const body = (LANDING_AGENTS[key] as LandingAgentEntry).body;
  if (!body) throw new Error(`agents.ts: "${key}" is used as a corner agent but has no body insets`);
  const outer = corner === "bl" ? body.left : body.right;
  const width = 1 - body.left - body.right;
  const height = 1 - body.top - body.bottom;
  return {
    dx: Math.round((outer + CORNER_OVERLAP.x * width) * px),
    dy: Math.round((body.bottom + CORNER_OVERLAP.y * height) * px),
  };
}
