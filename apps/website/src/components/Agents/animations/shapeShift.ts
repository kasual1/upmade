import type { AgentAnimation, Track, Vec } from "../types";
import { SHAPES, type ShapeName } from "../tokens";

/**
 * "Agents changing shape: circle, triangle, square" (a feature agent on infinite.html), in a 6.3 s loop: the blue
 * circle crouches, jumps and vanishes in a poof of cloud (0.5-0.9 s), and out of the poof the green triangle pops
 * up with a little overshoot (1.05-1.37 s); at 2.6-3.5 s the triangle does the same and the pink square appears, and
 * at 4.7-5.6 s the square turns back into the circle.
 *
 * The original does not morph one outline into another: it is three agents (each with its own colour and eyes)
 * drawn on the same spot, each shrunk to nothing except while it is "the" agent, plus three clouds drawn on top of
 * them that hide each swap. So this is four animations for four <Agent>s laid over one another in that order:
 *   - `shapeShiftCircle`, `shapeShiftTriangle`, `shapeShiftSquare`: the three agents. Each original nests
 *     translate (its jump) > scale about (32 40) (its appearing and vanishing) > a breathing scale about (32 49) >
 *     the body. The rig has one body transform (lift, then a scale about the feet), so all three are baked into
 *     `squash` and `lift`, sampled densely (they are a product of linear tracks and an eased breath). The rig's hands
 *     wait behind the middle of each body (the original has no hands) and shrink with it, so they never show.
 *   - `shapeShift`: a "stage" with no body (an empty outline, no eyes) holding the three clouds as world props, so
 *     they are drawn at full size on top of all three agents, as in the original.
 * All the original's tracks are linear (no calcMode), except the breathing (keySplines .45 0 .55 1).
 * All four rest at 0 (with reduced motion they must agree, or more than one agent would show): the circle.
 * Events (on the stage): `triangle`, `square` and `circle`, as each new agent starts to appear out of its cloud.
 */

const D = 6300;
/** the original's keyTimes are fractions of the 6.3 s loop */
const ms = (f: number) => Math.round(f * D);

type Lin = readonly (readonly [number, number])[];
/** a SMIL `values` / `keyTimes` pair of numbers (only the y of a translate) as [ms, value] pairs */
function smil(values: string, keyTimes: string): Lin {
  const ts = keyTimes.split(";").map(Number);
  return values.split(";").map((v, n) => {
    const parts = v.trim().split(/\s+/).map(Number);
    return [ms(ts[n]), parts[parts.length - 1]] as const;
  });
}

/** piecewise-linear value of [ms, value] pairs at t, as SMIL's calcMode linear */
function lin(track: Lin, t: number): number {
  if (t <= track[0][0]) return track[0][1];
  for (let n = 1; n < track.length; n++) {
    const [t1, b] = track[n];
    if (t > t1) continue;
    const [t0, a] = track[n - 1];
    return t1 > t0 ? a + ((b - a) * (t - t0)) / (t1 - t0) : b;
  }
  return track[track.length - 1][1];
}

/** cubic-bezier(.45, 0, .55, 1), the breathing's keySplines */
function spline(x: number): number {
  const bez = (p1: number, p2: number, u: number) => 3 * (1 - u) * (1 - u) * u * p1 + 3 * (1 - u) * u * u * p2 + u * u * u;
  let lo = 0, hi = 1;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (bez(0.45, 0.55, mid) < x) lo = mid;
    else hi = mid;
  }
  return bez(0, 1, (lo + hi) / 2);
}

/**
 * The breathing: [1.02, .98] at its middle, about (32 49). The original's cycle is 3.4 s, which does not divide the
 * 6.3 s loop, so it drifts against it; here it is 3.15 s, two breaths a loop, so the loop joins up.
 */
const BREATH = D / 2;
function breath(t: number): Vec {
  const f = (t % BREATH) / BREATH;
  const u = f < 0.5 ? spline(f / 0.5) : 1 - spline((f - 0.5) / 0.5);
  return [1 + 0.02 * u, 1 - 0.02 * u];
}

/** where the original scales each agent about (its middle, near the bottom) and where it breathes about */
const POP_Y = 40;
const BREATH_Y = 49;

/**
 * One agent's body tracks from the original's jump (`hop`, the y of its translate) and appearing/vanishing (`pop`,
 * a uniform scale about (32 40)). A point at height y ends up at hop + 40 + s (49 + by (y - 49) - 40); the rig puts
 * it at lift + F + sy (y - F) about its feet F, so sy = s by, sx = s bx and lift = hop + 40 + 9s - F + s by (F - 49).
 */
function bodyTracks(shape: ShapeName, hop: Lin, pop: Lin): { lift: Track<number>; squash: Track<Vec> } {
  const F = SHAPES[shape].feet[1];
  // every key of either track, plus every 30 ms (the breath is eased, and lift multiplies two moving values)
  const times = new Set<number>([...hop, ...pop].map(([t]) => t));
  for (let t = 0; t <= D; t += 30) times.add(t);
  const lift: [number, number, "linear"][] = [], squash: [number, Vec, "linear"][] = [];
  for (const t of [...times].sort((a, b) => a - b)) {
    const s = lin(pop, t), T = lin(hop, t), [bx, by] = breath(t);
    const r = (n: number) => Math.round(n * 1e4) / 1e4;
    lift.push([t, r(T + POP_Y + (BREATH_Y - POP_Y) * s - F + s * by * (F - BREATH_Y)), "linear"]);
    squash.push([t, [r(s * bx), r(s * by)], "linear"]);
  }
  return { lift, squash };
}

/**
 * The eyes, shared by all three as in the original (they all start together): a glance right (1.5 0), then left
 * and a touch down (-1.3 .3), and blinks (one, then a double). The original runs the glances on a 7 s cycle; here
 * they are fitted to the 6.3 s loop, keeping where in their cycle each move happens.
 *
 * The blinks are the original's, timed in ms: on its 8 s cycle the eyes squash to .08 tall at 3.48 s (closing over
 * 120 ms, opening over 200), then twice at 7.144 and 7.4 s (closing over 104 ms, opening over 152 and 160; the
 * second starts closing just as the first is open again). The 8 s cycle does not divide the 6.3 s loop either, so
 * they are placed as in the original's first 8 s: the single blink at 3480, the double wrapped round to 844 and 1100.
 * The original eases them linearly; the rig eases them with a smoothstep.
 */
const eyes: NonNullable<AgentAnimation["eyes"]> = {
  look: [[0, [0, 0]], [ms(0.25), [0, 0]], [ms(0.28), [1.5, 0], "linear"], [ms(0.5), [1.5, 0]], [ms(0.53), [-1.3, 0.3], "linear"],
    [ms(0.8), [-1.3, 0.3]], [D, [0, 0], "linear"]],
  blink: { close: 104, depth: 0.08 },
  blinks: [{ at: 3480, close: 120, open: 200 }, { at: 7144 - D, open: 152 }, { at: 7400 - D, open: 160 }],
};

/** One of the three agents: its body tracks, the shared eyes, and its hands hidden behind the middle of its body. */
function agent(shape: ShapeName, hop: Lin, pop: Lin, hideHandsAt: Vec, outline?: string): AgentAnimation {
  return {
    duration: D,
    body: { ...bodyTracks(shape, hop, pop), ...(outline ? { outline: [[0, outline]] as Track<string> } : {}) },
    eyes,
    hands: { L: { path: [[0, hideHandsAt]], behind: [[0, D]] }, R: { path: [[0, hideHandsAt]], behind: [[0, D]] } },
  };
}

/** The blue circle: there at the start, crouches (0.5-0.62 s), jumps 6 up and shrinks away into the first cloud
 *  (gone by 0.88 s); pops back out of the third cloud (5.25-5.57 s), overshooting to 1.08. */
export const shapeShiftCircle: AgentAnimation = {
  ...agent(
    "circle",
    smil("0 0;0 0;0 1.2;0 -6;0 -6;0 0;0 0", "0;0.079;0.098;0.127;0.159;0.81;1"),
    smil("1;1;1;0.9;0;0;0;0.5;1.08;1;1", "0;0.079;0.098;0.127;0.14;0.159;0.833;0.846;0.865;0.884;1"),
    [32, 31],
  ),
  rest: 0,
};

/**
 * The green triangle: pops out of the first cloud (1.05-1.37 s), and at 2.6-2.98 s crouches, jumps and shrinks away
 * into the second. Its outline is the original's triangle, which differs a little from the family's (at the
 * bottom corners); the original's eyes sit at 33.3, as the family's triangle's do.
 */
const TRIANGLE_ORIGINAL =
  "M25.82 16.10L26.43 15.23L27.17 14.46L28.00 13.81L28.92 13.29L29.91 12.91L30.94 12.68L32.00 12.60L33.06 12.68L34.09 12.91L35.08 13.29L36.00 13.81L36.83 14.46L37.57 15.23L38.18 16.10L39.68 18.61L41.19 21.12L42.69 23.63L44.20 26.14L45.70 28.65L47.21 31.16L48.71 33.68L50.22 36.19L51.73 38.70L52.21 39.67L52.55 40.70L52.72 41.77L52.74 42.85L52.59 43.93L52.28 44.97L51.81 45.95L51.21 46.85L50.48 47.65L49.63 48.33L48.70 48.88L47.69 49.28L46.63 49.52L45.55 49.60L42.54 49.60L39.53 49.60L36.52 49.60L33.51 49.60L30.49 49.60L27.48 49.60L24.47 49.60L21.46 49.60L18.45 49.60L17.37 49.52L16.31 49.28L15.30 48.88L14.37 48.33L13.52 47.65L12.79 46.85L12.19 45.95L11.72 44.97L11.41 43.93L11.26 42.85L11.28 41.77L11.45 40.70L11.79 39.67L12.27 38.70L13.78 36.19L15.29 33.68L16.79 31.16L18.30 28.65L19.80 26.14L21.31 23.63L22.81 21.12L24.32 18.61Z";
export const shapeShiftTriangle: AgentAnimation = {
  ...agent(
    "triangle",
    smil("0 0;0 0;0 0;0 1.2;0 -6;0 -6;0 0", "0;0.143;0.413;0.432;0.46;0.492;1"),
    smil("0;0;0.5;1.08;1;1;1;0.9;0;0;0", "0;0.167;0.179;0.198;0.217;0.413;0.432;0.46;0.473;0.492;1"),
    // the triangle is widest low down; this point is ~9 units from every edge, so the hands (radius ~5.8) stay hidden
    [32, 39],
    TRIANGLE_ORIGINAL,
  ),
  rest: 0,
};

/** The pink square (the family's squircle): pops out of the second cloud (3.15-3.47 s), and at 4.7-5.08 s crouches,
 *  jumps and shrinks away into the third. */
export const shapeShiftSquare: AgentAnimation = {
  ...agent(
    "squircle",
    smil("0 0;0 0;0 0;0 1.2;0 -6;0 -6;0 0", "0;0.476;0.746;0.765;0.794;0.825;1"),
    smil("0;0;0.5;1.08;1;1;1;0.9;0;0;0", "0;0.5;0.513;0.532;0.551;0.746;0.765;0.794;0.806;0.825;1"),
    [32, 31.5],
  ),
  rest: 0,
};

/** A cloud's scale: from nothing to 0.85, an overshoot to 1.12, settling at 1, then gone (all linear). */
function puff(keyTimes: string): Track<number> {
  return smil("0;0;0.85;1.12;1;0;0", keyTimes).map(([t, v]) => [t, v, "linear"] as const);
}
/** shown from the first key where it starts growing to the one where it is gone again */
const shown = (track: Track<number>): [number, number] => [track[1][0], track[5][0]];

const cloudA = puff("0;0.121;0.133;0.152;0.187;0.206;1");
const cloudB = puff("0;0.454;0.467;0.486;0.521;0.54;1");
const cloudC = puff("0;0.787;0.8;0.819;0.854;0.873;1");

/**
 * The stage: the three clouds, at full size on top of the agents. Each is drawn around the point (32 30) it scales
 * about, tilted as in the original (-6, 8, -2 degrees). The stage has no body (an empty outline draws nothing) and
 * no eyes; its rig hands are parked far below its 64x64 box, which the demo clips (as the original's 64x64 SVG does).
 * Props: `cloudA`, `cloudB`, `cloudC`.
 */
export const shapeShift: AgentAnimation = {
  duration: D,
  rest: 0,
  body: { outline: [[0, "M0 0Z"]] },
  eyes: { hidden: [[0, D]] },
  hands: { L: { path: [[0, [32, 400]]] }, R: { path: [[0, [32, 400]]] } },
  props: {
    cloudA: { attach: "world", offset: [[0, [32, 30]]], rotate: [[0, -6]], scale: cloudA, visible: [shown(cloudA)] },
    cloudB: { attach: "world", offset: [[0, [32, 30]]], rotate: [[0, 8]], scale: cloudB, visible: [shown(cloudB)] },
    cloudC: { attach: "world", offset: [[0, [32, 30]]], rotate: [[0, -2]], scale: cloudC, visible: [shown(cloudC)] },
  },
  events: [[ms(0.167), "triangle"], [ms(0.5), "square"], [ms(0.833), "circle"]],
};
