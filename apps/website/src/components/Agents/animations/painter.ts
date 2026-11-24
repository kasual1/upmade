import { sample } from "../timeline";
import type { AgentAnimation, PropTrack, Span, Track, Vec } from "../types";
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
 * about those feet; the brush hand and the easel are full size and do not lean. The rig can neither move its body
 * sideways nor keep a prop out of the body's lean and scale, so the demo draws two agents on top of each other:
 *   - `painter`: the painter itself, drawn by the demo at 0.62 of the box and placed so its feet land at (17 51)
 *     (see demos/painter.tsx). Its own hands wait out of sight behind its body.
 *   - `painterStage`: a full-size agent with no body (an empty outline, its eyes hidden) that holds the brush
 *     hand, the brush and the easel as props, in the original's full-size coordinates (the whole drawing sits 1 up).
 *     Its rig hands wait out of sight behind the easel.
 * Props of `painter`: `beret` and the squint frames `squint0`..`squint<n>` (see SQUINT_SY). Props of
 * `painterStage`: `brushGreen`, `brushBlue`, `brushYellow` (one is shown at a time), `hand` and `easel`.
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
const ys = (track: Track<Vec>): Track<number> => track.map(([t, v, e]) => [t, v[1], e] as const);

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

/** The squint (eye height): narrows to .42 as it leans back, held while it judges. */
const squint = ys(smil(
  "1 1;1 1;1 .42;1 .42;1 1;1 1;1 .42;1 .42;1 1;1 1;1 .42;1 .42;1 1;1 1",
  "0;0.203;0.22;0.27;0.287;0.537;0.553;0.603;0.62;0.87;0.887;0.937;0.953;1"));

/** One slow blink, early in the loop (shut, .08, at .097), on its own channel in the original. */
const blink = ys(smil("1 1;1 1;1 .08;1 1;1 1", "0;0.083;0.097;0.12;1"));

/** The brush hand (full size, the drawing's coordinates before the 1 up): from its rest at (27.5 46.5) a zigzag
 *  of strokes up the canvas's left side, then a quick hatching higher up, then a little circle, each followed by a
 *  return to rest. */
const handPath = smil(
  "27.5 46.5;27.5 46.5;28.07 38.2;28.7 34;29.33 36.6;30.05 33;31.13 38;27.5 46.5;27.5 46.5;28.12 23.8;28.66 21.6;29.2 23.8;29.74 21.6;30.28 23.8;30.82 21.6;31.08 22.6;27.5 46.5;27.5 46.5;29.24 27.6;29.47 27.95;29.65 28.9;29.71 30.2;29.65 31.5;29.47 32.45;29.24 32.8;29.01 32.45;28.83 31.5;28.77 30.2;28.83 28.9;29.01 27.95;29.24 27.6;27.5 46.5;27.5 46.5",
  "0;0.003;0.025;0.053;0.075;0.102;0.142;0.175;0.337;0.358;0.38;0.401;0.422;0.444;0.465;0.475;0.508;0.67;0.692;0.701;0.711;0.721;0.731;0.74;0.75;0.76;0.769;0.779;0.789;0.799;0.808;0.842;1");

// ---- the eyes: the squint and the blink as frames ----

/** How open the eyes are at t: the squint and the blink scale the eyes about the same middle, one after the other. */
const openAt = (t: number) => sample(squint, t, 1) * sample(blink, t, 1);
/** The eye heights the frames are drawn at (the squint holds at .42, the blink shuts to .08). */
export const SQUINT_SY = [0.08, 0.2, 0.32, 0.42, 0.53, 0.65, 0.77, 0.88] as const;
/** Every STEP ms the eyes show the frame nearest their openness, or the rig's own eyes when they are (nearly) open. */
const STEP = 20;
const frameSpans: Span[][] = SQUINT_SY.map(() => []);
const hidden: Span[] = [];
const addSpan = (list: Span[], a: number, b: number) => {
  const last = list[list.length - 1];
  if (last && last[1] === a) list[list.length - 1] = [last[0], b];
  else list.push([a, b]);
};
for (let t = 0; t < D; t += STEP) {
  const o = openAt(t + STEP / 2);
  if (o > 0.94) continue;
  let k = 0;
  SQUINT_SY.forEach((sy, n) => {
    if (Math.abs(sy - o) < Math.abs(SQUINT_SY[k] - o)) k = n;
  });
  addSpan(frameSpans[k], t, t + STEP);
  addSpan(hidden, t, t + STEP);
}
/** Squint frame k: in the body's own space, like the rig's eyes, moving with the gaze. */
const squintFrame = (k: number): PropTrack => ({ attach: "world", offset: look, visible: frameSpans[k] });

// ---- the painter ----

/** The painter's breathing: 1.02 wide and .98 tall, and back, every 2 s (the rig's `breathe` only scales the height,
 *  once per 3 s here). */
const breathe: Track<Vec> = Array.from({ length: D / 1000 + 1 }, (_, n) => [n * 1000, (n % 2 ? [1.02, 0.98] : [1, 1]) as Vec] as const);

export const painter: AgentAnimation = {
  duration: D,
  // mid-stroke, brush on the canvas, before the blink
  rest: 300,
  body: { lean, squash: breathe },
  eyes: { look, hidden },
  // out of sight behind the body: the original painter has no hands of its own (the brush hand is the stage's)
  hands: {
    L: { path: [[0, [28, 36]]], behind: [[0, D]] },
    R: { path: [[0, [36, 36]]], behind: [[0, D]] },
  },
  props: {
    ...Object.fromEntries(SQUINT_SY.map((_, k) => [`squint${k}`, squintFrame(k)])),
    beret: { attach: "head" },
  },
  events: [[at(0.18), "judge"], [at(0.513), "judge"], [at(0.847), "judge"]],
};

// ---- the stage: brush hand, brush and easel, full size ----

/** The whole original drawing sits 1 up. */
const UP = -1;
const PAINT_SPANS: Record<Paint, Span> = { green: [0, 2000], blue: [2000, 4000], yellow: [4000, D] };
const handOffset: Track<Vec> = handPath.map(([t, [x, y], e]) => [t, [x, y + UP], e] as const);
/** A brush loaded with one paint, in the hand and tilted 40 deg towards the canvas, shown while that paint is on. */
const brush = (paint: Paint): PropTrack => ({ attach: "world", offset: handOffset, rotate: [[0, 40]], visible: [PAINT_SPANS[paint]] });

export const painterStage: AgentAnimation = {
  duration: D,
  rest: 300,
  // no body: an empty outline (nothing is stroked for a zero-length path with butt caps) and no eyes
  body: { outline: [[0, "M0 0Z"]] },
  eyes: { hidden: [[0, D]] },
  // the rig hands wait behind the layer the easel is in, where the canvas hides them
  hands: {
    L: { path: [[0, [41, 30]]], behind: [[0, D]] },
    R: { path: [[0, [41, 30]]], behind: [[0, D]] },
  },
  // drawn in this order, as in the original: the brush, the hand over its handle, then the easel over both
  props: {
    brushGreen: brush("green"),
    brushBlue: brush("blue"),
    brushYellow: brush("yellow"),
    hand: { attach: "world", offset: handOffset },
    easel: { attach: "world", offset: [[0, [0, UP]]] },
  },
};
