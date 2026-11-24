import { SHAPES } from "../tokens";
import type { AgentAnimation, PropTrack, Span, Track, Vec } from "../types";

/**
 * "Framework sign", for the pink squircle: it holds up a sign on a stick showing a framework's logo (React, then Vue,
 * then Angular). The stick sways very slightly all the time; every time the page moves on to the next framework the
 * sign flips (squeezes edge-on and opens again with the next logo) while the stick lifts and the agent gives a little
 * squashed hop. The agent breathes and blinks throughout.
 * Props: `pole`, `sign1`..`sign13` (the sign at widths .01..1, see below), `hand`. Event: `flip`, as the sign is
 * edge-on: show the next framework's logo on the signs.
 *
 * Ported from the landing page (infinite.html, the .fw-sign agent of "Easy to get started"), which is driven by:
 * - the page script: it types each framework's snippet in turn and, as each one starts, flips the sign (adds the
 *   `flip` class) and swaps its logo 250 ms later. One framework lasts 350 + typing + 2950 ms; with the snippets'
 *   lengths (22 ms a character, 140 ms a line break) that is 6170 ms (React), 6824 ms (Vue) and 9348 ms (Angular),
 *   so the loop here is their sum, 22342 ms. It starts with the React logo just flipped in and settled: the page flips as each framework's turn
 *   begins, and the loop is phased so that each flip falls in the last 500 ms before the next framework's turn (the
 *   intervals between flips, 6824, 9348 and 6170 ms, are the page's).
 * - CSS keyframes, each 500 ms per flip: fs-flip (the sign's scaleX 1, 0 at 50%, 1, on cubic-bezier(.45,0,.55,1)),
 *   fs-lift (the stick, sign and hand up 3 at 45%) and fs-hop (the agent up 2 and scaled (1.02 .97) about (43 47) at
 *   45%), both on the page's spring cubic-bezier(.3,1.5,.5,1), which overshoots; and fs-sway, an endless 3.6 s cycle
 *   of the stick, sign and hand: rotate -1.6deg, then 1.6deg and up .6 at 50%, about (43 47), on (.45,0,.55,1).
 * - SMIL on the body: breathing (1.02 .98) about its feet every 3.4 s on spline .45 0 .55 1, and a blink every 4.2 s
 *   (shut at .63 of the cycle).
 * Those cycles are not whole fractions of the 22342 ms loop, so here they are stretched to the nearest whole number of
 * cycles per loop (sway 6 x 3724 ms, breathing 7 x 3192 ms, blinks 5 x 4468 ms) so the loop has no seam.
 *
 * The original's frame: the body is the squircle shrunk to 0.74 about (32 49) and set with that point at (25 62.5);
 * its eyes are raised 2.6. The stick, sign and hand are full size around (43 47), the hand's centre.
 * Here the rig's body is shrunk by a constant squash of 0.74 and set down by a constant lift, and the whole drawing is
 * the original moved right by 7 (the body's middle at x 32, where the rig squashes it about); the demo shifts the agent
 * back left by 7/64 of its width. The breathing and the hop, which squash the body about other points, are drawn by the
 * body outline track (the squircle's points moved exactly where the original puts them) and the eyes' look (their
 * centre moved likewise), so the rig's squash stays even and the props, scaled 1/0.74, sit exactly where they are in
 * the original. The rig's own hands wait out of sight behind the body; the holding hand is the `hand` prop.
 */
const D = 6170 + 6824 + 9348;
const FLIP = 500;
/** When each flip starts (to Vue, to Angular, to React): 500 ms before the end of each framework's turn. */
const FLIPS = [6170 - FLIP, 6170 + 6824 - FLIP, D - FLIP];
const SHRINK = 0.74;
const SHIFT = 7;
const FEET = SHAPES.squircle.feet;
/** The rig's lift that puts the body's (32 49) at y 62.5 with the 0.74 squash about its feet (32 49.5). */
const LIFT = 62.5 - FEET[1] + (FEET[1] - 49) * SHRINK;
/** The stick's pivot and the hand's centre, in the original. */
const PIVOT: Vec = [43, 47];

// ---- easing curves ----

/** A CSS cubic-bezier (or SMIL keySpline) from (0 0) to (1 1) at progress x. */
function bezier(x1: number, y1: number, x2: number, y2: number, x: number): number {
  const b = (a: number, c: number, u: number) => 3 * (1 - u) ** 2 * u * a + 3 * (1 - u) * u * u * c + u ** 3;
  let lo = 0, hi = 1;
  for (let k = 0; k < 40; k++) {
    const mid = (lo + hi) / 2;
    if (b(x1, x2, mid) < x) lo = mid;
    else hi = mid;
  }
  return b(y1, y2, (lo + hi) / 2);
}
const smooth = (u: number) => bezier(0.45, 0, 0.55, 1, u);
const spring = (u: number) => bezier(0.3, 1.5, 0.5, 1, u);

/** How far into a flip t is (0..1), or -1 outside the flips. */
function flipAt(t: number): number {
  for (const s of FLIPS) if (t >= s && t <= s + FLIP) return (t - s) / FLIP;
  return -1;
}
/** fs-lift / fs-hop progress: 0 to 1 at 45% and back to 0, each part on the spring (so it overshoots). */
function hopAt(t: number): number {
  const u = flipAt(t);
  if (u < 0) return 0;
  return u <= 0.45 ? spring(u / 0.45) : 1 - spring((u - 0.45) / 0.55);
}
/** fs-flip: the sign's width, 1 to 0 at 50% and back to 1. */
function widthAt(t: number): number {
  const u = flipAt(t);
  if (u < 0) return 1;
  return u <= 0.5 ? 1 - smooth(u / 0.5) : smooth((u - 0.5) / 0.5);
}
/** A cycle that goes 0 to 1 at its middle and back, each half on (.45,0,.55,1), `n` times per loop. */
function cycle(t: number, n: number): number {
  const p = D / n;
  const u = (t % p) / p;
  return u <= 0.5 ? smooth(u / 0.5) : 1 - smooth((u - 0.5) / 0.5);
}
const breatheAt = (t: number): Vec => {
  const c = cycle(t, 7);
  return [1 + 0.02 * c, 1 - 0.02 * c];
};
/** fs-sway: the stick's angle and its lift inside the rotation. */
const swayAt = (t: number) => {
  const c = cycle(t, 6);
  return { angle: -1.6 + 3.2 * c, up: -0.6 * c };
};

// ---- from the original's drawing to the rig ----

/** A point of the body (the original's unshrunk squircle) to where the original draws it at time t. */
function bodyPoint(p: Vec, t: number): Vec {
  const b = breatheAt(t);
  // breathing about (32 49), then shrunk to .74 with (32 49) set at (25 62.5)
  const placed: Vec = [25 + SHRINK * b[0] * (p[0] - 32), 62.5 + SHRINK * b[1] * (p[1] - 49)];
  // fs-hop: up 2 and scaled (1.02 .97) about (43 47)
  const k = hopAt(t);
  return [PIVOT[0] + (1 + 0.02 * k) * (placed[0] - PIVOT[0]), PIVOT[1] + (1 - 0.03 * k) * (placed[1] - PIVOT[1]) - 2 * k];
}
/** A point of the original's drawing to the rig's coordinates, which the rig's squash and lift put back there. */
const toRig = (v: Vec): Vec => [FEET[0] + (v[0] + SHIFT - FEET[0]) / SHRINK, FEET[1] + (v[1] - LIFT - FEET[1]) / SHRINK];

const NUM = /-?\d*\.?\d+/g;
/** The squircle's outline with every point moved to where the original draws it at t. */
function outlineAt(t: number): string {
  let n = 0, x = 0;
  return SHAPES.squircle.d.replace(NUM, (s) => {
    const v = parseFloat(s);
    if (n++ % 2 === 0) {
      x = v;
      return "";
    }
    const q = toRig(bodyPoint([x, v], t));
    return `${q[0].toFixed(2)} ${q[1].toFixed(2)}`;
  }).replace(/([ML]) /g, "$1");
}
/** The eyes: the original raises them 2.6 in the body; the rig's are centred at (32 33.6). */
function lookAt(t: number): Vec {
  const q = toRig(bodyPoint([32, 33.6 - 2.6], t));
  return [q[0] - 32, q[1] - 33.6];
}
/** Where the stick's pivot is drawn (lifted by fs-lift, and by the sway's own lift inside its rotation). */
function pivotAt(t: number): Vec {
  const { angle, up } = swayAt(t);
  const a = (angle * Math.PI) / 180;
  return toRig([PIVOT[0] - Math.sin(a) * up, PIVOT[1] + Math.cos(a) * up - 3 * hopAt(t)]);
}

// ---- sampling ----

/** Every 100 ms, and every 10 ms through each flip (where the spring and the squeeze move fast). */
const frames: number[] = (() => {
  const set = new Set<number>();
  for (let t = 0; t <= D; t += 100) set.add(t);
  for (const s of FLIPS) for (let t = s; t <= s + FLIP; t += 10) set.add(t);
  set.add(D);
  return [...set].sort((a, b) => a - b);
})();
const track = <V,>(f: (t: number) => V): Track<V> => frames.map((t) => [t, f(t), "linear"] as const);

/** The stick, the signs and the hand all hang off the sway pivot, so they share these tracks. */
const held = (): PropTrack => ({
  attach: "world",
  offset: track(pivotAt),
  rotate: track((t) => swayAt(t).angle),
  scale: [[0, 1 / SHRINK]],
});

/**
 * The flip: the sign is drawn at fixed widths (sign1 at .01 ... sign13 face-on), and at each moment the one nearest the
 * original's width is shown. Besides every tenth there are three hairline widths, .01, .03 and .06, so that as it turns
 * edge-on the sign thins to a sliver as in the original (whose squeezed outline still shows as a thin dark line) rather
 * than stopping at a tenth of its width (3 units). None is shown below .004 (about 26 ms around edge-on), where the
 * original's sliver is under a seventh of a unit. Worked out every 2 ms.
 */
/** The widths the `signN` props are drawn at. */
export const FRAMEWORK_SIGN_WIDTHS = [0.01, 0.03, 0.06, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
/** Which `signN` (1-based) to show at width w, or 0 for none. */
function levelAt(w: number): number {
  if (w <= 0.004) return 0;
  let best = 0;
  FRAMEWORK_SIGN_WIDTHS.forEach((x, k) => {
    if (Math.abs(x - w) < Math.abs(FRAMEWORK_SIGN_WIDTHS[best] - w)) best = k;
  });
  return best + 1;
}
function signSpans(level: number): Span[] {
  const spans: Span[] = [];
  let from = -1;
  for (let t = 0; t <= D; t += 2) {
    const on = t < D && levelAt(widthAt(t)) === level;
    if (on && from < 0) from = t;
    if (!on && from >= 0) {
      spans.push([from, t]);
      from = -1;
    }
  }
  return spans;
}
const signs: Record<string, PropTrack> = {};
FRAMEWORK_SIGN_WIDTHS.forEach((_, k) => (signs[`sign${k + 1}`] = { ...held(), visible: signSpans(k + 1) }));

/** The blinks: shut at .63 of each 4468 ms cycle. */
const BLINKS = Array.from({ length: 5 }, (_, n) => Math.round((n + 0.63) * (D / 5)));

export const frameworkSign: AgentAnimation = {
  duration: D,
  // holding up the React sign
  rest: 0,
  body: {
    squash: [[0, [SHRINK, SHRINK]]],
    lift: [[0, LIFT]],
    outline: track(outlineAt),
  },
  eyes: { look: track(lookAt), blinks: BLINKS },
  hands: {
    // the original has one hand, the `hand` prop; the rig's two wait out of sight behind the middle of the body
    L: { path: [[0, [32, 32]]], behind: [[0, D]] },
    R: { path: [[0, [32, 32]]], behind: [[0, D]] },
  },
  // drawn in the original's order: the stick, the sign over it, then the hand gripping the stick
  props: { pole: held(), ...signs, hand: held() },
  // the page swaps the logo 250 ms into each flip, while the sign is edge-on
  events: FLIPS.map((s) => [s + FLIP / 2, "flip"] as const),
};
