import { SHAPES } from "../tokens";
import type { AgentAnimation, PropTrack, Span, Track, Vec } from "../types";

/**
 * Puts on cycling glasses ("Performance"), for the green triangle. It reaches behind its back for a pair of
 * wraparound sport glasses with rainbow-mirrored lenses, swings them out to the side and onto its face, then drops its
 * hand and tucks down into a racing crouch. It shakes with speed while a glint sweeps across the lenses. After 1.5 s
 * it sits up, takes them off out to the side and puts them away behind its back again. It blinks once as they go on
 * and once after they are put away.
 * Props: `glasses`, `glint0`...`glint23` (frames of the glint's sweep), `shine` (the lenses' white shine) and `hand`
 * (the one hand, which handles them). Events: `glassesOn` (wearing them: the page speeds up its star board) and
 * `glassesOff` (sitting up: the board coasts back to its normal pace).
 *
 * Ported from the landing page's SMIL agent (infinite.html, 5.45 s loop). Its keyTimes are kept as fractions of the loop
 * (`at(.147)`) so each key can be checked against the original. Its motion is written below as the original's own
 * keys, eased with its keySplines (.45 0 .55 1). The tracks are then sampled from those keys every 10 ms (and at every
 * corner of the speed shake), so the eased curves come out as the original's rather than the format's smoothstep.
 * The original draws the agent at 0.92 about its feet. That shrink is baked into the body squash, so the prop and hand
 * positions below are in the original's unshrunk units. The original also places the agent low and left in its box to
 * sit on the card's corner. That is page layout and is left out here.
 */
const D = 5450;
const at = (f: number) => f * D;
const SHRINK = 0.92;
const [FX, FY] = SHAPES.triangle.feet;

/* ---- the original's keys ------------------------------------------------------------------------------------- */

/** The SMIL keySpline .45 0 .55 1: x(s), y(s) are cubic Beziers; solve x(s) = u by bisection, return y(s). */
function spline(u: number): number {
  const bez = (s: number, p1: number, p2: number) => 3 * (1 - s) * (1 - s) * s * p1 + 3 * (1 - s) * s * s * p2 + s * s * s;
  let lo = 0, hi = 1;
  for (let n = 0; n < 30; n++) {
    const mid = (lo + hi) / 2;
    if (bez(mid, 0.45, 0.55) < u) lo = mid;
    else hi = mid;
  }
  return bez((lo + hi) / 2, 0, 1);
}

type Keys = ReadonlyArray<readonly [number, number[]]>;
/** A SMIL track's value at time t (ms): its keys are [time, values], eased with the keySpline or linear. */
function smil(keys: Keys, t: number, eased = true): number[] {
  if (t <= keys[0][0]) return keys[0][1];
  for (let n = 1; n < keys.length; n++) {
    const [t1, b] = keys[n];
    if (t > t1) continue;
    const [t0, a] = keys[n - 1];
    const u = t1 > t0 ? (t - t0) / (t1 - t0) : 1;
    const e = eased ? spline(u) : u;
    return a.map((v, i) => v + (b[i] - v) * e);
  }
  return keys[keys.length - 1][1];
}

/** The hand. It rests peeking out behind the right edge, reaches out right (with the glasses) and brings them to the
 *  right temple (51 33.5). It holds them there a moment, then drops to the side (55.5 45) while they are worn. Then
 *  it does the same in reverse. */
const HAND: Keys = [
  [0, [57, 46.5]], [at(0.092), [57, 46.5]], [at(0.147), [66, 32.5]], [at(0.22), [51, 33.5]], [at(0.257), [51, 33.5]],
  [at(0.312), [55.5, 45]], [at(0.624), [55.5, 45]], [at(0.679), [51, 33.5]], [at(0.734), [66, 32.5]], [at(0.798), [57, 46.5]],
  [D, [57, 46.5]],
];
/** The glasses' right temple, and their tilt about it. They move with the hand, except that they settle onto the face
 *  a touch ahead of it (dipping to 34.5 and tipping 3 degrees at .198). They stay level on the face until the hand
 *  fetches them. They are tipped 30 degrees while stowed and swung to -8 as they come out. */
const TEMPLE: Keys = [
  [0, [57, 46.5, 30]], [at(0.092), [57, 46.5, 30]], [at(0.147), [66, 32.5, -8]], [at(0.198), [51, 34.5, 3]],
  [at(0.22), [51, 33.5, 0]], [at(0.679), [51, 33.5, 0]], [at(0.734), [66, 32.5, -8]], [at(0.798), [57, 46.5, 30]],
  [D, [57, 46.5, 30]],
];
/** The racing crouch. It shrinks to .86 about the feet as the hand drops, eases up to .9 and holds there. When it is
 *  done it sits up with a little stretch (1.04). */
const CROUCH: Keys = [
  [0, [1]], [at(0.22), [1]], [at(0.261), [0.86]], [at(0.286), [0.9]], [at(0.661), [0.9]], [at(0.694), [1.04]],
  [at(0.719), [1]], [D, [1]],
];
/** Breathing, twice a loop: a little wider and shorter (1.02, .98) and back. */
const BREATH: Keys = [[0, [1, 1]], [D / 4, [1.02, 0.98]], [D / 2, [1, 1]], [(3 * D) / 4, [1.02, 0.98]], [D, [1, 1]]];
/** The speed shake while it wears them. From .245 the whole agent jumps through six small offsets, one per key, at the
 *  original's keyTimes (about 35 ms apart). It stops at .656 and is still by .667. Linear, like the original. */
const SHAKE_AT = [
  0.245, 0.251, 0.258, 0.264, 0.271, 0.277, 0.283, 0.29, 0.296, 0.303, 0.309, 0.316, 0.322, 0.328, 0.335, 0.341, 0.348,
  0.354, 0.361, 0.367, 0.373, 0.38, 0.386, 0.393, 0.399, 0.406, 0.412, 0.418, 0.425, 0.431, 0.438, 0.444, 0.451, 0.457,
  0.463, 0.47, 0.476, 0.483, 0.489, 0.495, 0.502, 0.508, 0.515, 0.521, 0.527, 0.534, 0.54, 0.547, 0.553, 0.56, 0.566,
  0.573, 0.579, 0.585, 0.592, 0.598, 0.605, 0.611, 0.617, 0.624, 0.63, 0.637, 0.643, 0.649, 0.656,
];
const JUMPS = [[0.55, -0.3], [-0.5, 0.35], [0.4, 0.45], [-0.6, -0.2], [0.25, -0.5], [-0.35, 0.3]];
const SHAKE: Keys = [
  [0, [0, 0]], [at(0.238), [0, 0]], ...SHAKE_AT.map((f, k) => [at(f), JUMPS[k % 6]] as const), [at(0.667), [0, 0]], [D, [0, 0]],
];

/* ---- into the format ------------------------------------------------------------------------------------------- */

/** Sample times: every 10 ms, plus each corner of the shake (it is piecewise linear, so those keep its zigzag sharp). */
const TIMES = [...new Set([...Array.from({ length: D / 10 + 1 }, (_, n) => n * 10), ...SHAKE.map(([t]) => t)])].sort((a, b) => a - b);
const track = <V>(value: (t: number) => V): Track<V> => TIMES.map((t) => [t, value(t), "linear"] as const);

/** The body's scale at t: the crouch times the breath (one inside the other in the original), with the 0.92 shrink. */
const scaleAt = (t: number): Vec => {
  const c = SHRINK * smil(CROUCH, t)[0], [bx, by] = smil(BREATH, t);
  return [c * bx, c * by];
};

/** The format has no sideways body offset, so the sideways part of the shake becomes a slight lean about the feet,
 *  sized so the face (about 13 units above the feet, once crouched) moves by the shake's amount. */
const LEVER = 13;
const leanAt = (t: number) => (Math.atan(smil(SHAKE, t, false)[0] / LEVER) * 180) / Math.PI;

/** The props are 'world' props inside the body, so the lean would also tip and swing them. Where a prop should be
 *  instead: the original puts it at `place` (its translate and rotate) inside the scaled agent, and shifts the whole
 *  agent sideways by the shake. Undo the port's lean from that, so the props shake straight sideways as in the
 *  original. Returns the offset and rotation that the format's prop transform needs. */
function compensated(t: number, place: Vec, rotate: number): { at: Vec; rotate: number } {
  const [sx, sy] = scaleAt(t), dx = smil(SHAKE, t, false)[0], th = (-leanAt(t) * Math.PI) / 180;
  // into body space: scale about the feet, shift sideways by the shake, then undo the lean about the feet and the scale
  let x = FX + sx * (place[0] - FX) + dx, y = FY + sy * (place[1] - FY);
  const rx = x - FX, ry = y - FY;
  x = FX + rx * Math.cos(th) - ry * Math.sin(th);
  y = FY + rx * Math.sin(th) + ry * Math.cos(th);
  return { at: [FX + (x - FX) / sx, FY + (y - FY) / sy], rotate: rotate + (th * 180) / Math.PI };
}

/** The glasses and the hand are behind the body until they have swung out to the right (x 66, clear of the body),
 *  and again from when they are back out there on the way off. These are the original's own switch times. */
const BEHIND: readonly Span[] = [[0, at(0.147)], [at(0.734), D]];

const glassesAt = TIMES.map((t) => {
  const [x, y, r] = smil(TEMPLE, t);
  return [t, compensated(t, [x, y], r)] as const;
});
/** Everything that is part of the glasses moves the same way. */
const onTheGlasses: PropTrack = {
  attach: "world",
  offset: glassesAt.map(([t, p]) => [t, p.at, "linear"] as const),
  rotate: glassesAt.map(([t, p]) => [t, p.rotate, "linear"] as const),
  behind: BEHIND,
};

/** The glint sweeps left to right across both lenses, linearly, from 6 to 48 units right of where it is drawn, between
 *  .284 and .336. It starts a little way into the left lens, which is how the glasses look before the sweep. It ends
 *  past the right lens, out of sight, until the loop starts again. A prop's clip moves with the prop, so the sweep is
 *  a row of frames: frame k sits at 6 + 1.75k and shows while the original's glint is nearest to it. */
const GLINT_FRAMES = 24;
const GLINT: Span = [at(0.284), at(0.336)];
const glintStep = (GLINT[1] - GLINT[0]) / GLINT_FRAMES;
/** The glint frames' offsets (for the demo's `Glint x`). */
export const cyclingGlassesGlint = Array.from({ length: GLINT_FRAMES }, (_, k) => 6 + (42 * k) / GLINT_FRAMES);
const glints: Record<string, PropTrack> = Object.fromEntries(
  cyclingGlassesGlint.map((_, k) => [
    `glint${k}`,
    { ...onTheGlasses, visible: [[k === 0 ? 0 : GLINT[0] + (k - 0.5) * glintStep, GLINT[0] + (k + 0.5) * glintStep]] },
  ]),
);

export const cyclingGlasses: AgentAnimation = {
  duration: D,
  // wearing them, crouched (the original's reduced-motion frame)
  rest: 2200,
  body: {
    squash: track(scaleAt),
    lift: track((t) => smil(SHAKE, t, false)[1]),
    lean: track(leanAt),
  },
  eyes: {
    // The original's blinks take 60 ms to close and 80 to 100 ms to open: 1139-1281 ms as the glasses settle and
    // 4752-4910 ms once they are away (shut at 1199 and 4812). The format's blink is a symmetric 90 ms, so each one
    // is placed where it best fits the original's (least squares over the window).
    blinks: [1203, 4818],
  },
  hands: {
    // The original has one hand, the `hand` prop. The rig's hands wait out of sight behind the body.
    L: { path: [[0, [28, 40]]], behind: [[0, D]] },
    R: { path: [[0, [36, 40]]], behind: [[0, D]] },
  },
  props: {
    glasses: onTheGlasses,
    ...glints,
    shine: onTheGlasses,
    hand: {
      attach: "world",
      offset: TIMES.map((t) => {
        const [x, y] = smil(HAND, t);
        return [t, compensated(t, [x, y], 0).at, "linear"] as const;
      }),
      behind: BEHIND,
    },
  },
  events: [[1300, "glassesOn"], [3600, "glassesOff"]],
};
