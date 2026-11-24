import type { AgentAnimation, Blink, PropTrack, Span, Track, Vec } from "../types";
import type { Paint } from "../props/painter/Brush";

/**
 * Paints at an easel, for the violet circle in a beret: it dabs at the canvas with a brush, steps back three times
 * a loop (leaning back, squinting at its work, leaning in again for a closer look, then back to painting), and the
 * brush's paint changes from green to blue to yellow every two seconds.
 *
 * Ported from the landing page's SMIL agent (6 s loop, every channel linear except the breathing). Its keyTimes and
 * values are kept as they are in the original (the `smil()` strings below) so they can be checked against it.
 *
 * The original draws the painter (body, eyes, beret) at 0.62, its feet (32 49) placed at (17 51), and leans it
 * about those feet; the brush hand and the easel are full size and do not lean. The rig cannot keep a prop out of
 * the body's lean and scale, so the demo draws two agents on top of each other, both in the whole demo box:
 *   - `painter`: the painter itself, drawn at 0.62 by its body scale (times the breathing) and moved into place by
 *     a constant body shift and lift (PAINTER_SHIFT). Its own hands wait out of sight behind its body. Its eyes
 *     squint and blink with the original's timing and linear ramps (`blinks`).
 *   - `painterStage`: an agent with no body (an empty outline, its eyes hidden) that holds the brush hand, the brush
 *     and the easel as full-size props, in the original's own coordinates. Its rig hands wait behind the easel.
 *   The two share one box on purpose: each agent pauses while its own box is off screen, so two different boxes
 *   would pause at different scroll positions and drift apart (the brush hand out of step with the lean).
 * Props of `painter`: `beret`. Props of `painterStage`: `brushGreen`, `brushBlue`, `brushYellow` (one is shown at a
 * time), `hand` and `easel`.
 * Events (on `painter`): `judge` as it leans back to look at the canvas.
 */
const D = 6000;
const at = (f: number) => Math.round(f * D);

/** A SMIL `values` / `keyTimes` pair as a linear track ("x y" pairs, or single numbers as [n, 0]). */
function smil(values: string, keyTimes: string): Track<Vec> {
  const ts = keyTimes.split(";").map(Number);
  return values.split(";").map((v, n) => {
    const [x, y = 0] = v.trim().split(/\s+/).map(Number);
    return [at(ts[n]), [x, y] as Vec, "linear"] as const;
  });
}
const xs = (track: Track<Vec>): Track<number> => track.map(([t, v, e]) => [t, v[0], e] as const);

// ---- the original's channels ----

/** The lean (deg, about the feet): three times a loop it leans back (-8), in a little (-4) for a closer look, back
 *  (-8), and upright again to paint. */
const lean = xs(smil(
  "0;0;-8;-8;-4;-8;0;0;-8;-8;-4;-8;0;0;-8;-8;-4;-8;0;0",
  "0;0.18;0.217;0.263;0.28;0.297;0.325;0.513;0.55;0.597;0.613;0.63;0.658;0.847;0.883;0.93;0.947;0.963;0.992;1"));

/** The gaze: at the canvas (2.2 -.4) while painting, a little higher (1.6 -1) while it stands back judging. */
const look = smil(
  "2.2 -.4;2.2 -.4;2.2 -.4;1.6 -1;1.6 -1;2.2 -.4;2.2 -.4;2.2 -.4;1.6 -1;1.6 -1;2.2 -.4;2.2 -.4;2.2 -.4;1.6 -1;1.6 -1;2.2 -.4;2.2 -.4",
  "0;0.008;0.15;0.2;0.317;0.33;0.342;0.483;0.533;0.65;0.663;0.675;0.817;0.867;0.983;0.997;1");

/** The brush hand (full size, the drawing's coordinates before the 1 up): from its rest at (27.5 46.5) a zigzag
 *  of strokes up the canvas's left side, then a quick hatching higher up, then a little circle, each followed by a
 *  return to rest. */
const handPath = smil(
  "27.5 46.5;27.5 46.5;28.07 38.2;28.7 34;29.33 36.6;30.05 33;31.13 38;27.5 46.5;27.5 46.5;28.12 23.8;28.66 21.6;29.2 23.8;29.74 21.6;30.28 23.8;30.82 21.6;31.08 22.6;27.5 46.5;27.5 46.5;29.24 27.6;29.47 27.95;29.65 28.9;29.71 30.2;29.65 31.5;29.47 32.45;29.24 32.8;29.01 32.45;28.83 31.5;28.77 30.2;28.83 28.9;29.01 27.95;29.24 27.6;27.5 46.5;27.5 46.5",
  "0;0.003;0.025;0.053;0.075;0.102;0.142;0.175;0.337;0.358;0.38;0.401;0.422;0.444;0.465;0.475;0.508;0.67;0.692;0.701;0.711;0.721;0.731;0.74;0.75;0.76;0.769;0.779;0.789;0.799;0.808;0.842;1");

// ---- the eyes: the slow blink and the three squints ----

/** The original's eye scale channels, as blinks (ms against the 6 s loop). The squint (eyes at .42 of their height)
 *  closes over 0.203..0.22 of the loop, holds to 0.27 and opens by 0.287, and again at 0.537 and 0.87; the slow blink
 *  (a separate channel, multiplied in, down to .08) closes over 0.083..0.097 and opens by 0.12. The two never
 *  overlap, so taking the minimum is the same as the original's product. Both channels are linear, as are the blinks. */
const SQUINT = { close: at(0.22) - at(0.203), hold: at(0.27) - at(0.22), open: at(0.287) - at(0.27), depth: 0.42, ease: "linear" } as const;
const blinks: Blink[] = [
  { at: at(0.097), close: at(0.097) - at(0.083), open: at(0.12) - at(0.097), hold: 0, depth: 0.08, ease: "linear" },
  { at: at(0.22) },
  { at: at(0.553), close: at(0.553) - at(0.537) },
  { at: at(0.887), open: at(0.953) - at(0.937) },
];

// ---- the painter ----

/** The size the original draws the painter at. */
const SIZE = 0.62;
/** The rig scales and leans the body about its feet F (32 49.6), the original about (32 49): F + shift + SIZE x
 *  ((32 49) - F) must land at (17 51), so the shift is (17 51) + SIZE x (0 .6) - F. (The lean's pivot then sits .37
 *  below the original's, under .05 units of drift at the -8 deg lean.) */
const FEET: Vec = [32, 49.6];
const PAINTER_SHIFT: Vec = [17 - FEET[0], 51 + SIZE * (FEET[1] - 49) - FEET[1]];
/** the painter and its stage are drawn at the original card's size; both layers take the same frame */
const FRAME = { scale: SIZE, ground: FEET[1] + PAINTER_SHIFT[1] };

/** The painter's size times its breathing: 1.02 wide and .98 tall, and back, every 2 s (the rig's `breathe` only
 *  scales the height, once per 3 s here). */
const breathe: Track<Vec> = Array.from(
  { length: D / 1000 + 1 },
  (_, n) => [n * 1000, (n % 2 ? [SIZE * 1.02, SIZE * 0.98] : [SIZE, SIZE]) as Vec] as const,
);

export const painter: AgentAnimation = {
  duration: D,
  // drawn at the original card's size and height: the box shows it at the family's (see `frame`)
  frame: FRAME,
  // the original holds its first frame with reduced motion (the feature icons are designed to read as a still there)
  rest: 0,
  // drawn at 0.62 (the squash) and placed by a constant shift and lift, so its feet (32 49) land at (17 51)
  body: { shift: [[0, PAINTER_SHIFT[0]]], lift: [[0, PAINTER_SHIFT[1]]], lean, squash: breathe },
  eyes: { look, blinks, blink: SQUINT },
  // out of sight behind the body: the original painter has no hands of its own (the brush hand is the stage's)
  hands: {
    L: { path: [[0, [28, 36]]], behind: [[0, D]] },
    R: { path: [[0, [36, 36]]], behind: [[0, D]] },
  },
  props: {
    beret: { attach: "head" },
  },
  events: [[at(0.18), "judge"], [at(0.513), "judge"], [at(0.847), "judge"]],
};

// ---- the stage: brush hand, brush and easel, full size ----

/** The whole original drawing sits 1 up. */
const UP = -1;
const PAINT_SPANS: Record<Paint, Span> = { green: [0, 2000], blue: [2000, 4000], yellow: [4000, D] };
/** The brush hand's path, 1 up. */
const handOffset: Track<Vec> = handPath.map(([t, [x, y], e]) => [t, [x, y + UP] as Vec, e] as const);
/** A brush loaded with one paint, in the hand and tilted 40 deg towards the canvas, shown while that paint is on. */
const brush = (paint: Paint): PropTrack => ({
  attach: "world",
  offset: handOffset,
  rotate: [[0, 40]],
  visible: [PAINT_SPANS[paint]],
});
/** Where the stage's unused rig hands wait: (41 30) of the full drawing, under the easel's canvas. */
const PARKED: Vec = [41, 30];

export const painterStage: AgentAnimation = {
  duration: D,
  // drawn at the original card's size and height: the box shows it at the family's (see `frame`)
  frame: FRAME,
  rest: 0,
  // no body: an empty outline (nothing is stroked for a zero-length path with butt caps) and no eyes
  body: { outline: [[0, "M0 0Z"]] },
  eyes: { hidden: [[0, D]] },
  // the rig hands wait behind the layer the easel is in, where the canvas hides them
  hands: {
    L: { path: [[0, PARKED]], behind: [[0, D]] },
    R: { path: [[0, PARKED]], behind: [[0, D]] },
  },
  // drawn in this order, as in the original: the brush, the hand over its handle, then the easel over both
  props: {
    brushGreen: brush("green"),
    brushBlue: brush("blue"),
    brushYellow: brush("yellow"),
    // at the painter's size (the frame zooms this stage by 1 / SIZE), like every agent's hand
    hand: { attach: "world", offset: handOffset, scale: [[0, SIZE]] },
    easel: { attach: "world", offset: [[0, [0, UP]]] },
  },
};
