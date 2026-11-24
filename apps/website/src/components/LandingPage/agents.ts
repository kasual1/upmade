/**
 * The landing pages' view of the agents: every agent a section can show, by key, mapped to the EXISTING demo
 * component of the /agent page (src/components/Agents/demos/*). Sections refer to agents only by these keys and
 * render them through <AgentSlot> (primitives/AgentSlot).
 *
 * The agents are placeholders here (plan §0): they are iterated on in their own stream of work and are read-only
 * for the landing page. This adapter never changes them; it only adds what the landing page needs to know about
 * them (an accessible label, how far the drawing reaches past its box, whether it stacks several <Agent>s).
 *
 * Keys are the /agent demo keys, computed as src/pages/agent.tsx does: the file name for a file with a default
 * export, or the entry's `key` for a file with a `demos` list (family.tsx gives squircle, circle, triangle, bullet,
 * pill). tests/landing-agents.spec.ts checks every key still matches a demo, so a rename on the agents side fails
 * fast.
 */
import type { ComponentType } from "react";
import type { DemoEntry, DemoProps } from "../Agents/demos/types";
import BookDemo from "../Agents/demos/book";
import BouquetDemo from "../Agents/demos/bouquetReveal";
import ControlPanelDemo from "../Agents/demos/controlPanel";
import CursorDemo from "../Agents/demos/cursor";
import CyclingGlassesDemo from "../Agents/demos/cyclingGlasses";
import DevicesDemo from "../Agents/demos/devices";
import { demos as familyDemos } from "../Agents/demos/family";
import FrameworkSignDemo from "../Agents/demos/frameworkSign";
import HandoffDemo from "../Agents/demos/handoff";
import HatSwapDemo from "../Agents/demos/hatSwap";
import JugglerDemo from "../Agents/demos/juggler";
import KeyDemo from "../Agents/demos/key";
import LovestruckDemo from "../Agents/demos/lovestruck";
import PainterDemo from "../Agents/demos/painter";
import PlugDemo from "../Agents/demos/plug";
import ShapeShiftDemo from "../Agents/demos/shapeShift";
import ToolCycleDemo from "../Agents/demos/toolCycle";
import WizardDemo from "../Agents/demos/wizard";

/**
 * How far the drawing reaches past the agent's box on each side, as a fraction of the box's size (0.5 on `top` is
 * half the box's height above it). 0 means the drawing stays inside the box on that side.
 */
export interface AgentReach {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface LandingAgentEntry {
  /** the /agent demo component, used as it is; it only takes `className`, which sets its size */
  Component: ComponentType<DemoProps>;
  /** what the agent shows, for screen readers, when a section gives the agent meaning (most are decorative) */
  label: string;
  reach: AgentReach;
  /**
   * the demo stacks several <Agent>s (or, for devices, positions its agent absolutely inside a wrapper): the slot
   * hides it until mounted, so the server-rendered layers never show misaligned or all at once
   */
  composite?: boolean;
}

/** The entry of family.tsx's `demos` list with this key (the five shapes, idling). */
function familyDemo(key: string): DemoEntry["Demo"] {
  const entry = familyDemos.find((d) => d.key === key);
  if (!entry) throw new Error(`Agents/demos/family.tsx has no demo "${key}"`);
  return entry.Demo;
}

/** a reach, side by side as in CSS (top, right, bottom, left) */
const r = (top: number, right: number, bottom: number, left: number): AgentReach => ({ top, right, bottom, left });

/**
 * The reach numbers were measured on the real /agent demos (2026-11-24, at the agents' state of commit a5193a44):
 * a production build of /agent opened in Chromium with motion on, a 1400x1600 viewport so every demo plays at once
 * (110x110 px boxes), sampled about every 60 ms for 60 s (two loops of the longest, toolCycle's 26.3 s). Each sample
 * took the union of the screen rects of every drawn element in the demo's figure (path, circle, rect... that is
 * displayed and not at opacity 0, plus half its stroke, clipped to its <svg> where that clips, and any <canvas>),
 * compared it with the demo's box (the figure's first element), and kept the maximum per side. The values here are
 * those maxima rounded up to 0.01 and floored at 0. They do not include the hover hop (a few % more upwards).
 * Re-measure with scripts/measure-agent-reach.mjs when the agents change.
 */
export const LANDING_AGENTS = {
  // the five shapes idling (family.tsx); the squircle is the pink logo agent's look
  squircle: { Component: familyDemo("squircle"), label: "The pink square Upmade agent", reach: r(0, 0, 0, 0) },
  circle: { Component: familyDemo("circle"), label: "The blue round Upmade agent", reach: r(0, 0, 0, 0) },
  triangle: { Component: familyDemo("triangle"), label: "The green triangular Upmade agent", reach: r(0, 0, 0, 0) },
  bullet: { Component: familyDemo("bullet"), label: "The yellow bullet-shaped Upmade agent", reach: r(0, 0, 0, 0) },
  pill: { Component: familyDemo("pill"), label: "The violet pill-shaped Upmade agent", reach: r(0, 0, 0, 0) },

  // hero
  toolCycle: {
    Component: ToolCycleDemo,
    label: "The pink Upmade agent drawing, erasing, juggling shapes, typing and taking a photo in turn",
    reach: r(0.64, 0.36, 0.11, 0.18),
  },

  // feature grid
  key: { Component: KeyDemo, label: "An agent revealing a golden key from behind its back", reach: r(0, 0, 0, 0.08) },
  handoff: {
    Component: HandoffDemo,
    label: "Two agents passing a document to each other",
    reach: r(0, 0.18, 0, 0.21),
    composite: true,
  },
  shapeShift: {
    Component: ShapeShiftDemo,
    label: "An agent changing shape from a circle to a triangle to a square",
    reach: r(0, 0, 0, 0),
    composite: true,
  },
  controlPanel: {
    Component: ControlPanelDemo,
    label: "An agent at a control panel, pressing a button that reshapes and repaints it",
    reach: r(0.04, 0.5, 0, 0.65),
  },
  devices: {
    Component: DevicesDemo,
    label: "An agent holding up a phone, then a tablet, then a laptop",
    reach: r(0, 0, 0, 0),
    composite: true,
  },
  book: { Component: BookDemo, label: "An agent speed-reading a book", reach: r(0, 0, 0, 0) },

  // showcase corners
  juggler: {
    Component: JugglerDemo,
    label: "An agent juggling a vase, an apple and a calculator",
    reach: r(0.71, 0.1, 0, 0.1),
  },
  frameworkSign: {
    Component: FrameworkSignDemo,
    label: "An agent holding up a sign that switches between React, Vue and Angular",
    reach: r(0.58, 0.12, 0, 0.02),
  },
  cyclingGlasses: {
    Component: CyclingGlassesDemo,
    label: "An agent putting on cycling glasses and crouching for speed",
    reach: r(0, 0.14, 0, 0),
  },

  // the other /agent demos, not used by a page yet
  cursor: { Component: CursorDemo, label: "An agent turning into a cursor arrow and clicking", reach: r(0, 0, 0, 0) },
  plug: { Component: PlugDemo, label: "An agent plugging a plug into a socket", reach: r(0, 0.03, 0, 0.03) },
  wizard: {
    Component: WizardDemo,
    label: "An agent conjuring a vase, an apple and a rabbit from a hat",
    reach: r(0.28, 0.13, 0, 0.23),
  },
  painter: {
    Component: PainterDemo,
    label: "An agent in a beret painting at an easel",
    reach: r(0.23, 0.01, 0, 0.31),
    composite: true,
  },
  lovestruck: {
    Component: LovestruckDemo,
    label: "A lovestruck agent with hearts bubbling up behind it",
    reach: r(1.7, 0.57, 0.04, 0.57),
  },
  hatSwap: { Component: HatSwapDemo, label: "An agent swapping hats", reach: r(0.51, 0, 0, 0) },
  bouquetReveal: {
    Component: BouquetDemo,
    label: "An agent pulling a bouquet out from behind its back",
    reach: r(0, 0.2, 0, 0),
  },
} satisfies Record<string, LandingAgentEntry>;

export type AgentKey = keyof typeof LANDING_AGENTS;

/**
 * Hook points for later wiring (plan §0/§3.5): the events each agent's animation emits that a section is expected to
 * pair with its media (the sign → the code typer, the glasses → the star board, the tool cycle ↔ the toolbar).
 * The demos do not forward their events yet, so nothing listens today; these names come from the animations'
 * `events` data (animations/frameworkSign.ts, cyclingGlasses.ts, toolCycle.ts) and tests/landing-agents.spec.ts
 * checks they are still there.
 */
export const AGENT_EVENTS = {
  frameworkSign: ["flip"],
  cyclingGlasses: ["glassesOn", "glassesOff"],
  toolCycle: [
    "tool:cursor",
    "tool:pen",
    "tool:eraser",
    "tool:arrow",
    "tool:shapeRectangle",
    "tool:type",
    "tool:image",
  ],
} as const satisfies Partial<Record<AgentKey, readonly string[]>>;

/** The event names an agent is expected to emit (`never` for one without events). */
export type AgentEventName<K extends AgentKey> = K extends keyof typeof AGENT_EVENTS
  ? (typeof AGENT_EVENTS)[K][number]
  : never;

/** The reach of an agent drawn `sizePx` wide and high, in px per side. */
export function reachInsets(key: AgentKey, sizePx: number): AgentReach {
  const { top, right, bottom, left } = LANDING_AGENTS[key].reach;
  const px = (f: number) => Math.ceil(f * sizePx);
  return { top: px(top), right: px(right), bottom: px(bottom), left: px(left) };
}

/**
 * Padding that makes room for an agent's reach around a box of `sizePx`, for a container that must not clip it or
 * let it run into its neighbours (e.g. `style={reachPadding("juggler", 96)}`). Pass `"margin"` for the same space
 * as margin.
 */
export function reachPadding(key: AgentKey, sizePx: number, as: "padding" | "margin" = "padding") {
  const { top, right, bottom, left } = reachInsets(key, sizePx);
  return { [as]: `${top}px ${right}px ${bottom}px ${left}px` } as { padding?: string; margin?: string };
}
