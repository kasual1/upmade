import type { AgentAnimation, BlinkShape, Track, Vec } from "../types";
import { SHAPES } from "../tokens";

/**
 * Two agents handing a document back and forth (the "Realtime collaboration" feature on infinite.html), in a 3.6 s
 * loop. The green triangle stands on the left, the blue circle on the right, both drawn at 0.7 with their feet (32 49)
 * at (16.2 50) and (47.8 50) of the 64x64 box; the whole drawing sits 3 up. The document starts in the triangle's
 * hands; the circle reaches its right hand out ready (0-0.3 s); at 1.2-1.8 s both left hands carry the document over
 * in an arc to the circle, which hops when it arrives (1.8 s) while the triangle's hand drops back; the triangle then
 * reaches out (2.1 s), and at 3-3.6 s the circle hands it back in the same arc and the triangle hops as it arrives
 * (0 s). Each agent glances at the document when it moves away from it, and each blinks once.
 *
 * The original draws the hands and the document at full size, on top of both bodies (document, then the triangle's
 * hand, then the circle's), so this is three animations for three <Agent>s, laid over one another in that order:
 *   - `handoffTriangle` and `handoffCircle`: the two bodies (eyes, glances, blink, hop), drawn at 0.7 (a constant
 *     body.squash) and put in place with a constant body.shift and body.lift, in the box's coordinates. Their rig hands
 *     wait behind the middle of their own bodies, out of sight: the visible hands are the stage's props.
 *   - `handoff`: a full-size "stage" with no body (an empty outline, its eyes hidden) holding the document and both
 *     visible hands as world props, in the box's coordinates. Its rig hands ride under the document, which covers
 *     them. Props: `doc`, `triangleHand`, `circleHand` (drawn in that order). Events: `toCircle` (the circle has the
 *     document, 1.8 s) and `toTriangle` (it is back with the triangle, at the loop's end).
 */
const D = 3600;
/** the whole drawing sits 3 up */
const UP = -3;
/** the agents' bodies are drawn at 0.7 */
const SCALE = 0.7;
/** a hop of 2 in the box */
const HOP = -2;
/** the ground both agents stand on: their feet at y 50 of the box, moved 3 up */
const GROUND = 50 + UP;
/** the shared frame of the three layers: the bodies' scale and ground */
const FRAME = { scale: SCALE, ground: GROUND };
/** Each body's place in the box: shrunk to 0.7 about the rig's feet F, its own (32 49) put at (feetX, GROUND). */
const place = (feetX: number, F: Vec) => ({ shift: feetX - 32, lift: GROUND - F[1] - SCALE * (49 - F[1]) });
const TRIANGLE_PLACE = place(16.2, SHAPES.triangle.feet);
const CIRCLE_PLACE = place(47.8, SHAPES.circle.feet);

/** The original's blink: the eyes scale linearly (plain SMIL keyframes) to .08 over 0.022 of the loop (79.2 ms) and back
 *  over 0.039 (140.4 ms), about the eyes' middle. */
const BLINK: BlinkShape = { close: 0.022 * D, open: 0.039 * D, depth: 0.08, ease: "linear" };

/** The original's triangle, which differs a little from tokens' TRIANGLE at its two bottom corners (its bottom edge is
 *  at 49.60, not 49.56); set as a one-key outline track so the body is exactly the original's. */
const TRIANGLE_ORIGINAL =
  "M25.82 16.10L26.43 15.23L27.17 14.46L28.00 13.81L28.92 13.29L29.91 12.91L30.94 12.68L32.00 12.60L33.06 12.68L34.09 12.91L35.08 13.29L36.00 13.81L36.83 14.46L37.57 15.23L38.18 16.10L39.68 18.61L41.19 21.12L42.69 23.63L44.20 26.14L45.70 28.65L47.21 31.16L48.71 33.68L50.22 36.19L51.73 38.70L52.21 39.67L52.55 40.70L52.72 41.77L52.74 42.85L52.59 43.93L52.28 44.97L51.81 45.95L51.21 46.85L50.48 47.65L49.63 48.33L48.70 48.88L47.69 49.28L46.63 49.52L45.55 49.60L42.54 49.60L39.53 49.60L36.52 49.60L33.51 49.60L30.49 49.60L27.48 49.60L24.47 49.60L21.46 49.60L18.45 49.60L17.37 49.52L16.31 49.28L15.30 48.88L14.37 48.33L13.52 47.65L12.79 46.85L12.19 45.95L11.72 44.97L11.41 43.93L11.26 42.85L11.28 41.77L11.45 40.70L11.79 39.67L12.27 38.70L13.78 36.19L15.29 33.68L16.79 31.16L18.30 28.65L19.80 26.14L21.31 23.63L22.81 21.12L24.32 18.61Z";

/** A SMIL `values` / `keyTimes` pair as a linear track of points (in the box, moved 3 up). */
function smil(values: string, keyTimes: string, dy = 0): Track<Vec> {
  const ts = keyTimes.split(";").map(Number);
  return values.split(";").map((v, n) => {
    const [x, y] = v.trim().split(/\s+/).map(Number);
    return [Math.round(ts[n] * D), [x, y + dy] as Vec, "linear"] as const;
  });
}

/** The document: rests in the triangle's hands at (29.3 47.5), arcs up over the gap (32 45.5) to the circle at
 *  (34.7 47.5) between 1.2 and 1.8 s, and back the same way between 3 and 3.6 s. */
const docPath = smil("29.3 47.5;29.3 47.5;32 45.5;34.7 47.5;34.7 47.5;32 45.5;29.3 47.5", "0;0.333;0.417;0.5;0.833;0.917;1", UP);

/** The triangle's hand: carries the document over with it (to 28.1 53.1), drops back a little (24 52.5) at 2.1 s,
 *  and comes back to its rest at (22.7 53.1) as the document returns. */
const triangleHand = smil("22.7 53.1;22.7 53.1;25.4 51.1;28.1 53.1;24 52.5;24 52.5;22.7 53.1", "0;0.333;0.417;0.5;0.583;0.889;1", UP);

/** The circle's hand: reaches out ready (40 52.5) by 0.3 s, takes the document (41.3 53.1) at 1.8 s, and carries it
 *  back over to the triangle, ending at its rest (35.9 53.1). */
const circleHand = smil("35.9 53.1;40 52.5;40 52.5;41.3 53.1;41.3 53.1;38.6 51.1;35.9 53.1", "0;0.083;0.389;0.5;0.833;0.917;1", UP);

/** A hop of HOP from `base`, at the original's keyTimes (fractions of the loop): still, up, down. */
const hop = (base: number, t0: number, t1: number, t2: number, t3: number): Track<number> => [
  [t0 * D, base], [t1 * D, base, "linear"], [t2 * D, base + HOP, "linear"], [t3 * D, base, "linear"],
];

/** The triangle: hops as the document arrives back (0-0.28 s); looks down at the document (1 1.4), then, as it
 *  leaves, up after it (1.2 .2); blinks at 2.48 s (79 ms shut, 140 ms open again). Its rig hands wait behind its body. */
export const handoffTriangle: AgentAnimation = {
  duration: D,
  frame: FRAME,
  rest: 600,
  body: {
    outline: [[0, TRIANGLE_ORIGINAL]],
    squash: [[0, [SCALE, SCALE]]],
    shift: [[0, TRIANGLE_PLACE.shift]],
    // the hop: keyTimes 0;0.006;0.039;0.078
    lift: hop(TRIANGLE_PLACE.lift, 0, 0.006, 0.039, 0.078),
  },
  // shut at 0.689 of the loop
  eyes: { look: smil("1 1.4;1 1.4;1.2 .2;1.2 .2;1 1.4", "0;0.333;0.5;0.833;1"), blinks: [0.689 * D], blink: BLINK },
  hands: {
    L: { path: [[0, [32, 40]]], behind: [[0, D]] },
    R: { path: [[0, [32, 40]]], behind: [[0, D]] },
  },
};

/** The circle: hops as the document arrives (1.8-2.06 s); looks across (-1.2 .2), then down at the document once it
 *  has it (-1 1.4); blinks at 0.68 s. Its rig hands wait behind its body. */
export const handoffCircle: AgentAnimation = {
  duration: D,
  frame: FRAME,
  rest: 600,
  body: {
    squash: [[0, [SCALE, SCALE]]],
    shift: [[0, CIRCLE_PLACE.shift]],
    // the hop: keyTimes 0;0.5;0.533;0.572
    lift: hop(CIRCLE_PLACE.lift, 0, 0.5, 0.533, 0.572),
  },
  // shut at 0.189 of the loop
  eyes: { look: smil("-1.2 .2;-1.2 .2;-1 1.4;-1 1.4;-1.2 .2", "0;0.333;0.5;0.833;1"), blinks: [0.189 * D], blink: BLINK },
  hands: {
    L: { path: [[0, [32, 31]]], behind: [[0, D]] },
    R: { path: [[0, [32, 31]]], behind: [[0, D]] },
  },
};

/** The stage: the document and the two visible hands, at full size in the box's coordinates. */
export const handoff: AgentAnimation = {
  duration: D,
  frame: FRAME,
  rest: 600,
  // no body: an empty outline (nothing is stroked for a zero-length path) and no eyes
  body: { outline: [[0, "M0 0Z"]] },
  eyes: { hidden: [[0, D]] },
  // the rig hands (radius 4.6 + stroke) ride behind the document, whose 13 x 12 sheet covers them completely
  hands: {
    L: { path: docPath, behind: [[0, D]] },
    R: { path: docPath, behind: [[0, D]] },
  },
  // drawn in this order, as in the original: the document, then the triangle's hand, then the circle's on top
  props: {
    doc: { attach: "world", offset: docPath },
    // at the agents' size (the frame zooms this stage by 1 / SCALE), like every agent's hands
    triangleHand: { attach: "world", offset: triangleHand, scale: [[0, SCALE]] },
    circleHand: { attach: "world", offset: circleHand, scale: [[0, SCALE]] },
  },
  events: [[1800, "toCircle"], [D, "toTriangle"]],
};
