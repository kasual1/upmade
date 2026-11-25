/**
 * The star board's geometry and drift speed, free of React and the DOM (unit-tested in tests/landing-star-board.spec.ts).
 *
 * Geometry (ported from the design's script and Landing/PerformanceDemo.tsx): rows of star buttons laid out like
 * brickwork, every other row shifted by half a button, spilling past every edge. Positions and sizes are in % of
 * the board, which is the stage (STAGE_W x STAGE_H, the 16:11 frame); the board is drawn rotated -8deg and scaled
 * up by BOARD_SCALE so its corners stay covered, so sizes are divided by it to keep the buttons 19% x 8.4% of the
 * frame on screen.
 */

/** the virtual stage the board is laid out on (ScaledStage), 16:11 like its frame */
export const STAGE_W = 560;
export const STAGE_H = 385;

export const BOARD_SCALE = 1.2;
export const STAR_W = 19 / BOARD_SCALE;
export const STAR_H = 8.4 / BOARD_SCALE;
/** the frame's height as a share of its width, to turn widths into heights */
const ASPECT = STAGE_H / STAGE_W;
/** the same space between buttons both ways, in % of the width */
const GAP = 2.1 / BOARD_SCALE;
/** how far one column is from the next, in % of the board's width: the drift moves the board by one pitch per loop */
export const PITCH = STAR_W + GAP;
const ROW = STAR_H + GAP / ASPECT;
const TOP = -3;
const STARTS = [GAP - PITCH / 2, GAP];

export interface StarPosition {
  /** left and top, in % of the board */
  x: number;
  y: number;
}

/** Every button's position; one extra column on the right, so the drift to the left never shows a gap. */
export function starPositions(): StarPosition[] {
  const stars: StarPosition[] = [];
  for (let r = 0; TOP + r * ROW < 100; r++) {
    for (let x = STARTS[r % 2]; x < 100 + PITCH; x += PITCH) stars.push({ x, y: TOP + r * ROW });
  }
  return stars;
}

/**
 * The star's label size in virtual px: the design's `2.75cqw / 1.2` of a 560px wide frame (12.83px). It is a real
 * font size of 12px or more; the stage's transform does the shrinking (plan §3.7).
 */
export const LABEL_PX = (2.75 * STAGE_W) / 100 / BOARD_SCALE;

/* ---- the drift ---- */

/** one loop (the board moves one PITCH to the left), at the steady speed */
export const DRIFT_MS = 6000;

/**
 * The glasses agent's pairing (plan §3.5): while it wears its glasses ("glassesOn" to "glassesOff") the board speeds
 * up to FAST times its speed, then coasts back (the design's L1077-1088, driven by the agent's events instead of
 * polling its SMIL clock).
 */
export const FAST = 30;
/** seconds to gather speed after "glassesOn" */
export const RAMP_UP_S = 0.9;
/** seconds to coast back to the steady speed after "glassesOff" */
export const COAST_S = 1.75;
/**
 * the glasses stay on for 2.3 s (animations/cyclingGlasses.ts: on at 1.3 s, off at 3.6 s); with no "glassesOff" this
 * long after "glassesOn" (the agent stopped, e.g. scrolled out of view while the board is still on screen), the board
 * coasts back by itself rather than racing on
 */
export const GLASSES_ON_MAX_S = 3;

export type RampKind = "up" | "down";

/** smooth start and finish, like a vehicle gathering speed */
function easeInOutCubic(p: number): number {
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

/** How long a ramp of this kind takes, in seconds. */
export function rampDuration(kind: RampKind): number {
  return kind === "up" ? RAMP_UP_S : COAST_S;
}

/**
 * The playback rate `t` seconds into a ramp that started at rate `from`: "up" eases to FAST, "down" coasts to 1,
 * shedding most of its speed early, then rolling out gently. Starting from the rate it has (not 1 or FAST), a ramp
 * that interrupts another never jumps.
 */
export function rampRate(kind: RampKind, from: number, t: number): number {
  const p = Math.min(1, Math.max(0, t / rampDuration(kind)));
  if (kind === "up") return from + (FAST - from) * easeInOutCubic(p);
  return 1 + (from - 1) * Math.pow(1 - p, 3);
}

/** Which ramp an agent event starts, if any. */
export function rampFor(event: string): RampKind | null {
  if (event === "glassesOn") return "up";
  if (event === "glassesOff") return "down";
  return null;
}
