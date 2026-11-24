import type { AgentAnimation, Key, Span, Vec } from "../types";

/**
 * "Programmable cursors", for the yellow circle agent: it closes its eyes, hops, and while in the air morphs into a
 * cursor arrow (with a little overshoot), clicks (a press towards its tip, two ink ripples spreading from the tip),
 * then morphs back into a circle, lands with a small dip and opens its eyes. Loop: 4.8 s.
 * Props: the ripple rings (`cursorRipples` lists them, with their radius). Event: `click` (the press).
 *
 * Ported from the landing page's SMIL agent. The original nests, around the body path and the eyes:
 *   translate (the hop) > translate (the press nudge) > scale about the tip (the press) > scale about the tip (0.8 as
 *   a cursor) > the path, whose `d` morphs between 36-point outlines and whose stroke thins while it is a cursor.
 * The rig has one body transform (lift, then a scale about the feet), so this file keeps the original's tracks as
 * they are and works out, at sample times, the outline that ends up at the same place on screen:
 *   - the hop is `body.lift`, as in the original;
 *   - the press nudge, both scales about the tip and the morph are baked into the `outline` points;
 *   - the thinner stroke is a uniform `squash` s = (original stroke x scales) / 3.6, with the outline points
 *     pre-divided by s about the feet so the drawn shape is unchanged; the props, hands and eyes are compensated
 *     the same way.
 * Between samples everything is linear, so the samples are dense (every 20 ms) wherever more than one track moves.
 */

const D = 4800;
/** the original's keyTimes are fractions of the 4.8 s loop */
const ms = (f: number) => Math.round(f * D);
/** the cursor's tip, which the press and the 0.8 scale are about */
const TIP: Vec = [14.9, 14.55];
/** the circle shape's feet, which the rig's squash is about */
const FEET: Vec = [32, 49.6];
const BODY_STROKE = 3.6;

/** The outlines the original morphs through (all M + 35 L + Z, so they interpolate point by point). */
const OUTLINES = [
  // 0: the circle
  "M19.2 16.6L21.8 14.6L24.8 13.0L27.9 12.0L31.2 11.6L34.5 11.8L37.7 12.5L40.8 13.8L43.6 15.5L46.0 17.8L48.0 20.4L49.6 23.4L50.6 26.5L51.0 29.8L50.8 33.1L50.1 36.3L48.8 39.4L47.1 42.2L44.8 44.6L42.2 46.6L39.2 48.2L36.1 49.2L32.8 49.6L29.5 49.4L26.3 48.7L23.2 47.4L20.4 45.7L18.0 43.4L16.0 40.8L14.4 37.8L13.4 34.7L13.0 31.4L13.2 28.1L13.9 24.9L15.2 21.8L16.9 19.0Z",
  // 1-4: on the way to an arrow
  "M17.4 15.7L20.0 15.0L22.7 14.6L25.5 14.5L28.5 14.7L31.4 15.3L34.3 16.2L37.1 17.4L39.7 19.0L42.2 20.8L44.4 22.8L46.3 25.0L47.8 27.3L49.1 29.7L48.0 32.0L46.7 34.2L45.0 36.4L43.0 38.3L40.7 40.1L38.2 41.6L36.0 43.9L33.7 45.8L31.3 47.5L28.9 48.8L26.6 47.3L24.4 45.5L22.3 43.4L20.5 41.0L18.9 38.4L17.6 35.6L16.6 32.7L15.9 29.7L15.6 26.7L15.6 23.8L15.9 20.9L16.5 18.2Z",
  "M16.3 15.2L18.7 15.3L21.3 15.7L24.0 16.1L26.7 16.8L29.4 17.6L32.1 18.6L34.7 19.8L37.2 21.2L39.7 22.7L42.0 24.3L44.1 26.0L46.1 27.8L47.9 29.7L46.2 31.3L44.4 32.9L42.4 34.4L40.3 35.8L38.0 37.1L35.6 38.3L33.9 41.1L32.1 43.7L30.3 46.1L28.5 48.3L26.8 46.3L25.1 44.2L23.5 41.9L22.1 39.4L20.8 36.8L19.6 34.2L18.6 31.4L17.8 28.6L17.1 25.8L16.7 23.1L16.4 20.3L16.2 17.7Z",
  "M15.6 14.9L18.0 15.5L20.5 16.3L23.0 17.1L25.6 18.0L28.2 19.0L30.7 20.1L33.2 21.3L35.7 22.6L38.1 23.9L40.5 25.3L42.8 26.7L45.0 28.1L47.1 29.6L45.1 30.8L43.1 32.0L40.9 33.2L38.7 34.3L36.4 35.4L34.0 36.4L32.6 39.4L31.2 42.4L29.7 45.3L28.2 48.0L26.9 45.8L25.6 43.4L24.3 41.0L23.1 38.5L21.9 35.9L20.8 33.3L19.8 30.6L18.9 28.0L18.1 25.3L17.3 22.6L16.7 20.0L16.1 17.4Z",
  "M15.2 14.7L17.6 15.6L20.1 16.6L22.5 17.6L25.0 18.7L27.5 19.8L30.0 20.9L32.4 22.1L34.9 23.3L37.3 24.5L39.7 25.8L42.1 27.0L44.4 28.3L46.7 29.6L44.5 30.6L42.3 31.6L40.1 32.5L37.8 33.4L35.5 34.4L33.2 35.3L31.9 38.5L30.7 41.7L29.4 44.8L28.1 47.9L27.0 45.5L25.8 43.0L24.7 40.5L23.6 37.9L22.5 35.4L21.5 32.8L20.5 30.2L19.5 27.6L18.6 25.0L17.7 22.4L16.8 19.8L16.0 17.2Z",
  // 5-7: the arrow overshooting (bigger) and settling
  "M12.5 11.9L15.3 13.1L18.1 14.4L21.0 15.7L23.8 17.0L26.6 18.3L29.5 19.7L32.3 21.0L35.1 22.4L37.9 23.7L40.7 25.1L43.5 26.5L46.3 27.9L49.1 29.3L46.4 30.3L43.8 31.3L41.1 32.3L38.5 33.3L35.8 34.3L33.1 35.2L31.8 39.1L30.4 42.9L29.0 46.7L27.7 50.4L26.4 47.5L25.2 44.6L24.0 41.6L22.8 38.7L21.6 35.7L20.4 32.7L19.3 29.7L18.1 26.7L17.0 23.8L15.8 20.8L14.7 17.8L13.6 14.8Z",
  "M10.0 9.2L13.2 10.7L16.4 12.2L19.6 13.7L22.8 15.2L26.0 16.7L29.2 18.3L32.3 19.8L35.5 21.3L38.7 22.8L41.9 24.4L45.1 25.9L48.3 27.4L51.4 29.0L48.4 30.1L45.4 31.1L42.4 32.2L39.3 33.3L36.3 34.4L33.3 35.5L31.8 39.8L30.3 44.2L28.8 48.6L27.3 52.9L25.9 49.6L24.6 46.2L23.2 42.8L21.9 39.5L20.6 36.1L19.2 32.7L17.9 29.4L16.6 26.0L15.3 22.6L14.0 19.3L12.6 15.9L11.3 12.5Z",
  "M11.1 10.4L14.1 11.8L17.1 13.2L20.1 14.7L23.2 16.1L26.2 17.6L29.2 19.0L32.2 20.5L35.2 21.9L38.2 23.3L41.3 24.8L44.3 26.2L47.3 27.7L50.3 29.1L47.4 30.1L44.6 31.1L41.7 32.2L38.8 33.2L36.0 34.2L33.1 35.2L31.7 39.4L30.3 43.5L28.8 47.6L27.4 51.8L26.2 48.6L24.9 45.4L23.7 42.2L22.4 39.0L21.1 35.8L19.9 32.7L18.6 29.5L17.4 26.3L16.1 23.1L14.9 19.9L13.6 16.7L12.3 13.6Z",
  // 8: the arrow at rest, its tip at TIP
  "M14.9 14.5L17.3 15.7L19.7 16.9L22.2 18.0L24.6 19.2L27.0 20.3L29.4 21.5L31.9 22.7L34.3 23.8L36.7 25.0L39.1 26.1L41.6 27.3L44.0 28.4L46.4 29.6L44.1 30.4L41.8 31.2L39.5 32.0L37.2 32.9L34.9 33.7L32.6 34.5L31.4 37.8L30.3 41.1L29.2 44.5L28.0 47.8L27.0 45.2L26.0 42.7L25.0 40.1L24.0 37.6L23.0 35.0L22.0 32.5L21.0 29.9L19.9 27.3L18.9 24.8L17.9 22.2L16.9 19.7L15.9 17.1Z",
].map((d) => d.match(/-?\d*\.?\d+/g)!.map(Number));

/**
 * The point deepest inside each outline (found offline), where both hands hide behind the body: the original has
 * no hands, and the rig always draws them, so they stay tucked away, behind the body, and never poke out (the
 * arrow is thin, but the hands shrink with the stroke's squash, and this point keeps them clear of its edges).
 */
const DEEPEST: Vec[] = [[32, 30.5], [30.5, 29.75], [29.5, 29.25], [28.75, 29], [28.5, 29], [27.75, 28.25], [27.5, 28], [27.5, 28], [28.25, 28.75]];

/** The original's `d` keyframes: [keyTime, outline] (to an arrow, and the same in reverse back to a circle)... */
const MORPH_TIMES = [0, .312, .325, .338, .35, .362, .375, .388, .4, .412, .677, .69, .702, .715, .727, .74, .752, .765, .777, 1];
const MORPH_SHAPES = [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0];
/** ...and its stroke width at the same keyTimes (thinner as an arrow, a little thicker at the overshoot) */
const STROKE_W = [3.6, 3.6, 3.27, 3.05, 2.92, 2.85, 3.27, 3.69, 3.49, 2.8, 2.8, 3.49, 3.69, 3.27, 2.85, 2.92, 3.05, 3.27, 3.6, 3.6];

type Lin = readonly (readonly [number, number])[];
/** the press: a scale about the tip (0.84 down, a 1.04 rebound) and a nudge of the whole cursor down-right */
const PRESS_SCALE: Lin = [[0, 1], [.485, 1], [.51, .84], [.531, .84], [.565, 1.04], [.585, 1], [1, 1]];
const PRESS_NUDGE: Lin = [[0, 0], [.485, 0], [.51, .8], [.531, .8], [.573, 0], [1, 0]];
/** the hop (body.lift): a crouch, a jump while it morphs, the landing, and a small dip when it turns back */
const HOP: Lin = [[0, 0], [.254, 0], [.275, 1.2], [.325, -5], [.412, 0], [.777, 0], [.8, 1], [.829, 0], [1, 0]];
/** a cursor is 0.8 the size, about the tip; eased with keySplines .45 0 .55 1 */
const CURSOR_SCALE: Lin = [[0, 1], [.338, 1], [.375, .8], [.727, .8], [.765, 1], [1, 1]];

/** piecewise-linear value of [keyTime, value] pairs at t (ms), as SMIL's calcMode linear */
function lin(track: Lin, t: number, ease: (u: number) => number = (u) => u): number {
  const f = t / D;
  for (let n = 1; n < track.length; n++) {
    const [f1, b] = track[n];
    if (f > f1) continue;
    const [f0, a] = track[n - 1];
    return f1 > f0 ? a + (b - a) * ease((f - f0) / (f1 - f0)) : b;
  }
  return track[track.length - 1][1];
}

/** cubic-bezier(.45, 0, .55, 1), the original's keySplines for the cursor scale */
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

/** where the original's morph is at t: the two keyframes around it and how far between them */
function morphAt(t: number): [number, number, number] {
  const f = t / D;
  for (let n = 1; n < MORPH_TIMES.length; n++) {
    if (f > MORPH_TIMES[n]) continue;
    return [n - 1, n, (f - MORPH_TIMES[n - 1]) / (MORPH_TIMES[n] - MORPH_TIMES[n - 1])];
  }
  return [MORPH_TIMES.length - 1, MORPH_TIMES.length - 1, 0];
}

/**
 * Everything the original does to the body at t, except the hop: `place` maps a point of the unscaled drawing to
 * where the rig must put it (before its squash s about the feet) so that it lands where the original draws it.
 */
function frameAt(t: number) {
  const [a, b, u] = morphAt(t);
  const k = lin(PRESS_SCALE, t) * lin(CURSOR_SCALE, t, spline); // both scales about the tip
  const nudge = lin(PRESS_NUDGE, t);
  const stroke = STROKE_W[a] + (STROKE_W[b] - STROKE_W[a]) * u;
  const s = (stroke * k) / BODY_STROKE;
  const place = ([x, y]: Vec): Vec => {
    const sx = TIP[0] + nudge + k * (x - TIP[0]), sy = TIP[1] + nudge + k * (y - TIP[1]); // on screen
    return [FEET[0] + (sx - FEET[0]) / s, FEET[1] + (sy - FEET[1]) / s];
  };
  const pa = OUTLINES[MORPH_SHAPES[a]], pb = OUTLINES[MORPH_SHAPES[b]];
  const pts: Vec[] = [];
  for (let i = 0; i < pa.length; i += 2) pts.push(place([pa[i] + (pb[i] - pa[i]) * u, pa[i + 1] + (pb[i + 1] - pa[i + 1]) * u]));
  const da = DEEPEST[MORPH_SHAPES[a]], db = DEEPEST[MORPH_SHAPES[b]];
  const deep = place([da[0] + (db[0] - da[0]) * u, da[1] + (db[1] - da[1]) * u]);
  return { s, place, pts, deep };
}

const r2 = (n: number) => Math.round(n * 100) / 100;
const pathOf = (pts: Vec[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${r2(x)} ${r2(y)}`).join("") + "Z";

/** times from..to (ms) every 20 ms, ends included */
const every20 = (from: number, to: number) => {
  const list: number[] = [];
  for (let t = from; t < to; t += 20) list.push(t);
  return [...list, to];
};

/**
 * Sample times for the outline, squash and hands: every original key, plus every 20 ms while the morph, the
 * stroke and the scales change together (turning into an arrow, the press, turning back).
 */
const SAMPLES = [...new Set([
  ...[...MORPH_TIMES, ...PRESS_SCALE.map(([f]) => f), ...PRESS_NUDGE.map(([f]) => f), ...CURSOR_SCALE.map(([f]) => f)].map(ms),
  ...every20(ms(.312), ms(.412)), ...every20(ms(.485), ms(.585)), ...every20(ms(.677), ms(.777)),
])].sort((p, q) => p - q);
const FRAMES = SAMPLES.map((t) => ({ t, ...frameAt(t) }));

/** The eyes close from .312 and are gone from .345 (as the original's discrete opacity) until it is round again. */
const EYES_HIDE = ms(.345);
/** The original shows them as closed slits from .749 and opens them from .777; here they reappear, opening, at .777. */
const EYES_BACK = ms(.777);
/** the middle of the eyes, kept where the original draws it while the squash already starts (before they hide) */
const EYE_MID: Vec = [32, 33.2];

/**
 * The click ripples: two ink circles (stroke 2) growing from the tip while they fade (opacity .9 to 0), the second a
 * little later and smaller. Rather than scaling one circle (which would scale its stroke from 0 up), each ripple is
 * a run of rings of radius 1, 2, 3...: each ring is shown while the ripple's radius is within half a unit of its own
 * and scaled by at most a quarter (ring 1 grows from nothing), so the line stays close to 2 wide. Drawn behind the body, as in the original.
 */
const RIPPLES = [
  { name: "rippleA", from: ms(.51), to: ms(.594), radius: 9 },
  { name: "rippleB", from: ms(.535), to: ms(.619), radius: 5.4 },
];
export const cursorRipples: { name: string; r: number }[] = [];
const rippleProps: NonNullable<AgentAnimation["props"]> = {};
for (const rp of RIPPLES) {
  const timeAt = (r: number) => rp.from + ((rp.to - rp.from) * r) / rp.radius;
  for (let ring = 1; ring - 0.5 < rp.radius; ring++) {
    const lo = Math.max(0, ring - 0.5), hi = Math.min(rp.radius, ring + 0.5);
    const span: Span = [Math.round(timeAt(lo)), hi >= rp.radius ? rp.to : Math.round(timeAt(hi))];
    // at the body's own sample times (so the ring follows its squash exactly), plus every 20 ms
    const times = [...new Set([...every20(span[0], span[1]), ...SAMPLES.filter((t) => t > span[0] && t < span[1])])].sort((p, q) => p - q);
    const offset: Key<Vec>[] = [], scale: Key<number>[] = [], opacity: Key<number>[] = [];
    for (const t of times) {
      const u = (t - rp.from) / (rp.to - rp.from);
      const { s } = frameAt(t);
      // undo the rig's squash (about the feet) so the ring sits on the tip, at its true size
      offset.push([t, [FEET[0] + (TIP[0] - FEET[0]) / s, FEET[1] + (TIP[1] - FEET[1]) / s], "linear"]);
      scale.push([t, (rp.radius * u) / ring / s, "linear"]);
      opacity.push([t, 0.9 * (1 - u), "linear"]);
    }
    const name = `${rp.name}${ring}`;
    cursorRipples.push({ name, r: ring });
    rippleProps[name] = { attach: "world", offset, scale, opacity, visible: [span], behind: [[0, D]] };
  }
}

const hand = { path: FRAMES.map(({ t, deep }): Key<Vec> => [t, deep, "linear"]), behind: [[0, D]] as Span[] };

export const cursor: AgentAnimation = {
  duration: D,
  rest: 0,
  body: {
    lift: HOP.map(([f, v]): Key<number> => [ms(f), v, "linear"]),
    outline: FRAMES.map(({ t, pts }): Key<string> => [t, pathOf(pts), "linear"]),
    squash: FRAMES.map(({ t, s }): Key<Vec> => [t, [s, s], "linear"]),
  },
  eyes: {
    // the rig scales the eyes with the squash about the feet; this keeps their middle where the original has it
    look: [
      ...FRAMES.filter(({ t }) => t <= EYES_HIDE).map(({ t, place }): Key<Vec> => {
        const [x, y] = place(EYE_MID);
        return [t, [r2(x - EYE_MID[0]), r2(y - EYE_MID[1])], "linear"];
      }),
      [EYES_BACK, [0, 0]],
    ],
    // a blink at .204; closing as it turns into an arrow (shut just as they hide); opening as it is round again
    blinks: [ms(.204), EYES_HIDE, EYES_BACK],
    hidden: [[EYES_HIDE, EYES_BACK]],
  },
  hands: { L: hand, R: hand },
  props: rippleProps,
  events: [[ms(.51), "click"]],
};
