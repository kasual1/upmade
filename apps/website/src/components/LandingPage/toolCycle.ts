/**
 * The hero's pairing of the toolCycle agent with the toolbar (plan §3.5), from the animation's own `events` data
 * (Agents/animations/toolCycle.ts): the agent emits `tool:<name>` as each tool's turn starts, with the toolbar's tool
 * names. Pure (no React, no Docusaurus), so tests/landing-m11.spec.ts imports it directly.
 */
import { toolCycle } from "../Agents/animations/toolCycle";
import type { ToolKey } from "./primitives/Toolbar/tools";

export const TOOL_EVENT_PREFIX = "tool:";

/** The tool a `tool:<name>` event names, or null for any other event. */
export function toolOfEvent(name: string): string | null {
  return name.startsWith(TOOL_EVENT_PREFIX) ? name.slice(TOOL_EVENT_PREFIX.length) : null;
}

/**
 * When each tool's turn starts in the agent's loop, in ms (the time of its `tool:*` event): a click on a toolbar
 * tool restarts the agent there (AgentSlot `start`). The cursor's turn starts the loop (0).
 */
export const TOOL_START: Readonly<Partial<Record<ToolKey, number>>> = Object.fromEntries(
  (toolCycle.events ?? []).flatMap(([at, name]) => {
    const tool = toolOfEvent(name);
    return tool ? [[tool, at] as const] : [];
  }),
);

/**
 * The turn that cannot be cut short: the arrow is tossed high over the agent's head, so a click on another tool
 * while it is in the air lets the agent finish the catch at TOSS_RATE until its next tool event, then jumps (the
 * design's "a tossed arrow is caught and stowed at 4x speed").
 */
export const TOSS_TOOL: ToolKey = "arrow";
export const TOSS_RATE = 4;
