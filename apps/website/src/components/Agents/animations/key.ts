import { sample } from "../timeline";
import { SHAPES } from "../tokens";
import type { AgentAnimation, Ease, Track, Vec } from "../types";

/**
 * Reveals a golden key ("Open source"), for the violet squircle: it stands holding the key at its side and glances
 * about, swings it out and round behind its back, peeks it out past its side twice while looking left and right,
 * then whips it out in front with a little hop, a twinkle on the key and happy eyes.
 * Props: `key` (the key), `sparkle` (its twinkle) and `hand` (the hand holding it); all three follow the same hand
 * path, worked out below. Event: `reveal` (the key is out in front).
 *
 * Ported from the landing page's SMIL agent (6.8 s loop). Its keyTimes are kept as fractions of the loop (`at(.385)`)
 * so each key can be checked against the original. The original agent is drawn at 0.85 inside its 64x64 box; that
 * shrink is baked into the body squash (about the feet), so props, eyes and hand paths below are in the original's
 * unshrunk units. The shrink's offset within the box (10 left, 2.5 up) is a placement, done by the demo.
 */
const D = 6800;
const at = (f: number) => Math.round(f * D);
const SHRINK = 0.85;
const FEET = SHAPES.squircle.feet;

/** The key is behind the body from when it has swung out to the right (x 65, clear of the body) until it is out
 *  there again on the way back. */
const BEHIND = [[at(0.385), at(0.826)]] as const;

// ---- the original's separate channels, as tracks; the props' tracks are derived from them at the bottom ----

/** The hand's x: holds at the side, swings out right (.385), tucks behind the right edge (54.8, peeking out), peeks
 *  further out twice (62.2), dives in behind (44.4), whips out right (65.3) and comes round to the front (48.1). */
const handX: Track<number> = [
  [0, 49.51], [at(0.309), 49.51, "linear"], [at(0.385), 65.3], [at(0.478), 54.8], [at(0.565), 54.8, "linear"],
  [at(0.594), 62.2], [at(0.641), 62.2, "linear"], [at(0.674), 54.8], [at(0.75), 54.8, "linear"], [at(0.801), 44.4],
  [at(0.826), 65.3], [at(0.853), 48.11, "out"], [at(0.89), 50.01], [at(0.926), 49.51],
];
/** The hand's y, keyed apart from x in the original: a small bob while holding, up as it swings out, down a little
 *  while peeking, up for the whip and settling with the landing. */
const handY: Track<number> = [
  [0, 44.81], [at(0.147), 44.31], [at(0.309), 44.81], [at(0.368), 41.4], [at(0.478), 43.4], [at(0.565), 43.4, "linear"],
  [at(0.594), 45.4], [at(0.641), 45.4, "linear"], [at(0.674), 43.4], [at(0.75), 43.4, "linear"], [at(0.801), 42.6],
  [at(0.824), 40.4, "out"], [at(0.853), 43.41], [at(0.89), 45.41], [at(0.926), 44.81],
];
/** The key's tilt: leaning out (38) at the side, tipped up-left (-66..-84) while behind and peeking, swung through
 *  to 46 as it comes out, settling at 38. */
const keyRotate: Track<number> = [
  [0, 38], [at(0.147), 36.5], [at(0.309), 38], [at(0.385), -22.08, "in"], [at(0.478), -66, "out"], [at(0.565), -66, "linear"],
  [at(0.594), -84], [at(0.641), -84, "linear"], [at(0.674), -66], [at(0.75), -66, "linear"], [at(0.801), -84],
  [at(0.826), -12, "in"], [at(0.853), 46, "out"], [at(0.89), 35], [at(0.926), 38],
];
/** The key looks smaller (further away) behind the body, back to full size while peeking out, 0.82 just before
 *  the whip; the hand does the same, starting a little later. */
const shrinkBehind = (start: number): Track<number> => [
  [0, 1], [start, 1, "linear"], [at(0.478), 0.85, "out"], [at(0.565), 0.85, "linear"], [at(0.581), 1], [at(0.653), 1, "linear"],
  [at(0.674), 0.85], [at(0.75), 0.85, "linear"], [at(0.801), 0.82], [at(0.816), 1],
];
const keyScale = shrinkBehind(at(0.385));
const handScale = shrinkBehind(at(0.416));
/** The twinkle: pops up (1.15) and turns 40 degrees while it shrinks away again. */
const sparkleScale: Track<number> = [[0, 0], [at(0.871), 0, "linear"], [at(0.891), 1.15, "out"], [at(0.906), 0.85], [at(0.935), 0]];
const sparkleTurn: Track<number> = [[0, 0], [at(0.871), 0, "linear"], [at(0.935), 40, "linear"], [D, 0, "linear"]];
/** Where the twinkle sits on the key (on its ring's upper right), in the hand's frame before the key's tilt. */
const SPARKLE_ON_KEY: Vec = [0.78 * 2.9, 0.78 * (-3.1 - 10.3)];

/** The landing's squash and stretch: stretch up off the ground, squash on landing, wobble back. */
const jump: Track<Vec> = [
  [0, [1, 1]], [at(0.75), [1, 1], "linear"], [at(0.801), [1.05, 0.93]], [at(0.829), [0.97, 1.04], "out"],
  [at(0.862), [1.03, 0.97], "in"], [at(0.891), [0.995, 1.008]], [at(0.921), [1, 1]],
];
/** Breathing: twice a loop, a touch wider and shorter. */
const breath: Track<Vec> = [[0, [1, 1]], [at(0.25), [1.02, 0.98]], [at(0.5), [1, 1]], [at(0.75), [1.02, 0.98]], [D, [1, 1]]];

// ---- deriving the combined tracks ----

/** The times to sample at: every key of the given tracks, plus every 40 ms so eased stretches between them hold. */
function times(...tracks: Track<unknown>[]): number[] {
  const all = new Set<number>(tracks.flatMap((tr) => tr.map(([t]) => t)));
  for (let t = 0; t <= D; t += 40) all.add(t);
  return [...all].sort((a, b) => a - b);
}
const derive = <V,>(ts: number[], f: (t: number) => V, ease: Ease = "linear"): Track<V> => ts.map((t) => [t, f(t), ease] as const);

/** The body's squash and breathing (about the feet), without the 0.85 shrink. In the original these move only the
 *  body and eyes; the rig squashes the props with the body, so the props' positions are divided by it below. */
const wobble = (t: number): Vec => {
  const j = sample(jump, t, [1, 1]), b = sample(breath, t, [1, 1]);
  return [j[0] * b[0], j[1] * b[1]];
};
/** A point of the original (unshrunk, unsquashed) frame, placed so the rig's squash puts it back where it was. */
const unsquash = (p: Vec, t: number): Vec => {
  const w = wobble(t);
  return [FEET[0] + (p[0] - FEET[0]) / w[0], FEET[1] + (p[1] - FEET[1]) / w[1]];
};
const hand = (t: number): Vec => [sample(handX, t, 49.51), sample(handY, t, 44.81)];
const handTimes = times(handX, handY, jump, breath);
const sparkleTimes = times(handX, handY, keyRotate, keyScale, sparkleScale, sparkleTurn, jump, breath)
  .filter((t) => t >= at(0.86) && t <= at(0.94));

export const key: AgentAnimation = {
  duration: D,
  // key out in front, twinkling, eyes happy
  rest: at(0.897),
  body: {
    // the original's 0.85 shrink times its squash and breathing
    squash: derive(times(jump, breath), (t) => {
      const w = wobble(t);
      return [SHRINK * w[0], SHRINK * w[1]] as Vec;
    }),
    // a slight lean back throughout, swaying with the peeks, and a lean into the whip
    lean: [
      [0, -2], [at(0.309), -2, "linear"], [at(0.485), -1], [at(0.556), -1, "linear"], [at(0.582), 0.8], [at(0.647), 0.8, "linear"],
      [at(0.674), -0.6], [at(0.75), 0], [at(0.801), 2], [at(0.846), -3.4, "out"], [at(0.897), -1.6], [at(0.941), -2],
    ],
    // the hop as the key comes out (outside the shrink, so shrunk here)
    lift: [[0, 0], [at(0.801), 0, "linear"], [at(0.832), -1.8 * SHRINK, "out"], [at(0.862), 0, "in"]],
  },
  eyes: {
    // glances right, then right-down at the key going behind, left, right at the peek, left again, ahead
    look: [
      [0, [0, 0]], [at(0.066), [0, 0], "linear"], [at(0.091), [1.3, -0.5]], [at(0.147), [1.3, -0.5], "linear"], [at(0.174), [0, 0]],
      [at(0.309), [0, 0], "linear"], [at(0.353), [1.3, 0.3]], [at(0.434), [1.3, 0.3], "linear"], [at(0.474), [-2.3, 0.2]],
      [at(0.556), [-2.3, 0.2], "linear"], [at(0.579), [1.5, 0.2]], [at(0.647), [1.5, 0.2], "linear"], [at(0.674), [-2.1, 0.2]],
      [at(0.715), [-2.1, 0.2], "linear"], [at(0.753), [0, 0]],
    ],
    // two blinks; the eyes also close into the happy ^ ^ and open out of it
    blinks: [at(0.197), at(0.562), at(0.876), at(0.935)],
    happy: [[at(0.876), at(0.935)]],
  },
  hands: {
    // the original has one hand, the `hand` prop: the rig's hands wait out of sight behind the body
    L: { path: [[0, [28, 38]]], behind: [[0, D]] },
    R: { path: [[0, [36, 38]]], behind: [[0, D]] },
  },
  props: {
    key: {
      attach: "world",
      offset: derive(handTimes, (t) => unsquash(hand(t), t)),
      rotate: keyRotate,
      scale: keyScale,
      behind: BEHIND,
    },
    // follows the key's ring as it tilts, so it is placed through the key's rotation and scale
    sparkle: {
      attach: "world",
      offset: derive(sparkleTimes, (t) => {
        const a = (sample(keyRotate, t, 0) * Math.PI) / 180, s = sample(keyScale, t, 1), h = hand(t);
        const [x, y] = SPARKLE_ON_KEY;
        return unsquash([h[0] + s * (x * Math.cos(a) - y * Math.sin(a)), h[1] + s * (x * Math.sin(a) + y * Math.cos(a))], t);
      }),
      rotate: derive(sparkleTimes, (t) => sample(keyRotate, t, 0) + sample(sparkleTurn, t, 0)),
      scale: derive(sparkleTimes, (t) => 0.78 * sample(keyScale, t, 1) * sample(sparkleScale, t, 0)),
      visible: [[at(0.871), at(0.935)]],
    },
    hand: {
      attach: "world",
      offset: derive(handTimes, (t) => unsquash(hand(t), t)),
      scale: handScale,
      behind: BEHIND,
    },
  },
  events: [[at(0.853), "reveal"]],
};
