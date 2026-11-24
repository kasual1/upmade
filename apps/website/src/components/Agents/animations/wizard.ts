import { sample } from "../timeline";
import { SHAPES } from "../tokens";
import type { AgentAnimation, PropTrack, Track, Vec } from "../types";

/**
 * A wizard conjuring things ("LLM generated objects"), for the pink squircle in an indigo wizard's hat: it stands
 * looking to its right, at the spot where a blue vase stands. Three times a loop it flicks its wand (back, then a
 * snap forward), three sparkles twinkle and the next object pops up in that spot: an apple, then a white rabbit, then
 * the vase again; each one swells a little and vanishes just before the next flick.
 * Props: `hat` (on the head), `vase`, `apple`, `rabbit`, `wand` (the wand with the hand holding it) and `sparkle1`..
 * `sparkle3`. Events: `apple`, `rabbit`, `vase` as each one pops up.
 *
 * Ported from the landing page's SMIL agent (6 s loop; every channel but the breathing is linear). Its keyTimes are
 * kept as fractions of the loop (`at(.207)`) so each key can be checked against the original.
 *
 * The original draws only the body (with its eyes and hat) at 0.62, placed with its feet point (32 49) at (17.5 52),
 * and breathes it (1.02 x .98 every 2 s); the wand hand, the objects and the sparkles are full size and still. The
 * 0.62 and the breathing are baked into the body squash; the rig squashes and lifts its props with the body, so the
 * props are placed through the inverse (`unsquash`) and scaled by 1 / 0.62. The rig's own hands would shrink with the
 * body, so they wait out of sight behind it and the wand hand is a prop. The body stands 14.5 units left of the middle
 * (a constant body.shift, which moves the props with it); every point below is in the original's drawing.
 */
const D = 6000;
const at = (f: number) => Math.round(f * D);
const SCALE = 0.62;
const FEET = SHAPES.squircle.feet;
/** How far the body stands left of the middle: its feet (32 49) are at (17.5 52) in the original. */
const SHIFT = 17.5 - 32;
/** A point of the original drawing (all of which sits 2 units up). */
const orig = (x: number, y: number): Vec => [x, y - 2];

// ---- the body ----

/** The breathing: 1.02 wide and .98 tall at the middle of each 2 s, eased (the original's splines are .45 0 .55 1). */
const squash: Track<Vec> = [0, 1000, 2000, 3000, 4000, 5000, 6000].map(
  (t) => [t, (t / 1000) % 2 ? ([SCALE * 1.02, SCALE * 0.98] as Vec) : ([SCALE, SCALE] as Vec), "inOut"] as const,
);
/** Lifts the shrunk body so that its (32 49) lands on the original's (17.5 52), with the shift. */
const LIFT = 52 - FEET[1] - SCALE * (49 - FEET[1]);

/** A point of the original drawing at time t, placed so the rig's shift, lift and squash put it back where it was. */
const unsquash = (p: Vec, t: number): Vec => {
  const s = sample(squash, t, [SCALE, SCALE] as Vec);
  return [FEET[0] + (p[0] - SHIFT - FEET[0]) / s[0], FEET[1] + (p[1] - LIFT - FEET[1]) / s[1]];
};
const BREATHS = squash.map(([t]) => t);
/** An offset track holding a (possibly moving, linearly keyed) point of the original still against the breathing:
 *  keyed at its own keys and at the breaths' (between breath keys a linear key is within .03 units of exact). */
const place = (path: Track<Vec>): Track<Vec> =>
  [...new Set([...path.map(([t]) => t), ...BREATHS])]
    .sort((a, b) => a - b)
    .map((t) => [t, unsquash(sample(path, t, path[0][1]), t), "linear"] as const);
/** A linear track from SMIL-style fractions and values. */
const keys = <V>(fs: readonly number[], vs: readonly V[]): Track<V> => fs.map((f, n) => [at(f), vs[n], "linear"] as const);

// ---- the wand ----

/** Each flick: still until a, pulled back and up (31.5 43, -28 deg) by b, a bit further (31.1 42.6, -34) by c, snapped
 *  forward and down (33.7 46.6, +12) by d, back to rest (32.5 46, 0) by e. Three flicks, a third of the loop apart. */
const FLICKS = [0.167, 0.5, 0.833].map((a, n) => [a, [0.173, 0.507, 0.84][n], [0.207, 0.54, 0.873][n], [0.223, 0.557, 0.89][n], [0.247, 0.58, 0.913][n]]);
const wandKeys = [0, ...FLICKS.flat(), 1];
const REST = orig(32.5, 46);
const wandPath = keys<Vec>(wandKeys, [REST, ...FLICKS.flatMap(() => [REST, orig(31.5, 43), orig(31.1, 42.6), orig(33.7, 46.6), REST]), REST]);
const wandTurn = keys<number>(wandKeys, [0, ...FLICKS.flatMap(() => [0, -28, -34, 12, 0]), 0]);

// ---- the conjured objects ----

/** The objects grow from (45 46.8) at .75. */
const SPOT = orig(45, 46.8);
const object = (fs: readonly number[], vs: readonly number[]): PropTrack => ({
  attach: "world",
  offset: place([[0, SPOT]]),
  scale: keys(fs, vs.map((v) => (0.75 * v) / SCALE)),
});
/** Hidden until b (a is its flick's start), pops up with a bounce (1.14 at c, .96 at d, 1 at e), holds until f, then
 *  swells (1.08 at g) and vanishes by h, just after the next flick. */
const pop = (...[a, b, c, d, e, f, g, h]: readonly number[]) =>
  object([0, a, b, c, d, e, f, g, h, 1], [0, 0, 0, 1.14, 0.96, 1, 1, 1.08, 0, 0]);

// ---- the sparkles ----

/** Three twinkles at fixed spots, popping up (0 to 1) from b to c of each flick's burst and gone by d. */
const BURSTS = [0.167, 0.5, 0.833].map((a, n) => [a, [0.213, 0.547, 0.88][n], [0.233, 0.567, 0.9][n], [0.283, 0.617, 0.95][n]]);
const sparkle = (x: number, y: number): PropTrack => ({
  attach: "world",
  offset: place([[0, orig(x, y)]]),
  scale: keys([0, ...BURSTS.flat(), 1], [0, ...BURSTS.flatMap(() => [0, 0, 1 / SCALE, 0]), 0]),
});
/** Their sizes (sparkle1..3), for the demo. */
export const SPARKLE_SIZES = [0.8, 0.7, 0.55] as const;

/** The rig's hands wait behind the middle of the body, out of sight. */
const HIDDEN = { path: [[0, [32, 34]]] as Track<Vec>, behind: [[0, D]] as const };

export const wizard: AgentAnimation = {
  duration: D,
  // the apple is out, the wand at rest
  rest: 2200,
  body: { squash, lift: [[0, LIFT]], shift: [[0, SHIFT]] },
  eyes: {
    // the eyes look right, at the objects, all the time
    look: [[0, [2.2, 0.4]]],
    // the original's one blink: from open at .383 down to .08 at .397, open again by .42
    blink: { close: at(0.397) - at(0.383), open: at(0.42) - at(0.397), depth: 0.08 },
    blinks: [at(0.397)],
  },
  hands: { L: HIDDEN, R: HIDDEN },
  props: {
    // drawn in this order, front to back as in the original: hat (with the body), objects, wand, sparkles
    hat: { attach: "head" },
    // the vase stands there at the start, swells and vanishes after the first flick, and comes back after the third
    vase: object([0, 0.13, 0.14, 0.158, 0.833, 0.887, 0.91, 0.93, 0.943, 1], [1, 1, 1.08, 0, 0, 0, 1.14, 0.96, 1, 1]),
    apple: pop(0.167, 0.22, 0.243, 0.263, 0.277, 0.463, 0.473, 0.492),
    rabbit: pop(0.5, 0.553, 0.577, 0.597, 0.61, 0.797, 0.807, 0.825),
    wand: { attach: "world", offset: place(wandPath), rotate: wandTurn, scale: [[0, 1 / SCALE]] },
    sparkle1: sparkle(37, 27),
    sparkle2: sparkle(53.6, 34.4),
    sparkle3: sparkle(52.6, 54.4),
  },
  events: [
    [at(0.22), "apple"],
    [at(0.553), "rabbit"],
    [at(0.887), "vase"],
  ],
};
