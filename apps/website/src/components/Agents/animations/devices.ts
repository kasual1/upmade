import { SHAPES } from "../tokens";
import type { AgentAnimation, PropTrack, Span, Track, Vec } from "../types";

/**
 * "Cross-platform", for the green triangle: it holds a phone up beside it, looking at it; the phone shrinks away
 * and a tablet pops up in its place (the hand slides out to the tablet's corner and the agent gives a little hop),
 * then the tablet gives way to a laptop the same way (the hand drops to the keyboard), then the laptop to the phone
 * again. Each switch: the old device swells a touch and shrinks to nothing, the new one overshoots (1.12, 0.97) and
 * settles. The agent glances away and back at each new device, and blinks while holding the tablet and the laptop.
 * Props: `phone`, `tablet`, `laptop`, `hand` (its one hand). Events: `tablet`, `laptop`, `phone` as each pops in.
 *
 * Ported from the landing page's SMIL agent (infinite.html): a 6 s loop of linear keyframes, except the body's
 * breathing, a 2 s spline (.45 0 .55 1) cycle. All the original's keys are reproduced below.
 *
 * The original's frame: its whole drawing is moved by (1 -5); the body is shrunk to 0.85 about (32 49) and set with
 * that point at (24 50), and breathes (1.02 x 0.98) about it; only the body hops. The devices and the hand are in a
 * group moved by (-3.5 0): they neither shrink, breathe nor hop. The original has a single hand (no left hand).
 *
 * How that maps onto the rig:
 * - The rig's body is centred at x 32, the original's at 25, so everything here is drawn 7 to the right (the body's
 *   middle at x 32) and a constant body.shift of -7 moves the whole agent, props included, back onto the original.
 * - The shrink is a constant body squash of 0.85 (constant, because the rig writes the squash with two decimals:
 *   breathing through it would step in visible 1% jumps), and the hop is the lift.
 * - The breathing is baked into the body outline instead: the original's own triangle path, scaled (1.02 x 0.98)
 *   about (32 49) on its spline, sampled every 40 ms. The eyes breathe with it in the original, so the breathing's
 *   pull on them (their middle moves about .25 down at the peak) is added to their look.
 * - The rig squashes and lifts its props with the body, so the devices and the hand are "world" props placed so that
 *   the squash and lift put them back where they are in the original; they are drawn 1/0.85 bigger (props/devices),
 *   so their scale tracks are the original's own. The rig's two hands wait out of sight behind the body.
 */
const D = 6000;
/** How often the breathing (outline and eyes) is sampled. */
const STEP = 40;
const SHRINK = 0.85;
const FEET = SHAPES.triangle.feet;
/** The body's shift: the original's body sits 7 left of the rig's middle. */
const SHIFT = -7;
/** Where the original's device group (moved by (1 -5) and (-3.5 0)) lands here, before the shift's -7. */
const GEAR_SHIFT: Vec = [1 - 3.5 - SHIFT, -5];
/** The point the original's body is shrunk and breathes about, in the body's own units. */
const PIVOT_BODY: Vec = [32, 49];
/** The middle of the eyes (what the original's blink scales about), in the body's own units. */
const EYES_MID: Vec = [32, SHAPES.triangle.eyesY + 3.1];

/** The original's triangle (very slightly different from the family token at the bottom corners). */
const OUTLINE =
  "M25.82 16.10L26.43 15.23L27.17 14.46L28.00 13.81L28.92 13.29L29.91 12.91L30.94 12.68L32.00 12.60L33.06 12.68L34.09 12.91L35.08 13.29L36.00 13.81L36.83 14.46L37.57 15.23L38.18 16.10L39.68 18.61L41.19 21.12L42.69 23.63L44.20 26.14L45.70 28.65L47.21 31.16L48.71 33.68L50.22 36.19L51.73 38.70L52.21 39.67L52.55 40.70L52.72 41.77L52.74 42.85L52.59 43.93L52.28 44.97L51.81 45.95L51.21 46.85L50.48 47.65L49.63 48.33L48.70 48.88L47.69 49.28L46.63 49.52L45.55 49.60L42.54 49.60L39.53 49.60L36.52 49.60L33.51 49.60L30.49 49.60L27.48 49.60L24.47 49.60L21.46 49.60L18.45 49.60L17.37 49.52L16.31 49.28L15.30 48.88L14.37 48.33L13.52 47.65L12.79 46.85L12.19 45.95L11.72 44.97L11.41 43.93L11.26 42.85L11.28 41.77L11.45 40.70L11.79 39.67L12.27 38.70L13.78 36.19L15.29 33.68L16.79 31.16L18.30 28.65L19.80 26.14L21.31 23.63L22.81 21.12L24.32 18.61Z";

// ---- the original's keyframes ----

/** A SMIL `values`/`keyTimes` pair, interpolated linearly (the original's default calcMode). */
type Keys = readonly (readonly [u: number, v: number | Vec])[];
const keys = (times: number[], values: (number | Vec)[]): Keys => times.map((u, n) => [u, values[n]] as const);

function linear(k: Keys, t: number): number | Vec {
  const u = t / D;
  if (u <= k[0][0]) return k[0][1];
  for (let n = 1; n < k.length; n++) {
    const [u1, b] = k[n];
    if (u > u1) continue;
    const [u0, a] = k[n - 1];
    const w = u1 > u0 ? (u - u0) / (u1 - u0) : 1;
    if (typeof a === "number") return a + ((b as number) - a) * w;
    return [a[0] + ((b as Vec)[0] - a[0]) * w, a[1] + ((b as Vec)[1] - a[1]) * w];
  }
  return k[k.length - 1][1];
}
const num = (k: Keys, t: number) => linear(k, t) as number;
const vec = (k: Keys, t: number) => linear(k, t) as Vec;

/** The body's hop (only the body moves): it dips 1, jumps 2.2 and lands, just as each new device has popped in. */
const HOP = keys(
  [0, 0.25, 0.27, 0.297, 0.325, 0.583, 0.603, 0.63, 0.658, 0.917, 0.937, 0.963, 0.992, 1],
  [0, 0, 1, -2.2, 0, 0, 1, -2.2, 0, 0, 1, -2.2, 0, 0],
);

/** Each device's scale about its own point: swells to 1.06 then vanishes, or pops in to 1.12, dips to .97, settles. */
const PHONE = keys(
  [0, 0.25, 0.263, 0.28, 0.933, 0.958, 0.98, 0.997, 1],
  [1, 1, 1.06, 0, 0, 1.12, 0.97, 1, 1],
);
const TABLET = keys(
  [0, 0.267, 0.292, 0.313, 0.33, 0.583, 0.597, 0.613, 1],
  [0, 0, 1.12, 0.97, 1, 1, 1.06, 0, 0],
);
const LAPTOP = keys(
  [0, 0.6, 0.625, 0.647, 0.663, 0.917, 0.93, 0.947, 1],
  [0, 0, 1.12, 0.97, 1, 1, 1.06, 0, 0],
);
/** The points the devices scale about, in the original's device group. */
const PIVOT = { phone: [44.5, 40.2], tablet: [46, 42.2], laptop: [45.2, 42] } as const satisfies Record<string, Vec>;

/** The hand: on the phone's lower right, out to the tablet's right edge, down onto the laptop's base, and back. */
const HAND = keys(
  [0, 0.25, 0.27, 0.3, 0.583, 0.603, 0.633, 0.917, 0.937, 0.967, 1],
  [[50.9, 47.6], [50.9, 47.6], [50.9, 47.6], [56.4, 47.4], [56.4, 47.4], [56.4, 47.4], [56.4, 51], [56.4, 51], [56.4, 51], [50.9, 47.6], [50.9, 47.6]],
);

/** Where the eyes look (in the body's units): down at the held device, and briefly ahead as each switch begins. */
const LOOK = keys(
  [0, 0.092, 0.108, 0.192, 0.208, 0.425, 0.442, 0.525, 0.542, 0.758, 0.775, 0.858, 0.875, 1],
  [[1.3, 0.9], [1.3, 0.9], [-0.4, 0], [-0.4, 0], [1.3, 0.9], [1.3, 0.9], [-0.4, 0], [-0.4, 0], [1.3, 0.9], [1.3, 0.9], [-0.4, 0], [-0.4, 0], [1.3, 0.9], [1.3, 0.9]],
);

/** The breathing: 1 to (1.02 .98) and back every 2 s, each half on the spline .45 0 .55 1. */
function breathe(t: number): Vec {
  const half = 1000;
  const n = Math.floor(t / half), w = (t - n * half) / half;
  const e = spline(0.45, 0, 0.55, 1, Math.min(1, w));
  const peak = n % 2 === 0 ? e : 1 - e;
  return [1 + 0.02 * peak, 1 - 0.02 * peak];
}
/** A SMIL keySpline (cubic bezier from (0 0) to (1 1)) at progress x. */
function spline(x1: number, y1: number, x2: number, y2: number, x: number): number {
  const bez = (a: number, b: number, u: number) => 3 * (1 - u) ** 2 * u * a + 3 * (1 - u) * u * u * b + u ** 3;
  let lo = 0, hi = 1;
  for (let k = 0; k < 30; k++) {
    const mid = (lo + hi) / 2;
    if (bez(x1, x2, mid) < x) lo = mid;
    else hi = mid;
  }
  return bez(y1, y2, (lo + hi) / 2);
}

// ---- the body: the shrink as the squash, the hop as the lift, the breathing in the outline ----

/**
 * The original puts the body's (32 49) at (25 45) plus the hop; the rig squashes by .85 about its feet (32 49.56)
 * and, with the 7 to the right, that point must land at (32 45 + hop).
 */
const SET_DOWN = 45 - FEET[1] - (PIVOT_BODY[1] - FEET[1]) * SHRINK;
const liftAt = (t: number) => SET_DOWN + num(HOP, t);

/** A point of the body, breathed about (32 49). */
const breathed = (p: Vec, s: Vec): Vec => [PIVOT_BODY[0] + (p[0] - PIVOT_BODY[0]) * s[0], PIVOT_BODY[1] + (p[1] - PIVOT_BODY[1]) * s[1]];
const OUTLINE_NUMBERS = OUTLINE.match(/\d+\.\d+/g)!.map(Number);
/** The outline at time t: every point of the original's path breathed (same commands each time, so it interpolates). */
const outlineAt = (t: number) => {
  const s = breathe(t), v = OUTLINE_NUMBERS;
  let n = 0;
  return OUTLINE.replace(/(\d+\.\d+) (\d+\.\d+)/g, () => {
    const [x, y] = breathed([v[n], v[n + 1]], s);
    n += 2;
    return `${x.toFixed(2)} ${y.toFixed(2)}`;
  });
};
/** The look, inside the breathing as in the original: the eyes' middle and their offset both breathe. */
const lookAt = (t: number): Vec => {
  const s = breathe(t), l = vec(LOOK, t);
  const m = breathed([EYES_MID[0] + l[0], EYES_MID[1] + l[1]], s);
  return [m[0] - EYES_MID[0], m[1] - EYES_MID[1]];
};

/** A point of the original drawing (already moved here), placed so that the rig's squash and lift put it back. */
const unsquash = (p: Vec, t: number): Vec => [FEET[0] + (p[0] - FEET[0]) / SHRINK, FEET[1] + (p[1] - liftAt(t) - FEET[1]) / SHRINK];

// ---- sampling ----

const timesOf = (...ks: Keys[]) => {
  const set = new Set<number>();
  for (const k of ks) for (const [u] of k) set.add(Math.round(u * D * 1000) / 1000);
  return [...set].sort((a, b) => a - b);
};
/** Every STEP ms, plus every key of the original, so its corners are hit exactly. */
const BREATH_FRAMES = (() => {
  const set = new Set(timesOf(LOOK));
  for (let t = 0; t <= D; t += STEP) set.add(t);
  return [...set].sort((a, b) => a - b);
})();
/** Everything else is linear between the original's keys, so only those (of the tracks it depends on) are needed. */
const track = <V,>(times: number[], f: (t: number) => V): Track<V> => times.map((t) => [t, f(t), "linear"] as const);
const gear = (p: Vec): Vec => [p[0] + GEAR_SHIFT[0], p[1] + GEAR_SHIFT[1]];

/** When a device is drawn: while its scale is above 0. */
function shown(k: Keys): Span[] {
  const spans: Span[] = [];
  let from = -1;
  for (let n = 0; n < k.length; n++) {
    const on = n < k.length - 1 && ((k[n][1] as number) > 0 || (k[n + 1][1] as number) > 0);
    if (on && from < 0) from = k[n][0] * D;
    if (!on && from >= 0) {
      spans.push([from, k[n][0] * D]);
      from = -1;
    }
  }
  return spans;
}

const device = (k: Keys, pivot: Vec): PropTrack => ({
  attach: "world",
  // the device stays put while the body (and so the rig's prop layer) hops
  offset: track(timesOf(HOP), (t) => unsquash(gear(pivot), t)),
  scale: k.map(([u, v]) => [u * D, v as number, "linear"] as const),
  visible: shown(k),
});

export const devices: AgentAnimation = {
  duration: D,
  // holding the phone, looking at it
  rest: 300,
  body: {
    squash: [[0, [SHRINK, SHRINK]]],
    shift: [[0, SHIFT]],
    lift: track(timesOf(HOP), liftAt),
    outline: track(BREATH_FRAMES, outlineAt),
  },
  eyes: {
    look: track(BREATH_FRAMES, lookAt),
    // the original's two blinks (holding the tablet, then the laptop): scale y 1 to .08 over .433 to .447 of the
    // loop (84 ms), straight back open by .47 (138 ms); the same from .833 to .847 to .87
    blink: { close: 84, open: 138, depth: 0.08 },
    blinks: [0.447 * D, 0.847 * D],
  },
  hands: {
    // the original has one hand, the `hand` prop; the rig's two wait out of sight behind the middle of the body
    L: { path: [[0, [32, 38]]], behind: [[0, D]] },
    R: { path: [[0, [32, 38]]], behind: [[0, D]] },
  },
  // drawn in this order, as in the original: the phone, the tablet, the laptop, then the hand over them
  props: {
    phone: device(PHONE, PIVOT.phone),
    tablet: device(TABLET, PIVOT.tablet),
    laptop: device(LAPTOP, PIVOT.laptop),
    hand: { attach: "world", offset: track(timesOf(HAND, HOP), (t) => unsquash(gear(vec(HAND, t)), t)) },
  },
  // as each device starts popping in
  events: [[0.267 * D, "tablet"], [0.6 * D, "laptop"], [0.933 * D, "phone"]],
};
