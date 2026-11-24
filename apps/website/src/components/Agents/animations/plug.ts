import { SHAPES } from "../tokens";
import type { AgentAnimation, PropTrack, Span, Track, Vec } from "../types";

/**
 * "WebMCP", for the green triangle: it reaches behind its back and pulls out a white plug (left hand) and a white
 * socket (right hand), each on a short cord. It holds them up at its sides, swings them down and in, and plugs them
 * together in front of its lower body with a small push, looks down at them, then unplugs, swings them back out and
 * puts everything away behind its back again.
 * Props: `handL`/`handR` (the hands), `plug`, `plugProngs`, `socket`, `socketHoles`, and the cords (`cordL…`,
 * `cordR…`, chains of short pieces). Events: `connect` (plugged together), `disconnect` (pulled apart).
 *
 * Ported from the landing page's SMIL agent, which its generator sampled at 176 frames over the 4.4 s loop (one frame
 * every 25 ms) and interpolated linearly. The generator's motion functions are reproduced below and sampled at the
 * same frames, so every frame matches. Positions are in the original's frame: its whole drawing is lifted 4 units
 * ("world" below), and the body (not the hands or the gear) is shrunk to 0.8 about its base, which sits at y 52.
 *
 * The shrink is the rig's body squash and the breathing is baked into the body's outline. The rig squashes hands
 * and props with the body, so the hands are drawn as props (the rig's own hands wait out of sight behind the body),
 * and every prop is placed so that the squash puts it back where it was in the original, and drawn 1/0.8 bigger.
 */
const D = 4400;
const FRAMES = 176;
const FRAME = D / FRAMES;
const SHRINK = 0.8;
const FEET = SHAPES.triangle.feet;
/** The original's world is its raw drawing lifted by 4. */
const LIFT = -4;

// ---- the original's motion, in its raw units (before the lift of 4), as fractions u of the loop ----

type Side = "L" | "R";
const smooth = (u: number) => {
  const v = Math.max(0, Math.min(1, u));
  return v * v * (3 - 2 * v);
};
const mix = (p: Vec, q: Vec, u: number): Vec => [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u];

/** Where the hands are: resting at the sides, hidden behind the body, held up at the sides, and plugged together
 *  (the plug's body ends 8.5 in front of its hand and the socket's face is 9.5 in front of its hand: 18 apart). */
const REST: Record<Side, Vec> = { L: [11, 49], R: [53, 49] };
const HIDE: Record<Side, Vec> = { L: [27, 50], R: [37, 50] };
const SIDE: Record<Side, Vec> = { L: [10, 46], R: [54, 46] };
const CON: Record<Side, Vec> = { L: [23, 53.5], R: [41, 53.5] };
/** The phases: reach behind (.06-.16), wait (.16-.19), out, up at the side and in to plug (.19-.42), plugged
 *  (.42-.62), out and back behind (.62-.84), wait (.84-.87), hands back to the sides (.87-.97). */
const T = { r0: 0.06, h0: 0.16, o0: 0.19, o1: 0.42, c1: 0.62, i1: 0.84, h1: 0.87, r1: 0.97 };
/** The plug and socket (and their cords) are there only from grabbing them behind the back until putting them away. */
const GEAR: Span = [0.1705 * D, 0.8523 * D];
/** The prongs and holes are hidden while the two are plugged together. */
const UNMATED: Span[] = [[GEAR[0], 0.414 * D], [0.626 * D, GEAR[1]]];

/** A quadratic curve from p0 to p2 that passes through p1 halfway. */
function bez(p0: Vec, p1: Vec, p2: Vec, u: number): Vec {
  const c = [0, 1].map((k) => 2 * p1[k] - (p0[k] + p2[k]) / 2);
  return [0, 1].map((k) => (1 - u) ** 2 * p0[k] + 2 * u * (1 - u) * c[k] + u * u * p2[k]) as unknown as Vec;
}

/** A hand's position and its connector's angle (0 = facing the other connector, ±90 = held pointing up). */
function pose(side: Side, u: number): { at: Vec; angle: number } {
  const up = side === "L" ? -90 : 90;
  // turns from pointing up to facing the other connector over the second half of the swing in
  const turn = (v: number) => up * (1 - smooth((v - 0.45) / 0.5));
  if (u < T.r0) return { at: REST[side], angle: up };
  if (u < T.h0) return { at: mix(REST[side], HIDE[side], smooth((u - T.r0) / (T.h0 - T.r0))), angle: up };
  if (u < T.o0) return { at: HIDE[side], angle: up };
  if (u < T.o1) {
    const v = smooth((u - T.o0) / (T.o1 - T.o0));
    let p = bez(HIDE[side], SIDE[side], CON[side], v);
    // the small push as it plugs in
    if (v > 0.9) p = [p[0] + (side === "L" ? 1 : -1) * 0.6 * Math.sin((Math.PI * (v - 0.9)) / 0.1), p[1]];
    return { at: p, angle: turn(v) };
  }
  if (u < T.c1) return { at: CON[side], angle: 0 };
  if (u < T.i1) {
    const v = 1 - smooth((u - T.c1) / (T.i1 - T.c1));
    return { at: bez(HIDE[side], SIDE[side], CON[side], v), angle: turn(v) };
  }
  if (u < T.h1) return { at: HIDE[side], angle: up };
  if (u < T.r1) return { at: mix(HIDE[side], REST[side], smooth((u - T.h1) / (T.r1 - T.h1))), angle: up };
  return { at: REST[side], angle: up };
}

/** The hands and gear go behind the body while they are tucked behind its back. The generator switched layers at
 *  the first frame where nothing overlapped the body (frames 11, 48, 124 and 168), so nothing pops through it. */
const BEHIND: Span[] = [[11 * FRAME, 48 * FRAME], [124 * FRAME, 168 * FRAME]];
const behindAt = (t: number) => BEHIND.some(([a, b]) => t >= a && t < b);

/** The body (raw units): a triangle with its base at 56 and its apex at 26.4, 16.6 to each side at the base. */
const BASE = 56, APEX = 26.4, HALF = 16.6;
const halfWidth = (y: number) => (HALF * (y - APEX)) / (BASE - APEX);

/** Where each cord is fastened, behind the body's lower sides. */
const ANCHOR: Record<Side, Vec> = { L: [25.5, 49], R: [38.5, 49] };
const rotateVec = (v: Vec, deg: number): Vec => {
  const r = (deg * Math.PI) / 180;
  return [v[0] * Math.cos(r) - v[1] * Math.sin(r), v[0] * Math.sin(r) + v[1] * Math.cos(r)];
};

/**
 * A cord at time t, as a cubic curve (raw units): from the back of its connector it hangs down and curves round to
 * its anchor. While the connector is behind the body, the sag shrinks to nothing as it gets further inside the
 * body's outline, so the cord stays hidden behind the body. Also returns that sag factor (0 = straight, hidden).
 */
function cordCurve(side: Side, t: number): { points: Vec[]; k: number } {
  const { at, angle } = pose(side, t / D);
  const rear = rotateVec(side === "L" ? [2.5, 0] : [-2.5, 0], angle);
  const R: Vec = [at[0] + rear[0], at[1] + rear[1]];
  const d = side === "L" ? -1 : 1;
  const out = R[1] <= BASE ? Math.abs(R[0] - 32) - Math.max(0, halfWidth(Math.min(R[1], BASE))) : 9;
  const k = behindAt(t) ? Math.max(0, Math.min(1, (out + 1) / 4)) : 1;
  const an = ANCHOR[side], sag = 9 * k;
  return { points: [R, [R[0] + d * 1.5 * k, R[1] + sag], [an[0] + d * 7 * k, an[1] + sag * 0.9], an], k };
}
const cubic = ([a, b, c, e]: Vec[], u: number): Vec =>
  [0, 1].map((n) => (1 - u) ** 3 * a[n] + 3 * u * (1 - u) ** 2 * b[n] + 3 * u * u * (1 - u) * c[n] + u ** 3 * e[n]) as unknown as Vec;

// ---- the cords as chains of pieces ----

/**
 * The length of one cord piece, and how many make a cord. The pieces are short so that, laid as chords of the curve,
 * they cut its tightest bends (where a cord hangs below a hand) by less than 0.2; 16 x 1.6 covers the longest cord
 * (23.3) with every piece overlapping the next.
 */
export const CORD_PIECE = 1;
export const CORD_PIECES = 24;

/**
 * The pieces of a cord at time t (world units): each starts at an even step along the curve and points at the place
 * further along the curve that lies one piece away, so both its ends are on the curve and it never sticks out of a
 * bend. Together they overlap into a chain that follows the curve whatever its length, ending at the anchor.
 */
function cordPieces(side: Side, t: number): { at: Vec; angle: number }[] {
  const { points } = cordCurve(side, t);
  const steps = 200;
  const pts = Array.from({ length: steps + 1 }, (_, n) => cubic(points, n / steps));
  const end = pts[steps];
  const dist = (p: Vec, q: Vec) => Math.hypot(q[0] - p[0], q[1] - p[1]);
  /** The first sample after `from` that lies a piece's length away from sample `from` (or the curve's end). */
  const reach = (from: number) => {
    for (let n = from + 1; n <= steps; n++) if (dist(pts[from], pts[n]) >= CORD_PIECE) return n;
    return steps;
  };
  // the last start: the latest sample from which the end is still a piece's length away
  let last = steps;
  while (last > 0 && dist(pts[last], end) < CORD_PIECE) last--;
  return Array.from({ length: CORD_PIECES }, (_, n) => {
    const from = Math.round((n * last) / (CORD_PIECES - 1));
    const a = pts[from], b = pts[reach(from)];
    const angle = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
    return { at: [a[0], a[1] + LIFT], angle };
  });
}

// ---- the body: the shrink as the squash, the breathing in the outline ----

/** The landing page's triangle, whose rounded corners differ a little from the family's (its base sits at 49.6). */
const OUTLINE =
  "M25.82 16.10L26.43 15.23L27.17 14.46L28.00 13.81L28.92 13.29L29.91 12.91L30.94 12.68L32.00 12.60L33.06 12.68L34.09 12.91L35.08 13.29L36.00 13.81L36.83 14.46L37.57 15.23L38.18 16.10L39.68 18.61L41.19 21.12L42.69 23.63L44.20 26.14L45.70 28.65L47.21 31.16L48.71 33.68L50.22 36.19L51.73 38.70L52.21 39.67L52.55 40.70L52.72 41.77L52.74 42.85L52.59 43.93L52.28 44.97L51.81 45.95L51.21 46.85L50.48 47.65L49.63 48.33L48.70 48.88L47.69 49.28L46.63 49.52L45.55 49.60L42.54 49.60L39.53 49.60L36.52 49.60L33.51 49.60L30.49 49.60L27.48 49.60L24.47 49.60L21.46 49.60L18.45 49.60L17.37 49.52L16.31 49.28L15.30 48.88L14.37 48.33L13.52 47.65L12.79 46.85L12.19 45.95L11.72 44.97L11.41 43.93L11.26 42.85L11.28 41.77L11.45 40.70L11.79 39.67L12.27 38.70L13.78 36.19L15.29 33.68L16.79 31.16L18.30 28.65L19.80 26.14L21.31 23.63L22.81 21.12L24.32 18.61Z";

/**
 * The original breathes the body a touch wider and shorter (1.02 x 0.98) about (32 49) every 2.2 s, eased with the
 * spline (.45 0 .55 1). Returns how far into a breath it is (0 at rest, 1 at the widest).
 */
function breath(t: number): number {
  const phase = (t % 2200) / 2200;
  const x = phase < 0.5 ? phase * 2 : 2 - phase * 2;
  // solve the spline's x(s) = x for s, then take its y(s)
  const bx = (s: number) => 3 * s * (1 - s) ** 2 * 0.45 + 3 * s * s * (1 - s) * 0.55 + s ** 3;
  let lo = 0, hi = 1;
  for (let n = 0; n < 30; n++) {
    const mid = (lo + hi) / 2;
    if (bx(mid) < x) lo = mid;
    else hi = mid;
  }
  const s = (lo + hi) / 2;
  return 3 * s * s * (1 - s) + s ** 3;
}
const breathScale = (t: number): Vec => [1 + 0.02 * breath(t), 1 - 0.02 * breath(t)];

/** The outline breathed: every point scaled about (32 49), in the body's own (unshrunk) units. */
function breathed(t: number): string {
  const [bx, by] = breathScale(t);
  let n = 0;
  return OUTLINE.replace(/-?\d*\.?\d+/g, (v) => (n++ % 2 ? 49 + (+v - 49) * by : 32 + (+v - 32) * bx).toFixed(2));
}

/**
 * The 0.8 shrink is a constant squash: the rig writes the squash with two decimals, so breathing in the squash would
 * move in visible steps of 0.01; it is baked into the outline instead (and into the eyes' look, below). The original
 * shrinks about (32 49) and then sets the base at y 52 (56 less the lift of 4); the rig squashes about its feet
 * (32 49.56), so the body is lifted by the difference: 52 - 49.56 + 0.56 x 0.8.
 */
const squash: Track<Vec> = [[0, [SHRINK, SHRINK]]];
const LIFT_BODY = 52 - FEET[1] - (49 - FEET[1]) * SHRINK;

/** A world point, placed so that the rig's squash and lift put it back there. */
function unsquash(p: Vec): Vec {
  return [FEET[0] + (p[0] - FEET[0]) / SHRINK, FEET[1] + (p[1] - LIFT_BODY - FEET[1]) / SHRINK];
}

// ---- deriving the tracks, frame by frame ----

const frames = Array.from({ length: FRAMES + 1 }, (_, n) => n * FRAME);
const world = (p: Vec): Vec => [p[0], p[1] + LIFT];
/** Keeps an angle track continuous (no jumps of 360 between frames). */
function unwrap(angles: number[]): number[] {
  const out: number[] = [];
  for (const a of angles) out.push(out.length ? a + 360 * Math.round((out[out.length - 1] - a) / 360) : a);
  return out;
}
const UNSHRINK: Track<number> = [[0, 1 / SHRINK]];

const handTrack = (side: Side): PropTrack => ({
  attach: "world",
  offset: frames.map((t) => [t, unsquash(world(pose(side, t / D).at)), "linear"] as const),
  scale: UNSHRINK,
  behind: BEHIND,
});
/** A connector or its prongs/holes: on the hand, turned with the connector's angle. */
const gearTrack = (side: Side, visible: readonly Span[]): PropTrack => ({
  ...handTrack(side),
  rotate: frames.map((t) => [t, pose(side, t / D).angle, "linear"] as const),
  visible,
});

/** The frames where a cord sags out from the body (k > 0); outside them it lies straight, hidden behind the body. */
function cordVisible(side: Side): Span[] {
  const spans: Span[] = [];
  let from = -1;
  frames.forEach((t, n) => {
    const on = t >= GEAR[0] && t < GEAR[1] && cordCurve(side, t).k > 0;
    if (on && from < 0) from = t;
    if ((!on || n === FRAMES) && from >= 0) {
      spans.push([from, t]);
      from = -1;
    }
  });
  return spans;
}

/** The cord pieces of one side: all its ink pieces, then all its core pieces, always behind the body. */
function cordTracks(side: Side): Record<string, PropTrack> {
  const perFrame = frames.map((t) => cordPieces(side, t));
  const visible = cordVisible(side);
  const tracks: Record<string, PropTrack> = {};
  for (const part of ["Ink", "Core"]) {
    for (let n = 0; n < CORD_PIECES; n++) {
      const angles = unwrap(perFrame.map((pieces) => pieces[n].angle));
      tracks[`cord${side}${part}${n}`] = {
        attach: "world",
        offset: frames.map((t, f) => [t, unsquash(perFrame[f][n].at), "linear"] as const),
        rotate: frames.map((t, f) => [t, angles[f], "linear"] as const),
        scale: UNSHRINK,
        visible,
        behind: [[0, D]],
      };
    }
  }
  return tracks;
}

/**
 * Where the eyes look (in the body's units), as in the original: ahead, at the plug coming out on the left, at the
 * socket on the right, then down at the plugging, and back up after pulling them apart, eased between the keys.
 */
const LOOK: [number, Vec][] = [
  [0, [0, 0]], [0.2, [0, 0]], [0.27, [-1.3, -0.3]], [0.33, [1.3, -0.3]], [0.4, [0, 1.1]], [0.62, [0, 1.1]], [0.7, [0, 0]],
  [1, [0, 0]],
];
/** The look, plus how the breathing moves the eyes (they sit 12.6 above the point it scales about, at (32 36.4)). */
function lookAt(t: number): Vec {
  const u = t / D;
  let at: Vec = LOOK[LOOK.length - 1][1];
  for (let n = 1; n < LOOK.length; n++)
    if (u <= LOOK[n][0]) {
      at = mix(LOOK[n - 1][1], LOOK[n][1], smooth((u - LOOK[n - 1][0]) / (LOOK[n][0] - LOOK[n - 1][0])));
      break;
    }
  const [bx, by] = breathScale(t);
  return [at[0] * bx, at[1] * by + (by - 1) * (36.4 - 49)];
}

export const plug: AgentAnimation = {
  duration: D,
  // plugged together, looking down at them
  rest: 2300,
  body: { squash, lift: [[0, LIFT_BODY]], outline: frames.map((t) => [t, breathed(t), "linear"] as const) },
  eyes: {
    // the original's look, frame by frame, with the breathing's small move of the eyes
    look: frames.map((t) => [t, lookAt(t), "linear"] as const),
    // the original's two blinks close by .115 and .735 of the loop
    blinks: [0.115 * D, 0.735 * D],
  },
  hands: {
    // the hands are the `handL`/`handR` props; the rig's own wait out of sight behind the middle of the body
    L: { path: [[0, [32, 40]]], behind: [[0, D]] },
    R: { path: [[0, [32, 40]]], behind: [[0, D]] },
  },
  // drawn in this order, as in the original: the cords, then each hand's connector and the hand over it
  props: {
    ...cordTracks("L"),
    ...cordTracks("R"),
    plugProngs: gearTrack("L", UNMATED),
    plug: gearTrack("L", [GEAR]),
    handL: handTrack("L"),
    socket: gearTrack("R", [GEAR]),
    socketHoles: gearTrack("R", UNMATED),
    handR: handTrack("R"),
  },
  events: [[UNMATED[0][1], "connect"], [UNMATED[1][0], "disconnect"]],
};
