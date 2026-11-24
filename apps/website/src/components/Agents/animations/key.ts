import { SHAPES } from "../tokens";
import type { AgentAnimation, Blink, BlinkShape, Track, Vec } from "../types";

/**
 * Reveals a golden key ("Open source"), for the violet squircle: it stands holding the key at its side and glances
 * about, swings it out and round behind its back, peeks it out past its side twice while looking left and right
 * (eyes narrowed, slyly), then whips it out in front with a little hop, a twinkle on the key and happy eyes.
 * Props: `key` (the key), `sparkle` (its twinkle) and `hand` (the hand holding it). The eyes are the rig's: the squint
 * is a lid, the stretch before the whip is `eyes.scale` and the glints' drift inside the pupils is `eyes.glint`.
 * Event: `reveal` (the key is out in front).
 *
 * Ported from the landing page's SMIL agent (6.8 s loop). Each of its animated channels is copied below verbatim, as
 * its values, keyTimes and keySplines, so it can be checked against the original line by line; the tracks are then
 * sampled from those channels (every 20 ms and at every key), with the original's exact easing curves. Several of
 * them (the whip, the hop, the landing) use a sharp ease-out (.2 .7 .4 1) that the format's `out` only roughly
 * matches, and the hand's x and y are keyed at different times, so sampling is what keeps the motion the original's.
 *
 * The original agent is drawn at 0.85 inside its 64x64 box; that shrink is baked into the body squash (about the
 * feet), so props, eyes and hand paths below are in the original's unshrunk units. The shrink's offset within the
 * box (10.03 left, 2.54 up) is a constant body shift and lift.
 */
const D = 6800;
const at = (f: number) => Math.round(f * D);
const SHRINK = 0.85;
const FEET = SHAPES.squircle.feet;
/** Where the original's translate(-5.23 4.885) scale(.85) puts the agent, once the shrink about the feet is taken out. */
const PLACE: Vec = [-10.03, -2.54];

// ---- the original's channels ----

/** A cubic-bezier easing (a SMIL keySpline): progress through the segment -> progress of the value. */
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const at3 = (a: number, b: number, s: number) => 3 * a * s * (1 - s) ** 2 + 3 * b * s * s * (1 - s) + s ** 3;
  return (u: number) => {
    let lo = 0, hi = 1;
    for (let k = 0; k < 30; k++) {
      const s = (lo + hi) / 2;
      if (at3(x1, x2, s) < u) lo = s;
      else hi = s;
    }
    return at3(y1, y2, (lo + hi) / 2);
  };
}

/** One SMIL animation of the original (`values`, `keyTimes`, `keySplines` as written there, calcMode spline), as a
 *  function of the time in ms. Values may be numbers or "x y" pairs; the result is always a list of numbers. */
function smil(values: string, keyTimes: string, keySplines: string) {
  const vs = values.split(";").map((v) => v.trim().split(/[\s,]+/).map(Number));
  const ts = keyTimes.split(";").map((k) => Number(k) * D);
  const es = keySplines.split(";").map((s) => bezier(...(s.trim().split(/\s+/).map(Number) as [number, number, number, number])));
  const f = (t: number): number[] => {
    let n = 1;
    while (n < ts.length - 1 && t > ts[n]) n++;
    const u = es[n - 1](Math.min(1, Math.max(0, (t - ts[n - 1]) / (ts[n] - ts[n - 1]))));
    return vs[n - 1].map((a, k) => a + (vs[n][k] - a) * u);
  };
  return Object.assign(f, { keys: ts });
}
type Channel = ReturnType<typeof smil>;

/** The hand's x: holds at the side, swings out right (.385), tucks behind the right edge (54.8, peeking out), peeks
 *  further out twice (62.2), dives in behind (44.4), whips out right (65.3) and comes round to the front (48.11). */
const handX = smil(
  "49.51;49.51;65.3;54.8;54.8;62.2;62.2;54.8;54.8;44.4;65.3;48.11;50.01;49.51;49.51",
  "0;.309;.385;.478;.565;.594;.641;.674;.75;.801;.826;.853;.89;.926;1",
  "0 0 1 1;.6 0 .5 1;.25 0 .3 1;0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;.45 0 .55 1;.2 .7 .4 1;.45 0 .55 1;.45 0 .55 1;0 0 1 1",
);
/** The hand's y, keyed apart from x: a small bob while holding, up as it swings out, down a little while peeking,
 *  up for the whip and settling with the landing. */
const handY = smil(
  "44.81;44.31;44.81;41.4;43.4;43.4;45.4;45.4;43.4;43.4;42.6;40.4;43.41;45.41;44.81;44.81",
  "0;.147;.309;.368;.478;.565;.594;.641;.674;.75;.801;.824;.853;.89;.926;1",
  ".45 0 .55 1;.45 0 .55 1;.45 0 .55 1;.25 0 .3 1;0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;.2 .7 .4 1;.45 0 .55 1;.45 0 .55 1;.45 0 .55 1;0 0 1 1",
);
/** The key's tilt: leaning out (38) at the side, tipped up-left (-66..-84) while behind and peeking, swung through
 *  to 46 as it comes out, settling at 38. */
const keyTilt = smil(
  "38;36.5;38;-22.08;-66;-66;-84;-84;-66;-66;-84;-12;46;35;38;38",
  "0;.147;.309;.385;.478;.565;.594;.641;.674;.75;.801;.826;.853;.89;.926;1",
  ".45 0 .55 1;.45 0 .55 1;.366 0 .631 .527;.247 .525 .55 1;0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;.45 0 .8 .6;.25 .66 .5 1;.45 0 .55 1;.45 0 .55 1;0 0 1 1",
);
/** The key looks smaller (further away) behind the body, back to full size while peeking out, 0.82 just before
 *  the whip; the hand does the same, starting a little later. */
const SHRINK_VALUES = "1;1;.85;.85;1;1;.85;.85;.82;1;1";
const SHRINK_SPLINES = "0 0 1 1;.2 .7 .4 1;0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;.45 0 .55 1;0 0 1 1";
const keySize = smil(SHRINK_VALUES, "0;.385;.478;.565;.581;.653;.674;.75;.801;.816;1", SHRINK_SPLINES);
const handSize = smil(SHRINK_VALUES, "0;.416;.478;.565;.581;.653;.674;.75;.801;.816;1", SHRINK_SPLINES);
/** The twinkle on the key's ring: pops up (1.15) and turns 40 degrees while it shrinks away again. */
const twinkleSize = smil("0;0;1.15;.85;0;0", "0;.871;.891;.906;.935;1", "0 0 1 1;.2 .7 .4 1;.45 0 .55 1;.45 0 .55 1;0 0 1 1");
const twinkleTurn = smil("0;0;40;0", "0;.871;.935;1", "0 0 1 1;0 0 1 1;0 0 1 1");
/** Where the twinkle sits on the key (on its ring's upper right), in the hand's frame before the key's tilt. */
const TWINKLE_ON_KEY: Vec = [0.78 * 2.9, 0.78 * (-3.1 - 10.3)];

/** A slight lean back throughout, swaying with the peeks, and a lean into the whip (about the feet). */
const lean = smil(
  "-2;-2;-1;-1;.8;.8;-.6;0;2;-3.4;-1.6;-2;-2",
  "0;.309;.485;.556;.582;.647;.674;.75;.801;.846;.897;.941;1",
  "0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;.45 0 .55 1;.45 0 .55 1;.2 .7 .4 1;.45 0 .55 1;.45 0 .55 1;0 0 1 1",
);
/** The hop as the key comes out. */
const hop = smil("0;0;-1.8;0;0", "0;.801;.832;.862;1", "0 0 1 1;.2 .7 .4 1;.6 0 .8 .4;0 0 1 1");
/** The landing's squash and stretch: stretch up off the ground, squash on landing, wobble back. */
const jump = smil(
  "1 1;1 1;1.05 .93;.97 1.04;1.03 .97;.995 1.008;1 1;1 1",
  "0;.75;.801;.829;.862;.891;.921;1",
  "0 0 1 1;.45 0 .55 1;.2 .7 .4 1;.6 0 .8 .4;.45 0 .55 1;.45 0 .55 1;0 0 1 1",
);
/** Breathing: twice a loop, a touch wider and shorter. */
const breath = smil("1 1;1.02 .98;1 1;1.02 .98;1 1", "0;.25;.5;.75;1", ".45 0 .55 1;.45 0 .55 1;.45 0 .55 1;.45 0 .55 1");

/** Where the eyes look: right, then right-down at the key going behind, left, right at the peek, left again, ahead. */
const look = smil(
  "0 0;0 0;1.3 -.5;1.3 -.5;0 0;0 0;1.3 .3;1.3 .3;-2.3 .2;-2.3 .2;1.5 .2;1.5 .2;-2.1 .2;-2.1 .2;0 0;0 0",
  "0;.066;.091;.147;.174;.309;.353;.434;.474;.556;.579;.647;.674;.715;.753;1",
  "0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;0 0 1 1",
);
/** The glints drift inside the pupils, relative to the gaze (an animateMotion inside the blinking eyes): a little
 *  against the glances, and down to the pupils' lower half while it looks aside at the peeks. */
const glintDrift = smil(
  "-0,0;-0,0;-.52,.2;-.52,.2;-0,0;-0,0;-.52,-.12;-.52,-.12;.46,1.32;.46,1.32;-.3,1.32;-.3,1.32;.42,1.32;.42,1.32;-0,0;-0,0",
  "0;.066;.091;.147;.174;.309;.353;.434;.474;.556;.579;.647;.674;.715;.753;1",
  "0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;0 0 1 1",
);
/** The eyes stretch to 1.12 tall (about their lower ends, y 36.7) as it crouches for the whip, and back by the reveal. */
const eyeStretch = smil("1;1;1.12;1.12;1;1", "0;.753;.765;.809;.846;1", "0 0 1 1;.2 .7 .4 1;0 0 1 1;.45 0 .55 1;0 0 1 1");
/** The eyes narrow slyly while it peeks the key out: the original clips them, in the gaze's space, above a line that
 *  moves from 29 (above the eyes, which start at 30.5) down to 32.2 and back, cutting the top 1.7 off the 6.2-tall
 *  eyes from .474 to .715. */
const lidLine = smil("29;29;32.2;32.2;29;29", "0;.434;.474;.715;.753;1", "0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;0 0 1 1");
const EYE_TOP = 30.5, EYE_H = 6.2;
const lid = (t: number) => Math.max(0, (lidLine(t)[0] - EYE_TOP) / EYE_H);

// ---- the eyes' blinks ----

/** The original's eye scale about their middle (y 33.6): "1;1;.08;1;1;.08;1;1;.08;.08;1;1" at
 *  "0;.182;.197;.221;.547;.562;.585;.862;.876;.935;.953;1". So two blinks, shut at .197 and .562, closing in 102 ms
 *  and opening in 163 and 156 ms, linear (keySplines 0 0 1 1); and a third, shut from .876 to .935 (under the happy
 *  ^ ^), opening by .953, whose keys are eased (.6 0 .8 .4 closing, .2 .7 .4 1 opening). */
const BLINK: BlinkShape = { close: at(0.197) - at(0.182), depth: 0.08, ease: "linear" };
/** The happy close. Its keys span 95 ms to close and 122 to open, but the strong ease-in and sharp ease-out leave
 *  the eyes barely moving until the last 40 ms or so of the close, and nearly open 50 ms after .935; so it runs
 *  over the lengths that fit those curves best (least squares, 1 ms steps): 47 and 54 ms, "linear", which fits them
 *  with half the error of "smooth" (best 46 and 54 ms) and better than the original's own spans with either ease. */
const HAPPY_BLINK: Blink = { at: at(0.876), close: 47, hold: at(0.935) - at(0.876), open: 54, ease: "linear" };
const BLINKS: Blink[] = [
  { at: at(0.197), open: at(0.221) - at(0.197) },
  { at: at(0.562), open: at(0.585) - at(0.562) },
  HAPPY_BLINK,
];

// ---- sampling the channels into tracks ----

/** Every key of the given channels, plus every 20 ms, so the eased stretches between keys hold when joined linearly;
 *  every 5 ms through the whip and the hop (.8 to .87), whose sharp ease-outs cover most of their way in a few ms. */
function times(...channels: Channel[]): number[] {
  const all = new Set<number>(channels.flatMap((c) => c.keys.map(Math.round)));
  for (let t = 0; t <= D; t += 20) all.add(t);
  for (let t = at(0.8); t <= at(0.87); t += 5) all.add(t);
  return [...all].sort((a, b) => a - b);
}
/** A track sampled from f at the given times, joined linearly; runs that hold one value are kept to their ends. */
function track<V extends number | Vec>(ts: number[], f: (t: number) => V): Track<V> {
  const same = (a: V, b: V) => (typeof a === "number" ? Math.abs(a - (b as number)) < 1e-4 : Math.abs(a[0] - (b as Vec)[0]) + Math.abs(a[1] - (b as Vec)[1]) < 1e-4);
  const round = (v: V): V => (typeof v === "number" ? (+v.toFixed(4) as V) : ([+v[0].toFixed(4), +v[1].toFixed(4)] as unknown as V));
  const keys = ts.map((t) => [t, round(f(t)), "linear"] as const);
  return keys.filter((k, n) => n === 0 || n === keys.length - 1 || !(same(keys[n - 1][1], k[1]) && same(k[1], keys[n + 1][1])));
}
const vec = (c: Channel) => (t: number): Vec => c(t) as unknown as Vec;
const num = (c: Channel) => (t: number) => c(t)[0];

/** The body's squash and breathing (about the feet), without the 0.85 shrink. In the original these move only the
 *  body and eyes, while the key and hand stay unsquashed; the rig squashes its props with the body, so the props'
 *  positions are divided by it below, and their size by its average. */
const wobble = (t: number): Vec => {
  const j = jump(t), b = breath(t);
  return [j[0] * b[0], j[1] * b[1]];
};
const unsquash = (p: Vec, t: number): Vec => {
  const w = wobble(t);
  return [FEET[0] + (p[0] - FEET[0]) / w[0], FEET[1] + (p[1] - FEET[1]) / w[1]];
};
const unsquashSize = (t: number) => {
  const w = wobble(t);
  return 1 / Math.sqrt(w[0] * w[1]);
};
const hand = (t: number): Vec => [handX(t)[0], handY(t)[0]];
/** The rig can only scale a prop evenly, so the squash still stretches the key's shape about its grip (the ring's
 *  hole). The key is moved so that its middle, rather than its grip, is where the original has it: that halves
 *  the shape's misplacement at the breaths and the landing. KEY_MIDDLE is about the middle of the key's area, in
 *  its own frame (on its axis, 14.4 up from the hole). */
const KEY_MIDDLE: Vec = [0, -14.4];
const keyAt = (t: number): Vec => {
  const w = wobble(t), even = Math.sqrt(w[0] * w[1]), [x, y] = unsquash(hand(t), t);
  const a = (keyTilt(t)[0] * Math.PI) / 180, k = keySize(t)[0], [mx, my] = KEY_MIDDLE;
  const m: Vec = [k * (mx * Math.cos(a) - my * Math.sin(a)), k * (mx * Math.sin(a) + my * Math.cos(a))];
  return [x - (1 / even - 1 / w[0]) * m[0], y - (1 / even - 1 / w[1]) * m[1]];
};
const handTimes = times(handX, handY, jump, breath);
const twinkleTimes = times(handX, handY, keyTilt, keySize, twinkleSize, twinkleTurn).filter((t) => t >= at(0.86) && t <= at(0.94));

/** The key is behind the body from when it has swung out to the right (x 65, clear of the body) until it is out
 *  there again on the way back. */
const BEHIND = [[at(0.385), at(0.826)]] as const;

export const key: AgentAnimation = {
  duration: D,
  // drawn at the original card's size and height: the box shows it at the family's (see `frame`)
  frame: { scale: SHRINK, ground: FEET[1] + PLACE[1] },
  // key out in front, twinkling, eyes happy
  rest: at(0.897),
  body: {
    // the original's 0.85 shrink times its landing squash and breathing
    squash: track(times(jump, breath), (t) => {
      const w = wobble(t);
      return [SHRINK * w[0], SHRINK * w[1]] as Vec;
    }),
    lean: track(times(lean), num(lean)),
    // inside the original's shrink, so shrunk here
    lift: track(times(hop), (t) => PLACE[1] + SHRINK * hop(t)[0]),
    shift: [[0, PLACE[0]]],
  },
  eyes: {
    look: track(times(look), vec(look)),
    // the original's blinks, as timed there
    blink: BLINK,
    blinks: BLINKS,
    happy: [[at(0.876), at(0.935)]],
    // the sly squint: the original's clip line, as a lid
    lid: track(times(lidLine), lid),
    // the stretch before the whip
    scale: track(times(eyeStretch), (t) => [1, eyeStretch(t)[0]] as Vec),
    glint: track(times(glintDrift), vec(glintDrift)),
  },
  hands: {
    // the original has one hand, the `hand` prop: the rig's hands wait out of sight behind the body
    L: { path: [[0, [28, 38]]], behind: [[0, D]] },
    R: { path: [[0, [36, 38]]], behind: [[0, D]] },
  },
  props: {
    key: {
      attach: "world",
      offset: track(times(handX, handY, keyTilt, keySize, jump, breath), keyAt),
      rotate: track(times(keyTilt), num(keyTilt)),
      scale: track(times(keySize, jump, breath), (t) => keySize(t)[0] * unsquashSize(t)),
      behind: BEHIND,
    },
    // follows the key's ring as it tilts, so it is placed through the key's tilt and size
    sparkle: {
      attach: "world",
      offset: track(twinkleTimes, (t) => {
        const a = (keyTilt(t)[0] * Math.PI) / 180, s = keySize(t)[0], h = hand(t);
        const [x, y] = TWINKLE_ON_KEY;
        return unsquash([h[0] + s * (x * Math.cos(a) - y * Math.sin(a)), h[1] + s * (x * Math.sin(a) + y * Math.cos(a))], t);
      }),
      rotate: track(twinkleTimes, (t) => keyTilt(t)[0] + twinkleTurn(t)[0]),
      scale: track(twinkleTimes, (t) => 0.78 * keySize(t)[0] * twinkleSize(t)[0] * unsquashSize(t)),
      visible: [[at(0.871), at(0.935)]],
    },
    hand: {
      attach: "world",
      offset: track(handTimes, (t) => unsquash(hand(t), t)),
      scale: track(times(handSize, jump, breath), (t) => handSize(t)[0] * unsquashSize(t)),
      behind: BEHIND,
    },
  },
  events: [[at(0.853), "reveal"]],
};
