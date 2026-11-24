import { sample } from "../timeline";
import { SHAPES } from "../tokens";
import type { AgentAnimation, PropTrack, Span, Track, Vec } from "../types";

/**
 * Speed-reads a book, for the orange triangle: it sits behind an open indigo book, eyes darting along the lines,
 * flicking three pages over with its right hand; then it squints, scratching its head, glances down again, and reads
 * and flicks three more pages before a last few glances along the lines.
 * Props (all drawn by the demo): `book`, the page frames `page0`..`page15`, the eye frames `eye0`, `eye1`... (for the
 * squint and the blinks) and the hands `handL`, `handR`. Event: `turn` as each page starts to turn.
 *
 * Ported from the landing page's SMIL agent (4.8 s loop, every channel linear). Its keyTimes and values are kept as
 * they are in the original (the `smil()` strings below) so they can be checked against it.
 *
 * The original draws only the body (with its eyes) at 0.78, about its feet, and bobs it; the book and the hands are
 * full size and do not bob, and the whole drawing sits 3 units up. The 0.78 is baked into the body squash; the rig
 * squashes and lifts its props with the body, so the props are placed through the inverse (`unsquash`) and scaled
 * by 1 / 0.78. The rig's own hands would shrink with the body, so they wait out of sight behind it and the hands are
 * props.
 */
const D = 4800;
const at = (f: number) => Math.round(f * D);
const SCALE = 0.78;
const FEET = SHAPES.triangle.feet;

/** A SMIL `values` / `keyTimes` pair as a linear track ("x y" pairs, or single numbers). */
function smil(values: string, keyTimes: string): Track<Vec> {
  const ts = keyTimes.split(";").map(Number);
  return values.split(";").map((v, n) => {
    const [x, y = 0] = v.trim().split(/\s+/).map(Number);
    return [at(ts[n]), [x, y] as Vec, "linear"] as const;
  });
}
const ys = (track: Track<Vec>): Track<number> => track.map(([t, v, e]) => [t, v[1], e] as const);

// ---- the original's channels ----

/** The body's bob (y): two little dips as the first pages turn, a lift (-.5) while it squints, two dips again. */
const bob = ys(smil("0 0;0 .6;0 0;0 .6;0 0;0 0;0 -.5;0 -.5;0 0;0 .6;0 0;0 .6;0 0;0 0",
  "0;0.021;0.079;0.138;0.198;0.292;0.317;0.396;0.421;0.521;0.579;0.637;0.698;1"));

/** Where the eyes look: down at the book (0 1.4), darting right and left along the lines, up-left (-1.6 -1.4) while
 *  squinting, back down to read again, and a last few glances. */
const look = smil(
  "0 1.4;1.6 1.6;-1.6 1.6;1.6 1.6;-1.6 1.6;1.6 1.6;-1.6 1.6;-1.8 1.4;1.6 1.6;-1.6 -1.4;-1.6 -1.4;-1.2 1.6;.6 1.6;0 1.4;0 1.4;1.6 1.6;-1.6 1.6;1.6 1.6;-1.6 1.6;1.6 1.6;-1.6 1.6;-1.8 1.4;-1.2 1.6;1 1.4;1.8 1.6;-1.8 2;-1 2;1.4 2;0 1.4;0 1.4",
  "0;0.021;0.05;0.079;0.108;0.138;0.167;0.208;0.263;0.296;0.404;0.433;0.471;0.492;0.5;0.521;0.55;0.579;0.608;0.637;0.667;0.708;0.771;0.783;0.846;0.863;0.925;0.938;0.988;1",
);

/** The right hand's offset from its spot on the book's corner (48.2 52.6): three flicks of a page (-1.4 -1.6), up
 *  to the head (-8.6 -26.2) scratching it five times, back down, three more flicks. */
const handROffset = smil(
  "0 0;0 0;-1.4 -1.6;0 0;0 0;-1.4 -1.6;0 0;0 0;-1.4 -1.6;0 0;0 0;-8.6 -26.2;-8.0 -24.8;-8.6 -26.2;-8.0 -24.8;-8.6 -26.2;-8.0 -24.8;-8.6 -26.2;-8.0 -24.8;-8.6 -26.2;0 0;0 0;-1.4 -1.6;0 0;0 0;-1.4 -1.6;0 0;0 0;-1.4 -1.6;0 0;0 0",
  "0;0.013;0.033;0.062;0.071;0.092;0.121;0.129;0.15;0.179;0.271;0.312;0.323;0.333;0.344;0.354;0.365;0.375;0.385;0.396;0.433;0.512;0.533;0.562;0.571;0.592;0.621;0.629;0.65;0.679;1",
);

/** The six page turns (from, to): a page is shown only while it turns, its width going 1 to -1 about the spine. */
const TURNS: readonly Span[] = [
  [0.021, 0.075], [0.079, 0.133], [0.138, 0.192], [0.521, 0.575], [0.579, 0.633], [0.637, 0.692],
].map(([a, b]) => [at(a), at(b)] as const);
/** How many frames show a turning page (one per display frame, ~16 ms, for the ~260 ms turn). */
export const PAGE_FRAMES = 16;
/** The width of each page frame: the squeeze at the middle of its slot of the turn. */
export const PAGE_SX = Array.from({ length: PAGE_FRAMES }, (_, k) => 1 - (2 * (k + 0.5)) / PAGE_FRAMES);

/** The eyes' height (a vertical scale about their middle), as in the original: they narrow to .62 for the squint
 *  (.283 to .304), hold, widen again (.396 to .417), and blink twice, shutting to .08 at .463 and .9 (closing in
 *  ~62 ms, opening in ~77 ms and ~100 ms). */
const eyeHeight = ys(smil("1 1;1 1;1 .62;1 .62;1 1;1 1;1 .08;1 1;1 1;1 .08;1 1;1 1",
  "0;0.283;0.304;0.396;0.417;0.45;0.463;0.479;0.887;0.9;0.921;1"));
/** The rig's eyes can only blink, and only with its own fixed 90 ms blink, so wherever the eyes are not fully open
 *  they are hidden and a frame of narrowed eyes stands in: each change is cut into slots of about one display frame
 *  (16 ms), each showing the height at the slot's middle (rounded to .02, so frames are shared); the held squint is
 *  one slot. */
const EYE_SLOT = 16;
const eyeSlots: Array<{ sy: number; span: Span }> = [];
for (let n = 1; n < eyeHeight.length; n++) {
  const [t0, v0] = eyeHeight[n - 1], [t1, v1] = eyeHeight[n];
  if (v0 === 1 && v1 === 1) continue;
  const count = v0 === v1 ? 1 : Math.max(1, Math.round((t1 - t0) / EYE_SLOT));
  for (let k = 0; k < count; k++) {
    const sy = Math.round((v0 + ((v1 - v0) * (k + 0.5)) / count) * 50) / 50;
    if (sy < 1) eyeSlots.push({ sy, span: [Math.round(t0 + ((t1 - t0) * k) / count), Math.round(t0 + ((t1 - t0) * (k + 1)) / count)] });
  }
}
/** The heights of the eye frames `eye0`, `eye1`... (the demo draws one `Squint` per height). */
export const EYE_SY = [...new Set(eyeSlots.map((e) => e.sy))].sort((a, b) => b - a);
/** Eye frame k is shown in every slot of its height; it sits in the body's own (scaled) space, like the rig's eyes,
 *  and moves with the gaze. */
const eyeFrame = (k: number): PropTrack => ({
  attach: "world",
  offset: look,
  visible: eyeSlots.filter((e) => e.sy === EYE_SY[k]).map((e) => e.span),
});
/** While any eye frame shows, the rig's eyes are hidden (the slots run back to back within each change). */
const EYES_HIDDEN: Span[] = eyeSlots
  .map((e) => e.span)
  .sort((a, b) => a[0] - b[0])
  .reduce<Span[]>((out, [a, b]) => {
    const last = out[out.length - 1];
    if (last && a <= last[1]) out[out.length - 1] = [last[0], Math.max(last[1], b)];
    else out.push([a, b]);
    return out;
  }, []);

// ---- placing the props ----

/** The body's lift in the rig: the original's 0.78 about (32 49) placed at (32 47.5) (50.5 less the 3 up), against
 *  the rig's 0.78 about the triangle's feet, plus the bob. */
const BASE_LIFT = 47.5 - SCALE * 49 - (1 - SCALE) * FEET[1];
const lift: Track<number> = bob.map(([t, v, e]) => [t, BASE_LIFT + v, e] as const);

/** A point of the original drawing, placed so the rig's lift and squash put it back where it was. */
const unsquash = (p: Vec, t: number): Vec => {
  const l = sample(lift, t, BASE_LIFT);
  return [FEET[0] + (p[0] - FEET[0]) / SCALE, FEET[1] + (p[1] - l - FEET[1]) / SCALE];
};
/** Every key time of the given tracks; all the channels are linear, so sampling at their keys is exact. */
const keyTimes = (...tracks: Track<unknown>[]) =>
  [...new Set(tracks.flatMap((tr) => tr.map(([t]) => t)).concat([0, D]))].sort((a, b) => a - b);
/** An offset track holding a point of the original still while the body bobs. */
const still = (p: Vec): Track<Vec> => keyTimes(lift).map((t) => [t, unsquash(p, t), "linear"] as const);
/** A prop of the original's full-size layer (book, page, hand): fixed in place, at full size. */
const fullSize = (p: Vec, extra: Partial<PropTrack> = {}): PropTrack => ({ attach: "world", offset: still(p), scale: [[0, 1 / SCALE]], ...extra });

/** The book's (and the pages') origin: the middle of the spine. */
const SPINE: Vec = [32, 52];
const HAND_L: Vec = [15.8, 52.6];
const HAND_R: Vec = [48.2, 52.6];

/** Page frame k is shown in the k-th slot of every turn. */
const pageFrame = (k: number): PropTrack =>
  fullSize(SPINE, {
    visible: TURNS.map(([a, b]) => [Math.round(a + ((b - a) * k) / PAGE_FRAMES), Math.round(a + ((b - a) * (k + 1)) / PAGE_FRAMES)] as const),
  });


export const book: AgentAnimation = {
  duration: D,
  // reading, between the first page turns and the squint
  rest: at(0.23),
  body: {
    // the original's outline, which rounds its bottom corners a little differently from the family's triangle
    outline: [[0,
      "M25.82 16.10L26.43 15.23L27.17 14.46L28.00 13.81L28.92 13.29L29.91 12.91L30.94 12.68L32.00 12.60L33.06 12.68L34.09 12.91L35.08 13.29L36.00 13.81L36.83 14.46L37.57 15.23L38.18 16.10L39.68 18.61L41.19 21.12L42.69 23.63L44.20 26.14L45.70 28.65L47.21 31.16L48.71 33.68L50.22 36.19L51.73 38.70L52.21 39.67L52.55 40.70L52.72 41.77L52.74 42.85L52.59 43.93L52.28 44.97L51.81 45.95L51.21 46.85L50.48 47.65L49.63 48.33L48.70 48.88L47.69 49.28L46.63 49.52L45.55 49.60L42.54 49.60L39.53 49.60L36.52 49.60L33.51 49.60L30.49 49.60L27.48 49.60L24.47 49.60L21.46 49.60L18.45 49.60L17.37 49.52L16.31 49.28L15.30 48.88L14.37 48.33L13.52 47.65L12.79 46.85L12.19 45.95L11.72 44.97L11.41 43.93L11.26 42.85L11.28 41.77L11.45 40.70L11.79 39.67L12.27 38.70L13.78 36.19L15.29 33.68L16.79 31.16L18.30 28.65L19.80 26.14L21.31 23.63L22.81 21.12L24.32 18.61Z"]],
    squash: [[0, [SCALE, SCALE]]],
    lift,
  },
  eyes: {
    look,
    // no rig blinks: the squint and the two blinks are drawn by the eye frames (see eyeHeight)
    hidden: EYES_HIDDEN,
  },
  hands: {
    L: { path: [[0, [28, 40]]], behind: [[0, D]] },
    R: { path: [[0, [36, 40]]], behind: [[0, D]] },
  },
  // drawn in this order: eye frames, pages, then the book over the pages' feet, then the hands over the book
  props: {
    ...Object.fromEntries(EYE_SY.map((_, k) => [`eye${k}`, eyeFrame(k)])),
    ...Object.fromEntries(PAGE_SX.map((_, k) => [`page${k}`, pageFrame(k)])),
    book: fullSize(SPINE),
    handL: fullSize(HAND_L),
    handR: {
      attach: "world",
      offset: keyTimes(lift, handROffset).map((t) => {
        const o = sample(handROffset, t, [0, 0]);
        return [t, unsquash([HAND_R[0] + o[0], HAND_R[1] + o[1]], t), "linear"] as const;
      }),
      scale: [[0, 1 / SCALE]],
    },
  },
  events: TURNS.map(([a]) => [a, "turn"] as const),
};
