import { SHAPES } from "../tokens";
import { openness } from "../timeline";
import type { AgentAnimation, Blink, BlinkShape, Track, Vec } from "../types";

/**
 * Reveals a golden key ("Open source"), for the violet squircle: it stands holding the key at its side and glances
 * about, swings it out and round behind its back, peeks it out past its side twice while looking left and right
 * (eyes narrowed, slyly), then whips it out in front with a little hop, a twinkle on the key and happy eyes.
 * Props: `key` (the key), `sparkle` (its twinkle) and `hand` (the hand holding it); and, for the eyes, `glintCovers`
 * and `glints` (the glints drifting inside the pupils) and `tallEyes` (their stretch before the whip), which do what
 * the rig's eyes cannot.
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
/** The glints drift inside the pupils, relative to the gaze (an animateMotion inside the gazing group): a little
 *  against the glances, and down to the pupils' lower half while it looks aside at the peeks. */
const glintDrift = smil(
  "-0,0;-0,0;-.52,.2;-.52,.2;-0,0;-0,0;-.52,-.12;-.52,-.12;.46,1.32;.46,1.32;-.3,1.32;-.3,1.32;.42,1.32;.42,1.32;-0,0;-0,0",
  "0;.066;.091;.147;.174;.309;.353;.434;.474;.556;.579;.647;.674;.715;.753;1",
  "0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1;0 0 1 1",
);
/** The eyes stretch to 1.12 tall (about their lower ends) as it crouches for the whip, and back by the reveal. */
const eyeStretch = smil("1;1;1.12;1.12;1;1", "0;.753;.765;.809;.846;1", "0 0 1 1;.2 .7 .4 1;0 0 1 1;.45 0 .55 1;0 0 1 1");

// ---- the eyes' blinks and squint ----

/** The original's eye scale about their middle (y 33.6): "1;1;.08;1;1;.08;1;1;.08;.08;1;1" at
 *  "0;.182;.197;.221;.547;.562;.585;.862;.876;.935;.953;1". So two blinks, shut at .197 and .562, closing in 102 ms
 *  and opening in 163 and 156 ms (linear); and a third shut from .876 to .935 (under the happy ^ ^), opening by
 *  .953. That one's keys span 95 ms to close and 122 to open, but with a strong ease-in (.6 0 .8 .4) and a sharp
 *  ease-out (.2 .7 .4 1): the eyes barely move until the last 40 ms or so, and are nearly open 50 ms after .935. The
 *  rig eases every blink with a smoothstep, so those two are the smoothstep lengths that fit the original's curves
 *  best (least squares, 1 ms steps): 46 and 54 ms. */
const BLINK: BlinkShape = { close: at(0.197) - at(0.182), depth: 0.08 };
const BLINKS: Blink[] = [
  { at: at(0.197), open: at(0.221) - at(0.197) },
  { at: at(0.562), open: at(0.585) - at(0.562) },
  { at: at(0.876), close: 46, hold: at(0.935) - at(0.876), open: 54 },
];
/** The eyes narrow while it peeks the key out: the original clips them above a line that moves "29;29;32.2;32.2;29;29"
 *  at "0;.434;.474;.715;.753;1" (eased .45 0 .55 1), i.e. it cuts the top 1.7 off the 6.2-tall eyes (30.5 to 36.7)
 *  from .474 to .715. Here that is a long shallow blink to the same height, (36.7 - 32.2) / 6.2 open... */
const EYE_TOP = 30.5, EYE_H = 6.2, EYE_MID = EYE_TOP + EYE_H / 2;
const SQUINT: Blink = {
  at: at(0.474), close: at(0.474) - at(0.434), hold: at(0.715) - at(0.474), open: at(0.753) - at(0.715),
  depth: (EYE_TOP + EYE_H - 32.2) / EYE_H,
};
/** ...and since a blink shrinks the eyes about their middle while the clip keeps their lower ends where they are, the
 *  eyes are let down by the difference: the middle of what the original shows (the blink-scaled eyes, cut at the
 *  clip line) less the middle of the eyes. Zero outside the squint. */
const squintDrop = (t: number) => {
  const s = openness(BLINKS, t, BLINK, D), q = openness([SQUINT], t, undefined, D);
  const top = Math.max(EYE_MID - (EYE_H / 2) * s, EYE_TOP + EYE_H * (1 - q)), bottom = EYE_MID + (EYE_H / 2) * s;
  return Math.max(0, (top + bottom) / 2 - EYE_MID);
};
/** How open the rig draws the eyes. */
const open = (t: number) => openness([...BLINKS, SQUINT], t, BLINK, D);
/** The gaze as drawn: the original's look, let down for the squint. */
const gaze = (t: number): Vec => [look(t)[0], look(t)[1] + squintDrop(t)];

// ---- sampling the channels into tracks ----

/** Every key of the given channels, plus every 20 ms, so the eased stretches between keys hold when joined linearly;
 *  every 5 ms through the whip and the hop (.8 to .87), whose sharp ease-outs cover most of their way in a few ms,
 *  and through the blink in the squint (where the eyes' drop changes quickly). */
function times(...channels: Channel[]): number[] {
  const all = new Set<number>(channels.flatMap((c) => c.keys.map(Math.round)));
  for (let t = 0; t <= D; t += 20) all.add(t);
  for (let t = at(0.8); t <= at(0.87); t += 5) all.add(t);
  for (let t = at(0.547); t <= at(0.585); t += 5) all.add(t);
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
/** The squash the rig actually applies: it writes the body's scale with two decimals, so 0.85 x 1.0065 is drawn at
 *  0.86. Undoing that (rather than the exact squash) keeps the key and hand where the original has them, to 0.01
 *  units instead of up to 0.15. */
const drawn = (t: number): Vec => {
  const w = wobble(t), r = (v: number) => Math.round(SHRINK * v * 100) / 100 / SHRINK;
  return [r(w[0]), r(w[1])];
};
const unsquash = (p: Vec, t: number): Vec => {
  const w = drawn(t);
  return [FEET[0] + (p[0] - FEET[0]) / w[0], FEET[1] + (p[1] - FEET[1]) / w[1]];
};
const unsquashSize = (t: number) => {
  const w = drawn(t);
  return 1 / Math.sqrt(w[0] * w[1]);
};
const hand = (t: number): Vec => [handX(t)[0], handY(t)[0]];
const handTimes = times(handX, handY, jump, breath);
const twinkleTimes = times(handX, handY, keyTilt, keySize, twinkleSize, twinkleTurn).filter((t) => t >= at(0.86) && t <= at(0.94));

/** The drifted glints do not close with the eyes, so they are hidden through the blink at .562 while the eyes are
 *  less than half open (its own glints, which the covers hide, are all but shut with the eyes by then). */
const half = (b: Blink) => {
  const c = b.close ?? BLINK.close ?? 45, o = b.open ?? BLINK.open ?? 45, d = b.depth ?? BLINK.depth ?? 0.1;
  // half open where smoothstep(u) = y: u = .5 - sin(asin(1 - 2y) / 3), u being 0 shut and 1 open
  const y = (0.5 - d) / (1 - d), inv = 0.5 - Math.sin(Math.asin(1 - 2 * y) / 3);
  return [Math.round(b.at - c * inv), Math.round(b.at + (b.hold ?? 0) + o * inv)] as const;
};
const BLINK2 = half(BLINKS[1]);

/** The key is behind the body from when it has swung out to the right (x 65, clear of the body) until it is out
 *  there again on the way back. */
const BEHIND = [[at(0.385), at(0.826)]] as const;

export const key: AgentAnimation = {
  duration: D,
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
    look: track(times(look, glintDrift), gaze),
    // the original's blinks, as timed there, and the squint
    blink: BLINK,
    blinks: [...BLINKS, SQUINT],
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
      offset: track(handTimes, (t) => unsquash(hand(t), t)),
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
    // the drifting glints: an ink pair hides the rig's glints (following the gaze, and the glints' move towards the
    // eyes' middle as the squint narrows them), a white pair drifts inside the pupils (where the original has them,
    // which the squint's drop does not move); shown only while the drift is away from zero, and not during the blink
    glintCovers: {
      attach: "world",
      offset: track(times(look, glintDrift), (t) => [gaze(t)[0], gaze(t)[1] + (1 - open(t)) * (EYE_MID - (EYE_TOP + 1.7))] as Vec),
      visible: [[at(0.066), at(0.174)], [at(0.309), BLINK2[0]], [BLINK2[1], at(0.753)]],
    },
    glints: {
      attach: "world",
      offset: track(times(look, glintDrift), (t) => [look(t)[0] + glintDrift(t)[0], look(t)[1] + glintDrift(t)[1]] as Vec),
      visible: [[at(0.066), at(0.174)], [at(0.309), BLINK2[0]], [BLINK2[1], at(0.753)]],
    },
    // the eyes' stretch: a copy of the eyes slid up by the extra height (the gaze is straight ahead by then)
    tallEyes: {
      attach: "world",
      offset: track(times(eyeStretch).filter((t) => t >= at(0.75) && t <= at(0.85)), (t) => [0, -(eyeStretch(t)[0] - 1) * 6.2] as Vec),
      visible: [[at(0.753), at(0.846)]],
    },
  },
  events: [[at(0.853), "reveal"]],
};
