import type { AgentAnimation, Track, Vec } from "../types";

/**
 * "Agents love Upmade", for the yellow bullet: it has fallen in love. It daydreams with its hands clasped in front,
 * gazing dreamily up to the side with blushed cheeks and a gentle sway. Every 5.2 s it swoons: its hands fly up to
 * its cheeks along a small outward arc, it gives a little hop of joy, its eyes squeeze shut into happy arcs, its
 * cheeks blush fully and it wiggles happily from side to side (the hands squishing its cheeks in time), then it
 * settles back into its daydream, glancing up the other way before its gaze drifts back. No props.
 * Events: `smile` (the eyes squeeze shut into happy arcs; the landing page bursts hearts here).
 *
 * Ported from the landing page's SMIL agent, which its generator sampled at 208 frames over the 5.2 s loop (one frame
 * every 25 ms) and interpolated linearly. The generator's motion functions are reproduced below, as fractions u of the
 * loop, and sampled at the same frames, so every frame matches.
 */
const D = 5200;
const FRAMES = 208;

// ---- the original's motion, as fractions u of the loop ----

const smooth = (u: number) => {
  const v = Math.max(0, Math.min(1, u));
  return v * v * (3 - 2 * v);
};
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

/** Smoothstep interpolation through [u, value] keys, as the generator's `keys()` does. */
function keys(pts: ReadonlyArray<readonly [number, number]>, u: number): number {
  for (let n = 1; n < pts.length; n++) {
    const [u0, a] = pts[n - 1], [u1, b] = pts[n];
    if (u <= u1) return lerp(a, b, u1 > u0 ? smooth((u - u0) / (u1 - u0)) : 1);
  }
  return pts[pts.length - 1][1];
}

/** The swoon: the eyes are happy arcs from the squeeze (.44) until they open again (.78). */
const POP = 0.44, SWOON_END = 0.78;
/** The original switches the eyes for the arcs (and back) with a discrete animation sampled at its frames, so the
 *  switches land on the first frame at or after .44 and .78: frame 92 (2300 ms) and frame 163 (4075 ms). */
const onFrame = (u: number) => (Math.ceil(u * FRAMES - 1e-9) * D) / FRAMES;
const ARCS_ON = onFrame(POP), ARCS_OFF = onFrame(SWOON_END);

/** The happy wiggle while swooning: three and a half quick sways, swelling in and dying out (.47-.77). */
function wig(u: number) {
  const a = 0.47, b = 0.77;
  if (u < a || u >= b) return 0;
  const v = (u - a) / (b - a);
  return Math.sin(2 * Math.PI * 3.5 * v) * Math.sin(Math.PI * v);
}

/** The hands: clasped in front while daydreaming, pressed to its cheeks while swooning. */
const CLASP = { L: [28, 44.9], R: [35.9, 44.1] } as const;
const CHEEK = { L: [14.2, 39.4], R: [49.8, 39.4] } as const;
function hand(side: "L" | "R", u: number): Vec {
  // up to the cheeks over .37-.43, held until .78, back down by .86
  const k = keys([[0, 0], [0.37, 0], [0.43, 1], [0.78, 1], [0.86, 0], [1, 0]], u);
  const d = side === "L" ? -1 : 1;
  // an arc outwards (and up) on the way, and a squish of the cheeks in time with the wiggle
  const bow = Math.sin(Math.PI * k) * 2.2;
  const squish = Math.abs(wig(u)) * 0.9 * k;
  return [lerp(CLASP[side][0], CHEEK[side][0], k) + d * bow - d * squish, lerp(CLASP[side][1], CHEEK[side][1], k) - bow * 0.6];
}

/** The lean: a dreamy sway (two per loop) that fades out for the swoon, plus the wiggle's bigger sways. */
const lean = (u: number) =>
  2.4 * Math.sin(2 * Math.PI * 2 * u) * (1 - keys([[0, 0], [0.42, 0], [0.48, 1], [0.76, 1], [0.82, 0], [1, 0]], u)) + 5.5 * wig(u);

/** The little hop of joy as it swoons, peaking just after the eyes squeeze shut. */
const lift = (u: number) => keys([[0, 0], [0.4, 0], [0.455, -3.2], [0.5, 0], [1, 0]], u);

/** Squash before the hop, stretch in the air, and a small squash on landing. */
const SQUASH: ReadonlyArray<readonly [number, Vec]> = [
  [0, [1, 1]], [0.4, [1, 1]], [0.425, [1.06, 0.94]], [0.45, [0.97, 1.04]], [0.5, [1, 1]], [0.515, [1.05, 0.95]], [0.54, [1, 1]], [1, [1, 1]],
];
const squash = (u: number): Vec => [0, 1].map((c) => keys(SQUASH.map(([t, v]) => [t, v[c]] as const), u)) as unknown as Vec;

/** The gaze: dreamily up and to its left while daydreaming, ahead while swooning, then a glance up the other way. */
const LOOK: ReadonlyArray<readonly [number, Vec]> = [
  [0, [1.3, -1.4]], [0.36, [1.3, -1.4]], [0.42, [0, 0]], [0.8, [0, 0]], [0.86, [-1.3, -1.3]], [0.93, [-1.3, -1.3]], [1, [1.3, -1.4]],
];
const look = (u: number): Vec => [0, 1].map((c) => keys(LOOK.map(([t, v]) => [t, v[c]] as const), u)) as unknown as Vec;

/** The blush: always a little rosy (pulsing three times a loop), and full while swooning. */
function blush(u: number) {
  const base = 0.68 + 0.1 * Math.sin(2 * Math.PI * 3 * u);
  return base + (1 - base) * keys([[0, 0], [0.4, 0], [0.46, 1], [0.76, 1], [0.84, 0], [1, 0]], u);
}

/** A track with one linear key per frame of the original, rounded so the data stays small. */
function frames<V>(fn: (u: number) => V, round: (v: V) => V): Track<V> {
  return Array.from({ length: FRAMES + 1 }, (_, n) => [(n * D) / FRAMES, round(fn(n / FRAMES)), "linear"] as const);
}
const r2 = (v: number) => Math.round(v * 100) / 100;
const r3 = (v: number) => Math.round(v * 1000) / 1000;
const rv = (v: Vec): Vec => [r2(v[0]), r2(v[1])];

export const lovestruck: AgentAnimation = {
  duration: D,
  // with reduced motion it holds still mid-swoon, as the landing page does (3.12 s)
  rest: 0.6 * D,
  body: {
    lift: frames(lift, r2),
    lean: frames(lean, r2),
    squash: frames(squash, (v) => [r3(v[0]), r3(v[1])]),
  },
  eyes: {
    look: frames(look, rv),
    blush: frames(blush, r3),
    // The original's eye scaleY, sampled at its 25 ms frames and drawn linearly between them: two dreamy blinks, linear
    // V's to .1 at 1040 and 4680 ms over 83 ms each way, which the frame sampling renders as a softer dip (the frames
    // nearest the bottom show .15-.21). A smoothstep of 96 ms each way to .22 is the least-squares fit to what is drawn.
    blink: { close: 96, open: 96, depth: 0.22 },
    blinks: [
      1040,
      // the squeeze: a smoothstep shut over 104 ms to .1 at 2288 (.44 of the loop), held under the happy arcs, then
      // a smoothstep open over 130 ms from 4056 (.78), so the eyes come back nearly shut as the arcs go (4075)
      { at: 2288, close: 104, hold: 4056 - 2288, open: 130, depth: 0.1 },
      4680,
    ],
    happy: [[ARCS_ON, ARCS_OFF]],
  },
  hands: {
    L: { path: frames((u) => hand("L", u), rv) },
    R: { path: frames((u) => hand("R", u), rv) },
  },
  // the landing page bursts hearts at 2.29 s (its BURSTS), as the eyes squeeze shut, just before the happy arcs (2.3 s)
  events: [[2290, "smile"]],
};
