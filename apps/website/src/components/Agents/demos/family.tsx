import Agent, { type GazeStyle } from "../Agent";
import { idle } from "../animations";
import type { Colour, ShapeName } from "../tokens";
import type { DemoProps } from "./types";

/**
 * The five shapes, idling, their eyes on the pointer. Each is its own demo entry so they line up in the grid with
 * the others. Together they're the /agentic hero's crew, so each watches the cursor in its own way rather than all in
 * lockstep:
 *   squircle  attentive: steady, blinks as it notices the cursor moving again, now and then looks away
 *   circle    curious: darts after it, turns its eyes furthest, glances about often
 *   triangle  laid-back: lags behind, turns less, loses interest soon
 *   bullet    easily distracted: keeps glancing elsewhere, and notices the cursor with a blink
 *   pill      shy: follows only a little and slowly, keeps watching longest, never looks away
 * They all idle with the same animation, so each starts it at its own point (`start`, ms into idle's 4.8 s loop) and
 * plays it at its own pace (`rate`): their blinks never fall together (the starts keep every blink at least 200 ms from
 * the others', as far apart as idle's own double blink) and their glances drift apart over time.
 */
const FAMILY: Array<[ShapeName, Colour, GazeStyle, { start: number; rate: number }]> = [
  ["squircle", "pink", { ease: 0.18, range: 1, wander: 5200, notice: true }, { start: 0, rate: 1 }],
  ["circle", "blue", { ease: 0.3, range: 1.15, linger: 2000, wander: 3200 }, { start: 400, rate: 1.04 }],
  ["triangle", "green", { ease: 0.07, range: 0.8, linger: 1400, wander: 6500 }, { start: 800, rate: 0.95 }],
  ["bullet", "yellow", { ease: 0.15, range: 1, wander: 2200, notice: true }, { start: 1200, rate: 1.08 }],
  ["pill", "violet", { ease: 0.1, range: 0.65, linger: 4000 }, { start: 3000, rate: 0.92 }],
];

export const demos = FAMILY.map(([shape, colour, gaze, pace], k) => ({
  key: shape,
  label: shape,
  order: k,
  Demo: ({ className }: DemoProps) => (
    <Agent
      className={className}
      shape={shape}
      colour={colour}
      animation={idle}
      start={pace.start}
      rate={pace.rate}
      followPointer
      gaze={gaze}
    />
  ),
}));
