import { lerpPath, sample } from "../timeline";
import { SHAPES } from "../tokens";
import type { AgentAnimation, PropTrack, Span, Track, Vec } from "../types";

/**
 * Customizes itself at a control panel, for the pink squircle: it stands behind a grey desk with a big red button
 * and presses the button four times, every 2.2 s, giving a little hop after each press. The first press squares
 * off its corners, the second makes it grow (from 0.8 to 0.98, with an overshoot), the third paints it orange,
 * and a shine sweeps across it; the fourth puts everything back (round corners, 0.8, pink).
 * Props (all drawn by the demo): `tintOrange` and the frames `tintPink0`..`tintPink31` (the colour cross-fades),
 * the shine frames `gloss0`..`gloss39`, `button`, `panel`, `hand` and `handOrange` (the hand's orange coat).
 * Events: `press` as the hand pushes the button down, `orange` and `pink` when a cross-fade has finished and the
 * body should take the new colour (the demo switches the agent's `colour`).
 *
 * Ported from the landing page's SMIL agent (infinite.html, 8.8 s loop). Its keyTimes and values are kept as they
 * are in the original (the `smil()` strings below) so they can be checked against it. Channels are linear unless
 * the original eases them: the outline morph (keySplines .4 0 .2 1) and the gentle squash (.45 0 .55 1) follow the
 * original's own curves (`bezier()`), sampled densely.
 *
 * The original draws only the body (with its eyes and shine) scaled about (32 49) and placed with its feet at
 * (32 53.5), with a gentle 1.02 / .98 squash on a 2.2 s cycle; the desk, the button and the hand are full size and
 * still. The body's scale times the squash is baked into the rig's squash, and the difference in where the feet
 * go into its lift. The rig squashes and lifts its props with the body, so the full-size ones are placed through
 * the inverse (`unsquash`) and scaled by 1 / scale; the rig's own hands would grow with the body, so they wait out
 * of sight behind it and the hand is a prop.
 */
const D = 8800;
const at = (f: number) => Math.round(f * D);
const FEET = SHAPES.squircle.feet;

/** The body when squared off: the squircle's 72 points pulled out to the corners (same commands, so it morphs). */
export const SQUARE =
  "M52.60 31.50L52.59 45.23L52.56 46.32L52.52 46.99L52.46 47.48L52.38 47.86L52.27 48.17L52.15 48.42L52.00 48.64L51.82 48.82L51.61 48.97L51.37 49.11L51.07 49.21L50.72 49.30L50.29 49.38L49.73 49.43L48.96 49.47L47.71 49.49L32.33 49.50L16.29 49.49L15.04 49.47L14.27 49.43L13.71 49.38L13.28 49.30L12.93 49.21L12.63 49.11L12.39 48.97L12.18 48.82L12.00 48.64L11.85 48.42L11.73 48.17L11.62 47.86L11.54 47.48L11.48 46.99L11.44 46.32L11.41 45.23L11.40 31.81L11.41 17.77L11.44 16.68L11.48 16.01L11.54 15.52L11.62 15.14L11.73 14.83L11.85 14.58L12.00 14.36L12.18 14.18L12.39 14.03L12.63 13.89L12.93 13.79L13.28 13.70L13.71 13.62L14.27 13.57L15.04 13.53L16.29 13.51L31.63 13.50L47.71 13.51L48.96 13.53L49.73 13.57L50.29 13.62L50.72 13.70L51.07 13.79L51.37 13.89L51.61 14.03L51.82 14.18L52.00 14.36L52.15 14.58L52.27 14.83L52.38 15.14L52.46 15.52L52.52 16.01L52.56 16.68L52.59 17.77Z";

/** The SMIL / CSS cubic-bezier(x1 y1 x2 y2) easing, as a function of the linear progress u (0..1). */
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const c = (a: number, b: number, s: number) => 3 * a * s * (1 - s) ** 2 + 3 * b * s * s * (1 - s) + s ** 3;
  return (u: number) => {
    let lo = 0, hi = 1;
    for (let n = 0; n < 30; n++) {
      const mid = (lo + hi) / 2;
      if (c(x1, x2, mid) < u) lo = mid;
      else hi = mid;
    }
    return c(y1, y2, (lo + hi) / 2);
  };
}
const MORPH_EASE = bezier(0.4, 0, 0.2, 1);
const WOBBLE_EASE = bezier(0.45, 0, 0.55, 1);

/** A SMIL `values` / `keyTimes` pair as a linear track ("x y" pairs, or single numbers as [n, n]). */
function smil(values: string, keyTimes: string): Track<Vec> {
  const ts = keyTimes.split(";").map(Number);
  return values.split(";").map((v, n) => {
    const [x, y = x] = v.trim().split(/\s+/).map(Number);
    return [at(ts[n]), [x, y] as Vec, "linear"] as const;
  });
}
const xs = (track: Track<Vec>): Track<number> => track.map(([t, v, e]) => [t, v[0], e] as const);
const ys = (track: Track<Vec>): Track<number> => track.map(([t, v, e]) => [t, v[1], e] as const);

// ---- the original's channels ----

/** The hop after each press: up 1.4 and down again, a moment after the hand lets go of the button. */
const hop = ys(smil("0 0;0 0;0 0;0 -1.4;0 0;0 0;0 0;0 -1.4;0 0;0 0;0 0;0 -1.4;0 0;0 0;0 0;0 -1.4;0 0;0 0",
  "0;0.125;0.176;0.19;0.21;0.375;0.426;0.44;0.46;0.625;0.676;0.69;0.71;0.875;0.926;0.94;0.96;1"));

/** The body's size: 0.8, growing to 0.98 (overshooting to 1.019 and settling) after the second press, and back to
 *  0.8 (undershooting to 0.768) after the fourth. */
const scale = xs(smil("0.8 0.8;0.8 0.8;1.019 1.019;0.965 0.965;0.98 0.98;0.98 0.98;0.768 0.768;0.8 0.8;0.8 0.8",
  "0;0.398;0.418;0.439;0.455;0.898;0.92;0.941;1"));

/** The gentle squash, wider and shorter halfway through each 2.2 s cycle (on the original's .45 0 .55 1 curve). */
const wobbleAt = (t: number): Vec => {
  const half = Math.floor(t / 1100), u = WOBBLE_EASE((t - half * 1100) / 1100);
  const k = half % 2 ? 1 - u : u;   // 0 at rest, 1 at the widest
  return [1 + 0.02 * k, 1 - 0.02 * k];
};

/** Where the hand is (the original's own coordinates): resting on the desk's right corner (48.5 52), up (40 41.5),
 *  onto the button (32.2 43), holding it down, and back, once per 2.2 s. */
const hand = smil(
  "48.5 52;48.5 52;40 41.5;40 41.5;32.2 43.0;32.2 43.0;40 41.5;48.5 52;48.5 52;40 41.5;40 41.5;32.2 43.0;32.2 43.0;40 41.5;48.5 52;48.5 52;40 41.5;40 41.5;32.2 43.0;32.2 43.0;40 41.5;48.5 52;48.5 52;40 41.5;40 41.5;32.2 43.0;32.2 43.0;40 41.5;48.5 52;48.5 52",
  "0;0.091;0.123;0.131;0.148;0.165;0.188;0.214;0.341;0.373;0.381;0.398;0.415;0.438;0.464;0.591;0.623;0.631;0.648;0.665;0.688;0.714;0.841;0.873;0.881;0.898;0.915;0.938;0.964;1",
);

/** The button going down 2.4 under the hand, and back up as the hand lets go. */
const press = smil("0 0;0 0;0 2.4;0 2.4;0 0;0 0;0 2.4;0 2.4;0 0;0 0;0 2.4;0 2.4;0 0;0 0;0 2.4;0 2.4;0 0;0 0",
  "0;0.131;0.148;0.165;0.182;0.381;0.398;0.415;0.432;0.631;0.648;0.665;0.682;0.881;0.898;0.915;0.932;1");

/** The moments the button is fully down (the outline, size and colour changes start here). */
const PRESSES = [0.148, 0.398, 0.648, 0.898].map(at);

/** The shine: the stripes slide from x -30 to 54 (from clear of the body on the left to clear on the right). */
const SWEEP = { from: at(0.676), to: at(0.756), x0: -30, x1: 54 } as const;
/** How many frames show the shine (about one per display frame for the 704 ms sweep). */
export const GLOSS_FRAMES = 40;
/** The stripes' x in each frame: where they are in the middle of the frame's slot of the sweep. */
export const GLOSS_X = Array.from({ length: GLOSS_FRAMES }, (_, k) => SWEEP.x0 + ((SWEEP.x1 - SWEEP.x0) * (k + 0.5)) / GLOSS_FRAMES);
const glossFrame = (k: number): PropTrack => ({
  attach: "world",
  visible: [[Math.round(SWEEP.from + ((SWEEP.to - SWEEP.from) * k) / GLOSS_FRAMES), Math.round(SWEEP.from + ((SWEEP.to - SWEEP.from) * (k + 1)) / GLOSS_FRAMES)]] as Span[],
});

// ---- baking the body's transform, and placing the full-size props ----

/** Every key time of the channels, the squash's turning points, plus a 40 ms grid so the eased squash (and
 *  1 / scale) are followed closely. */
const CHANNELS: Track<unknown>[] = [hop, scale, hand, press];
const TIMES = [...new Set([...CHANNELS.flatMap((tr) => tr.map(([t]) => t)),
  ...Array.from({ length: 9 }, (_, n) => n * 1100),
  ...Array.from({ length: D / 40 + 1 }, (_, n) => n * 40)])].sort((a, b) => a - b);

/** The rig's [scaleX, scaleY] about the feet: the original's size times its squash. */
const squashAt = (t: number): Vec => {
  const s = sample(scale, t, 0.8), w = wobbleAt(t);
  return [s * w[0], s * w[1]];
};
/** The rig's lift: the original scales about (32 49) and puts that at (32 53.5); the rig scales about its feet
 *  (32 49.5), so the body goes 4 + 0.5 * scaleY lower, plus the hop. */
const liftAt = (t: number) => sample(hop, t, 0) + 4 + 0.5 * squashAt(t)[1];

/** A point of the original's full-size drawing, placed so the rig's lift and squash put it back where it was. */
const unsquash = (p: Vec, t: number): Vec => {
  const [sx, sy] = squashAt(t);
  return [FEET[0] + (p[0] - FEET[0]) / sx, FEET[1] + (p[1] - liftAt(t) - FEET[1]) / sy];
};
/** A full-size prop at the point `p(t)` of the original: placed through the inverse, at 1 / the body's size. (The
 *  gentle squash cannot be undone with a uniform scale, so these props share its 2%: see the port notes.) */
const fullSize = (p: (t: number) => Vec): PropTrack => ({
  attach: "world",
  offset: TIMES.map((t) => [t, unsquash(p(t), t), "linear"] as const),
  scale: TIMES.map((t) => [t, 1 / sample(scale, t, 0.8), "linear"] as const),
});

// ---- the outline, and the colour cross-fades ----

/** The original cross-fades its colour over 256 ms after the third press (pink to orange) and the fourth (back). */
const FADE_ORANGE = { from: at(0.653), to: at(0.682) } as const;
const FADE_PINK = { from: at(0.903), to: at(0.932) } as const;

/** The outline during a morph (from `a` at t0 to `b` at t1, on the original's curve), at time t. */
const morph = (a: string, b: string, t0: number, t1: number, t: number) => lerpPath(a, b, MORPH_EASE((t - t0) / (t1 - t0)));
const ROUND = SHAPES.squircle.d;
/** The back-to-round morph (fourth press). */
const unsquare = (t: number) => morph(SQUARE, ROUND, PRESSES[3], at(0.932), t);

/**
 * The fade back to pink happens while the body rounds off again, and the pink coat has to have the body's outline
 * exactly, so it is a flipbook: 32 frames of 8 ms, each with the outline at the middle of its slot. During the fade
 * the body's own outline holds each frame's shape for its slot too (stepped at 125 fps, which looks continuous), so
 * coat and body always match.
 */
export const TINT_FRAMES = 32;
const slot = (k: number) => Math.round(FADE_PINK.from + ((FADE_PINK.to - FADE_PINK.from) * k) / TINT_FRAMES);
/** The outline in each frame of the pink coat. */
export const TINT_PATHS = Array.from({ length: TINT_FRAMES }, (_, k) => unsquare((slot(k) + slot(k + 1)) / 2));

/** The outline: squaring off over the first press (sampled every 10 ms on the original's curve), held, then round
 *  again over the fourth (sampled, then stepped through the coat's frames while the colour fades). */
const outline: Track<string> = [
  [0, ROUND],
  ...Array.from({ length: 31 }, (_, n) => {
    const t = PRESSES[0] + n * 10;
    return [t, morph(ROUND, SQUARE, PRESSES[0], at(0.182), t), "linear"] as const;
  }),
  [at(0.182), SQUARE, "linear"],
  [PRESSES[3], SQUARE, "linear"],
  ...Array.from({ length: Math.ceil((FADE_PINK.from - PRESSES[3]) / 10) }, (_, n) => {
    const t = PRESSES[3] + (n + 1) * 10;
    return t < FADE_PINK.from ? ([t, unsquare(t), "linear"] as const) : null;
  }).filter((k) => k !== null),
  ...TINT_PATHS.flatMap((d, k) => [[slot(k), d, "linear"], [slot(k + 1) - 1, d, "linear"]] as const),
  [FADE_PINK.to, ROUND, "linear"],
];

/** The pink to orange fade: an orange coat over the (still, square) body, fading in; then the body turns orange. */
const tintOrange: PropTrack = {
  attach: "world",
  visible: [[FADE_ORANGE.from, FADE_ORANGE.to]],
  opacity: [[FADE_ORANGE.from, 0], [FADE_ORANGE.to, 1, "linear"]],
};
/** The orange to pink fade: frame k of the pink coat, fading in over the orange body; then the body turns pink. */
const tintPink = (k: number): PropTrack => ({
  attach: "world",
  visible: [[slot(k), slot(k + 1)]],
  opacity: [[FADE_PINK.from, 0], [FADE_PINK.to, 1, "linear"]],
});

/** The props' origins in the original's drawing (see props/controlPanel). */
const PANEL: Vec = [32, 56];
const handProp = fullSize((t) => sample(hand, t, [48.5, 52]));
const BUTTON: Vec = [32, 50.2];

export const controlPanel: AgentAnimation = {
  duration: D,
  // drawn at the original card's size and height: the box shows it at the family's (see `frame`)
  frame: { scale: 0.8, ground: FEET[1] + 4 + 0.5 * 0.8 },
  rest: 0,
  body: {
    // squared off while the first press holds the button down, round again with the fourth
    outline,
    squash: TIMES.map((t) => [t, squashAt(t), "linear"] as const),
    lift: TIMES.map((t) => [t, liftAt(t), "linear"] as const),
  },
  eyes: {
    // the original's two blinks: the eyes squash linearly to .08 tall from .051 to .06 of the loop and open again
    // by .076 (.81 and .826 for the second), so 79 ms closing and 141 ms opening
    blink: { close: at(0.06) - at(0.051), open: at(0.076) - at(0.06), depth: 0.08, ease: "linear" },
    blinks: [at(0.06), at(0.81)],
  },
  // the original has a single hand, a prop (see above); both of the rig's wait behind the body
  hands: {
    L: { path: [[0, [26, 34]]], behind: [[0, D]] },
    R: { path: [[0, [38, 34]]], behind: [[0, D]] },
  },
  // drawn in this order: the colour coats and the shine on the body, the button, the desk over the button's foot,
  // the hand over it all (and its orange coat over it)
  props: {
    tintOrange,
    ...Object.fromEntries(TINT_PATHS.map((_, k) => [`tintPink${k}`, tintPink(k)])),
    ...Object.fromEntries(GLOSS_X.map((_, k) => [`gloss${k}`, glossFrame(k)])),
    button: fullSize((t) => {
      const d = sample(press, t, [0, 0]);
      return [BUTTON[0] + d[0], BUTTON[1] + d[1]];
    }),
    panel: fullSize(() => PANEL),
    hand: handProp,
    // the hand is pink; this orange copy over it fades in and out with the body's colour
    handOrange: {
      ...handProp,
      opacity: [[FADE_ORANGE.from, 0], [FADE_ORANGE.to, 1, "linear"], [FADE_PINK.from, 1, "linear"], [FADE_PINK.to, 0, "linear"]],
    },
  },
  // the body takes its new colour as each of the original's 256 ms cross-fades ends (its coat has faded fully in)
  events: [...PRESSES.map((t) => [t, "press"] as const), [FADE_ORANGE.to, "orange"], [FADE_PINK.to, "pink"]],
};
