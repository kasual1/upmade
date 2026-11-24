import { SHAPES } from "../tokens";
import type { AgentAnimation, Key, PropTrack, Span, Vec } from "../types";

/**
 * The hero agent of infinite.html: the pink squircle cycles through the canvas tools in the toolbar's order, each one
 * pulled out from behind its back and put back there again. One loop is 26.27 s:
 *
 *   0      cursor          3.6 s   no tool: the right hand comes out empty and rests; the eyes glance left, then
 *                                  right (is anyone watching?), come back and blink twice; the hand slips back
 *   3.6    pen             3.78 s  a paintbrush: flipped bristles-down (the grip slides up the handle), it paints a
 *                                  wavy blue line at the agent's bottom left, lifts off and flips back up. It
 *                                  concentrates meanwhile: narrowed eyes on the stroke, the tip of the tongue out
 *   7.38   eraser          3.15 s  tosses the eraser once (a flip just above the hand), then one swipe through the
 *                                  middle of the line removes all of it at once (like the editor's eraser)
 *   10.53  arrow           3.8 s   pulls out an arrow, tosses it high over its head (two spins), catches it in the
 *                                  left hand and tucks it away behind its back with both hands
 *   14.33  shapeRectangle  4.48 s  three shapes (triangle, square, circle) carried out stacked on the right hand,
 *                                  then juggled in a three-ball cascade over its head, a throw every 0.32 s
 *   18.81  type            4.08 s  a typewriter (we see its back: it faces the agent); both hands type over the top,
 *                                  the carriage slides along three lines
 *   22.89  image           3.38 s  holds up a photo with a little wobble, smiling (eyes closed into happy arcs, cheeks
 *                                  blushing)
 *
 * A tool turn is: 0.7 s out (the first half behind the body, from a spot tucked inside its outline to just past its
 * right edge, the second half in front, into the hand's working spot), the "use" time, 0.6 s back the same way, and
 * a 0.18 s beat with the right hand empty (behind the back), reaching for the next tool.
 *
 * The original is driven by a script, not SMIL: every frame it works out each part's place from these turns (with
 * a cubic ease-in-out, `ez` below). So this file keeps that script's logic as it is (`frame()` below, with the
 * original's names and numbers), runs it once over the loop at STEP ms and turns what it draws into linear tracks,
 * dropping the keys that a straight line between their neighbours already gives. Its idle eye glances and blinks are
 * SMIL animations that the script stops and restarts (while it looks around or concentrates); those restarts are
 * followed too.
 *
 * Drawing it with the rig: the original draws its own hands (radius 5), and the right hand is part of each tool, so
 * the rig's hands wait out of sight behind the body and the hands are props (`handL`, `handR` for the empty right hand
 * of the rest and the arrow turn, and one inside each tool). Everything is a "world" prop placed in the agent's 64x64
 * space, in the order the original layers them (see PROP_ORDER).
 *
 * Events: `tool:<name>` as each turn starts, with the toolbar's tool names (cursor, pen, eraser, arrow, shapeRectangle,
 * type, image), so a page can sync its toolbar.
 */

// ---- the original's numbers ----
const OUT = 0.7, IN = 0.6, GAP = 0.18;
const LREST: Vec = [11.6, 41.5], LTYPE: Vec = [19, 46.5], LS = 0.86;   // the free (left) hand: resting, typing; its size while typing
type P = readonly [x: number, y: number, rotate: number, scale: number];   // a pose: where a tool's hand is, its turn and size

interface Turn {
  name: "rest" | "brush" | "eraser" | "arrow" | "juggle" | "typer" | "photo";
  tool: string;   // the toolbar's name for it
  dur?: number;   // custom turns (the rest, the arrow) have their own length
  use?: number;
  behind?: P; out?: P; hold?: P; holdEnd?: P; lStart?: Vec; lEnd?: Vec;
}

// cascade: throws alternate right/left every BEAT; each shape is thrown from the inside of one hand, flies over the
// agent's head to the outside of the other hand, and is carried back inside (a little scoop) to be thrown again
const BEAT = 0.32, FLY = 2.4, TAU0 = 3, PEAK = -3;
const JHANDS = { R: { in: [45.5, 45.5] as Vec, out: [56, 43] as Vec }, L: { in: [18.5, 45.5] as Vec, out: [8, 43] as Vec } };
const BUNDLE: Vec[] = [[6.2, -13.8], [-6.6, -8.8], [2, -7.4]];   // the shapes stacked on the right hand

const ez = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const c01 = (x: number) => Math.max(0, Math.min(1, x));
function mix<T extends readonly number[]>(a: T, b: readonly number[], u: number): T {
  return a.map((v, i) => v + (b[i] - v) * u) as unknown as T;
}

function handAt(side: "R" | "L", tau: number): Vec {
  const h = JHANDS[side], ph = (((tau - (side === "R" ? 0 : 1)) % 2) + 2) % 2;   // right throws on even beats, left on odd
  const C = FLY - 1;   // it catches FLY-1 beats after its own throw, then carries the shape back in
  if (ph < C) {
    const e = ez(ph / C), p = mix(h.in, h.out, e);
    return [p[0], p[1] - 1.6 * Math.sin(Math.PI * e)];
  }
  const e = (ph - C) / (2 - C), p = mix(h.out, h.in, e);
  return [p[0], p[1] + 2.2 * Math.sin(Math.PI * e)];
}
function ballAt(k: number, tau: number): [number, number, number] {
  const n = Math.floor((tau - k) / 3), b = k + 3 * n, u = tau - b, thr = b % 2 === 0 ? "R" : "L", cat = thr === "R" ? "L" : "R";
  if (u < FLY) {
    const f = u / FLY, A = JHANDS[thr].in, B = JHANDS[cat].out, y0 = A[1] - 6.6, y1 = B[1] - 6.6, H = (y0 + y1) / 2 - PEAK;
    return [A[0] + (B[0] - A[0]) * f, y0 + (y1 - y0) * f - 4 * H * f * (1 - f), (thr === "R" ? -1 : 1) * 360 * f];
  }
  const p = handAt(cat, tau);
  return [p[0], p[1] - 6.6, 0];
}

const TURNS: Turn[] = [
  { name: "rest", tool: "cursor", dur: 3.6 },   // looks left, looks right, then blinks twice
  { name: "brush", tool: "pen", use: 2.3, behind: [42, 40, -30, 0.7], out: [59, 40, 12, 1], hold: [52.4, 41.5, 0, 1] },
  { name: "eraser", tool: "eraser", use: 1.67, behind: [40, 37, -10, 0.7], out: [62, 40, 0, 1], hold: [52.4, 41.5, 0, 1] },
  { name: "arrow", tool: "arrow", dur: 3.8 },
  { name: "juggle", tool: "shapeRectangle", use: 3, behind: [38, 42, -10, 0.7], out: [60, 43, 0, 1] },
  { name: "typer", tool: "type", use: 2.6, behind: [38, 38, 0, 0.7], out: [78, 44, 0, 1], hold: [45, 46.5, 0, 1.3] },
  { name: "photo", tool: "image", use: 1.9, behind: [34, 42, -8, 0.75], out: [64.5, 42, 8, 1], hold: [55, 43, 6, 1] },
];
{
  // the juggling turn starts and ends where the cascade has the hands
  const J = TURNS[4], tauEnd = TAU0 + J.use! / BEAT;
  J.hold = [...handAt("R", TAU0), 0, 1];
  J.holdEnd = [...handAt("R", tauEnd), 0, 1];
  J.lStart = handAt("L", TAU0);
  J.lEnd = handAt("L", tauEnd);
}
const LEN = TURNS.map((t) => t.dur ?? OUT + t.use! + IN + GAP);
const CYCLE = LEN.reduce((a, b) => a + b, 0);   // 26.27 s
const START = LEN.map((_, k) => LEN.slice(0, k).reduce((a, b) => a + b, 0));

// ---- the painted line: one gentle curve that sags in the middle, rising slightly, at the agent's bottom left ----
export const STROKE_POINTS: Vec[] = Array.from({ length: 41 }, (_, k) => {
  const u = k / 40;
  return [4 + 20 * u, 59.6 + 2 * Math.sin(Math.PI * u) - 0.6 * u] as Vec;
});
const strokeAt = (u: number): Vec => {
  const f = c01(u) * 40, k = Math.min(39, Math.floor(f)), r = f - k, SP = STROKE_POINTS;
  return [SP[k][0] + (SP[k + 1][0] - SP[k][0]) * r, SP[k][1] + (SP[k + 1][1] - SP[k][1]) * r];
};
const FLIP = 250, GRIP = 12;
const tipOff = (th: number): Vec => {   // where the bristle tip is, seen from the hand
  const a = (th * Math.PI) / 180, d = 30.4 - GRIP;
  return [d * Math.sin(a), -d * Math.cos(a)];
};
const ER = -20;
const erTip: Vec = (() => {   // the rubber's edge, seen from the hand
  const a = (ER * Math.PI) / 180, x = -3.8, y = 10.8;
  return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
})();

/** The paint stroke is shown in this many frames while it is drawn (`paint1`..`paint<n>`, the last is the whole line). */
export const PAINT_FRAMES = 24;
/**
 * The squashed-eye frames: `eyes<k>` (k = 1..EYE_FRAMES) are the eyes at k/EYE_STEPS of their height. They draw the
 * narrowed eyes, the eyes closing into the smile and every blink (the original's blinks are slower than the rig's).
 */
export const EYE_STEPS = 20;
export const EYE_FRAMES = EYE_STEPS - 1;

// ---- the idle SMIL glances and blinks of the agent template ----
const GL_T = [0, 0.25, 0.28, 0.5, 0.53, 0.8, 1], GL_V: Vec[] = [[0, 0], [0, 0], [1.5, 0], [1.5, 0], [-1.3, 0.3], [-1.3, 0.3], [0, 0]];
function glance(since: number): Vec {
  const u = (since % 7) / 7;
  for (let k = 1; k < GL_T.length; k++) if (u <= GL_T[k]) return mix(GL_V[k - 1], GL_V[k], (u - GL_T[k - 1]) / (GL_T[k] - GL_T[k - 1]));
  return [0, 0];
}
// its 8 s blinking loop (a scale of the eyes, linear between these keys): one blink, then a double blink
const BL_T = [0, 0.42, 0.435, 0.46, 0.88, 0.893, 0.912, 0.925, 0.945, 1], BL_V = [1, 1, 0.08, 1, 1, 0.08, 1, 0.08, 1, 1];
function smilBlink(since: number): number {
  const u = (since % 8) / 8;
  for (let k = 1; k < BL_T.length; k++) if (u <= BL_T[k]) return BL_V[k - 1] + (BL_V[k] - BL_V[k - 1]) * ((u - BL_T[k - 1]) / (BL_T[k] - BL_T[k - 1]));
  return 1;
}
// the rest's look-around: where the eyes look, and its two blinks (each 150 ms, down to 0.08)
const GAZE: [number, number][] = [[0, 0], [0.35, 0], [0.65, -3.6], [1.1, -3.6], [1.45, 3.6], [1.9, 3.6], [2.15, 0]], REST_BLINKS = [2.38, 2.7];

// ---- what one frame draws ----
interface Placed { at: Vec; rot: number; scale: number; behind: boolean }
/** a tool's pose, followed by a translate and a rotate inside it */
function place(p: P, behind: boolean, lx = 0, ly = 0, lr = 0, ls = 1): Placed {
  const a = (p[2] * Math.PI) / 180, s = p[3];
  return { at: [p[0] + s * (Math.cos(a) * lx - Math.sin(a) * ly), p[1] + s * (Math.sin(a) * lx + Math.cos(a) * ly)], rot: p[2] + lr, scale: s * ls, behind };
}
interface Frame {
  props: Record<string, Placed | undefined>;
  look: Vec;       // the whole face's offset (concentrating, looking around)
  glance: Vec;     // plus the eyes' own idle glances
  eyesSy: number;  // how open the eyes are (squashed while concentrating or smiling, and blinking)
  tongue: { opacity: number; scale: number };
  smile: number;   // the smile's opacity
  paint: { prog: number; opacity: number };
}

/**
 * Runs the original's frame script over two loops (the first one sets up what carries over, like the painted line
 * and the glances' restarts) and returns the frames of the second, every STEP ms.
 */
const STEP = 10;
function simulate() {
  // the state the original keeps in the DOM between frames
  let lineDrawn = false, prog = 0, paintOp = 0;
  let focused = 0, gazeOn = false, smileV = 0;
  let look: Vec = [0, 0], eyesSy = 1, browsOp = 0, tongueS = 0.4, smileOp = 0;
  let glanceFrom: number | null = 0, blinkFrom: number | null = 0;
  let th = 24, gr = 0, toss: Vec = [0, 0], carriageX = -4.5, typeHandY = 0;
  let balls: [number, number, number][] = BUNDLE.map((b) => [b[0], b[1], 0]);
  let lastTurn = -1, now = 0;

  const setFocus = (f: number) => {
    f = c01(f);
    if (f === focused) return;
    if (f > 0 && !focused) glanceFrom = null;
    look = [-1.9 * f, 1.5 * f];
    eyesSy = 1 - 0.3 * f;
    browsOp = Math.min(1, f * 2);
    tongueS = 0.4 + 0.6 * ez(f);   // it pokes out as the agent focuses
    if (f === 0) { look = [0, 0]; eyesSy = 1; glanceFrom = now; }
    focused = f;
  };
  const setSmile = (v: number) => {
    v = c01(v);
    if (Math.abs(v - smileV) < 0.001) return;
    smileV = v;
    smileOp = c01((v - 0.25) / 0.6);   // the arcs and blush appear as the open eyes close
    if (focused || gazeOn) return;
    eyesSy = v > 0 ? 1 - ez(v) : 1;
  };
  const gazeAt = (s: number) => {
    let x = 0;
    for (let k = 1; k < GAZE.length; k++) {
      const [t0, x0] = GAZE[k - 1], [t1, x1] = GAZE[k];
      if (s < t1) { x = x0 + (x1 - x0) * ez(Math.max(0, (s - t0) / (t1 - t0))); break; }
      x = x1;
    }
    if (!gazeOn) { gazeOn = true; glanceFrom = null; blinkFrom = null; }   // no random blinks while it looks around
    look = [x, 0];
    eyesSy = REST_BLINKS.reduce((o, c) => Math.min(o, 1 - 0.92 * Math.max(0, 1 - Math.abs(s - c) / 0.075)), 1);   // its own two blinks
  };
  const gazeOff = () => {
    if (!gazeOn) return;
    gazeOn = false; look = [0, 0]; eyesSy = 1; glanceFrom = now; blinkFrom = now;
  };
  const resetTool = (t: Turn) => {
    if (t.name === "typer") { carriageX = -4.5; typeHandY = 0; }
    if (t.name === "brush") { th = 24; gr = 0; }
    if (t.name === "eraser") { prog = 1; toss = [0, 0]; }
    if (t.name === "juggle") balls = BUNDLE.map((b) => [b[0], b[1], 0]);
  };

  /** the tool's "use" phase: returns the right hand's pose (and the left hand's, for the cascade and the typing) */
  function useAnim(t: Turn, s: number): { pose: P; lp?: Vec } {
    const H = t.hold!;
    if (t.name === "brush") {   // flip, reach down-left, paint the stroke, lift, flip back
      const tip = tipOff(FLIP), handOn = (u: number): Vec => { const p = strokeAt(u); return [p[0] - tip[0], p[1] - tip[1]]; };
      let hp: Vec = [H[0], H[1]], f = 0;
      const P0 = 0.72, P1 = 1.24;   // the stroke itself takes about half a second
      prog = 0;
      if (s < 0.6) {
        const e = ez(c01(s / 0.45)); th = 24 + (FLIP - 24) * e; gr = GRIP * e;
        const m = ez(c01((s - 0.2) / 0.4)), a = handOn(0);
        hp = [H[0] + (a[0] - H[0]) * m, H[1] - 1.5 * Math.sin(Math.PI * c01(s / 0.45)) + (a[1] - 3 - H[1]) * m];
        f = c01((s - 0.2) / 0.25);
      } else if (s < P0) {   // brush down onto the canvas
        th = FLIP; gr = GRIP; const a = handOn(0); hp = [a[0], a[1] - 3 + 3 * ez(c01((s - 0.6) / (P0 - 0.6)))]; f = 1;
      } else if (s < P1) {   // painting, quick and sure: the tip follows the curve exactly
        th = FLIP; gr = GRIP; prog = ez(c01((s - P0) / (P1 - P0))) * 0.3 + c01((s - P0) / (P1 - P0)) * 0.7; hp = handOn(prog); f = 1;
      } else if (s < P1 + 0.14) {   // lift off
        th = FLIP; gr = GRIP; prog = 1; const a = handOn(1); hp = [a[0], a[1] - 3 * ez(c01((s - P1) / 0.14))]; f = 1;
      } else {   // flip back up, look at the result
        prog = 1; const e = ez(c01((s - P1 - 0.14) / 0.5)), a = handOn(1);
        th = FLIP + (24 + 360 - FLIP) * e; gr = GRIP * (1 - e);
        hp = [a[0] + (H[0] - a[0]) * e, a[1] - 3 + (H[1] - (a[1] - 3)) * e]; f = 1 - c01((s - P1 - 0.14) / 0.35);
      }
      paintOp = 1; lineDrawn = prog >= 1; setFocus(f);   // a finished line stays until it is erased
      return { pose: [hp[0], hp[1], 0, 1] };
    }
    if (t.name === "eraser") {   // a little toss first (one flip just above the hand), then one swipe through the line
      const TOSS = 0.42;
      if (s < TOSS) {
        const W = 0.05, C = 0.35; let dy = 0;
        if (s < W) dy = 0.9 * Math.sin(((Math.PI / 2) * s) / W);   // a small dip before the flick
        else if (s < C) { const u = (s - W) / (C - W); dy = 0.9 - 2.4 * Math.sin(Math.PI * u); toss = [14 * 4 * u * (1 - u), 360 * ez(u)]; }   // airborne, one full flip
        else { const v = (s - C) / (TOSS - C); dy = 1.3 * Math.sin(Math.PI * v); }   // caught, with a little give
        if (s < W || s >= C) toss = [0, 0];
        setFocus(0);
        if (lineDrawn) { paintOp = 1; prog = 1; }
        return { pose: [H[0], H[1] + dy, 0, 1] };
      }
      s -= TOSS; toss = [0, 0];
      const mid = strokeAt(0.5), A: Vec = [mid[0] - 6, mid[1] - 8], B: Vec = [mid[0] + 5, mid[1] + 7], hand = (p: Vec): Vec => [p[0] - erTip[0], p[1] - erTip[1]];
      const S0 = 0.42, S1 = 0.7, HIT = S0 + ((S1 - S0) * 8) / 15;   // the swipe; the rubber crosses the line about halfway through it
      let hp: Vec = [H[0], H[1]], r = 0, f = 0;
      if (s < S0) {   // swoops in, under the face
        const m = ez(c01(s / S0)), a = hand(A);
        hp = [H[0] + (a[0] - H[0]) * m, H[1] + (a[1] - H[1]) * m + 4 * Math.sin(Math.PI * m)]; r = ER * m; f = c01((s - 0.08) / 0.22);
      } else if (s < S1) {   // the strike through
        const k = c01((s - S0) / (S1 - S0)), e = k * k * (3 - 2 * k);
        hp = hand([A[0] + (B[0] - A[0]) * e, A[1] + (B[1] - A[1]) * e]); r = ER; f = 1;
      } else {   // back to its side
        const e = ez(c01((s - S1) / 0.5)), a = hand(B);
        hp = [a[0] + (H[0] - a[0]) * e, a[1] + (H[1] - a[1]) * e + 3 * Math.sin(Math.PI * e)]; r = ER * (1 - e); f = 1 - c01((s - S1) / 0.3);
      }
      if (lineDrawn) { prog = 1; paintOp = 1 - c01((s - HIT) / 0.1); if (s >= HIT + 0.1) lineDrawn = false; }   // touched: the whole line goes at once
      else paintOp = 0;
      setFocus(f); browsOp = 0;   // erasing: focused eyes, but no tongue
      return { pose: [hp[0], hp[1], r, 1] };
    }
    if (t.name === "photo")   // shows it off, a little wobble
      return { pose: [H[0], H[1] - 0.6 * Math.abs(Math.sin((s * Math.PI) / 1.7)), H[2] + 3 * Math.sin((s * Math.PI * 2) / 2.2), H[3]] };
    if (t.name === "typer") {   // the carriage moves as it types (seen from behind it moves the other way)
      const p = Math.min(3, (s / (t.use! - 0.3)) * 3), k = Math.min(2, Math.floor(p)), f = p >= 3 ? 1 : p - k;
      carriageX = -4.5 + 9 * f;
      const beat = Math.sin(s * Math.PI * 2 * 4), on = p < 3;
      typeHandY = on ? -1.1 * Math.max(0, beat) : 0;
      return { pose: H, lp: [LTYPE[0], LTYPE[1] + (on ? -1.4 * Math.max(0, -beat) : 0)] };
    }
    // juggling: eases in from (and back to) the bundle
    const tau = TAU0 + s / BEAT, r = handAt("R", tau), w = Math.min(1, s / 0.3, (t.use! - s) / 0.3), we = ez(Math.max(0, w));
    balls = BUNDLE.map((bd, k) => {
      const q = ballAt(k, tau), bx = r[0] + bd[0], by = r[1] + bd[1];
      return [bx + (q[0] - bx) * we - r[0], by + (q[1] - by) * we - r[1], q[2] * we];
    });
    return { pose: [r[0], r[1], 0, 1], lp: handAt("L", tau) };
  }

  /** the tool's props at a pose (its own hand included) */
  function tool(t: Turn, p: P, behind: boolean, out: Frame["props"]) {
    if (t.name === "brush") {
      out.brush = place(p, behind, ...rotated(th, 0, gr), th);   // rotate(th) translate(0 gr) inside the hand
      out.brushHand = place(p, behind);
    } else if (t.name === "eraser") {
      out.eraserHand = place(p, behind);
      out.eraser = place(p, behind, -3.8, 4 - toss[0], toss[1]);   // translate(0 -y) rotate(a -3.8 4) translate(-3.8 4)
    } else if (t.name === "juggle") {
      balls.forEach((b, k) => (out[`shape${k}`] = place(p, behind, b[0], b[1], b[2])));
      out.juggleHand = place(p, behind);
    } else if (t.name === "typer") {
      out.typerHand = place(p, behind, 0, typeHandY);
      out.typerBase = place(p, behind, -10, 5);
      out.typerCarriage = place(p, behind, -10 + carriageX, 5);
    } else if (t.name === "photo") out.photo = place(p, behind);
  }

  /** the arrow turn: pulled out, wind-up, tossed over the head (two spins), caught in the left hand, both hands go behind the back */
  function arrowFrame(s: number, dur: number, out: Frame["props"]) {
    const R_BEH: P = [40, 40, -20, 0.7], R_OUT: P = [60, 40, 10, 1], R_HOLD: P = [52.4, 41.5, 0, 1];
    const L_BEH: P = [24, 40, 20, 0.7], L_OUT: P = [2, 40, -10, 1], L_HOLD: P = [LREST[0], LREST[1], 0, 1];
    let rp = R_HOLD, rb = false, lp = L_HOLD, lb = false, ap: P | null = null, att: "R" | "L" | null = null, showR = true;
    if (s < 0.7) {   // pulled out
      const u = s / 0.7; att = "R";
      if (u < 0.5) { rp = mix(R_BEH, R_OUT, ez(u / 0.5)); rb = true; } else rp = mix(R_OUT, R_HOLD, ez((u - 0.5) / 0.5));
    } else if (s < 0.95) {   // wind-up
      att = "R"; rp = [52.4, 41.5 + 2.2 * Math.sin((Math.PI * (s - 0.7)) / 0.25), 0, 1];
    } else if (s < 2.05) {   // in the air: starts and ends in the tilted grip
      const u = (s - 0.95) / 1.1, T = (18 * Math.PI) / 180, x0 = 52.4 + 3 * Math.sin(T), x1 = 11.6 - 3 * Math.sin(T);
      const y0 = 41.5 - 3 * Math.cos(T), y1 = 40 - 3 * Math.cos(T), H = (y0 + y1) / 2 + 6;
      ap = [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u - 4 * H * u * (1 - u), 18 - 756 * (ez(u) * 0.35 + u * 0.65), 1];   // two full spins
      rp = [52.4, 41.5 - 3 * Math.sin(Math.PI * Math.min(1, (s - 0.95) / 0.5)), 0, 1];   // follow-through
      lp = mix(L_HOLD, [11.6, 40, 0, 1], ez(c01((s - 1.55) / 0.5)));   // the left hand rises to catch
    } else if (s < 2.35) {   // caught: a little give
      const v = (s - 2.05) / 0.3; att = "L"; lp = [11.6, 40 + 1.5 * v + 1.6 * Math.sin(Math.PI * v), 0, 1];
    } else if (s < 3.15) {   // both hands go behind the back
      const u = (s - 2.35) / 0.8; att = "L";
      if (u < 0.5) { const e = ez(u / 0.5); lp = mix(L_HOLD, L_OUT, e); rp = mix(R_HOLD, R_OUT, e); }
      else { const e = ez((u - 0.5) / 0.5); lp = mix(L_OUT, L_BEH, e); lb = true; rp = mix(R_OUT, R_BEH, e); rb = true; }
    } else {   // the left hand comes back out, empty
      const u = Math.min(1, (s - 3.15) / (dur - 3.15 - 0.05)); showR = false;
      if (u < 0.5) { lp = mix(L_BEH, L_OUT, ez(u / 0.5)); lb = true; } else lp = mix(L_OUT, L_HOLD, ez((u - 0.5) / 0.5));
    }
    if (showR) out.handR = place(rp, rb);
    out.handL = place(lp, lb);
    // the arrow sits under the hand that grips it, held leaning outwards: right in the right hand, left in the left
    const grip = att === "R" ? rp : att === "L" ? lp : null;
    if (grip) out.arrow = place(grip, att === "R" ? rb : lb, ...rotated(att === "R" ? 18 : -18, 0, -3), att === "R" ? 18 : -18);
    else if (ap) out.arrow = place(ap, false);
  }

  const frames: Frame[] = [];
  const n = Math.round((CYCLE * 1000) / STEP);
  for (let i = 0; i < 2 * n; i++) {
    now = (i * STEP) / 1000;
    const c = ((i * STEP) % Math.round(CYCLE * 1000)) / 1000;
    let k = 0;
    while (k < TURNS.length - 1 && c >= START[k + 1] - 1e-9) k++;
    const t = TURNS[k], s = c - START[k];
    const props: Frame["props"] = {};
    if (k !== lastTurn) { resetTool(t); lastTurn = k; }
    if (t.name !== "rest") gazeOff();   // the look-around only belongs to the rest
    // smiles as the photo comes out, keeps smiling while showing it, and stops as it goes away
    setSmile(t.name === "photo" ? (s < OUT ? c01((s - OUT * 0.4) / (OUT * 0.6)) : s < OUT + t.use! ? 1 : c01(1 - (s - OUT - t.use!) / (IN * 0.6))) : 0);
    const painting = t.name === "brush" || t.name === "eraser";
    if (!painting || s < OUT || s >= OUT + t.use!) setFocus(0);   // the focused face only while painting or erasing
    if (!painting) paintOp = lineDrawn ? 1 : 0;   // a finished line stays until the eraser has rubbed it out
    if (t.name === "brush" && s < OUT) paintOp = lineDrawn ? 1 - s / OUT : 0;   // a new brush turn: the old line makes room
    if (t.name === "rest") {
      if (s < t.dur! - 0.4) gazeAt(s); else gazeOff();
      // both hands empty: the right hand comes out from behind the back, rests, and slips back just before the next tool
      const R_BEH: P = [40, 40, -20, 0.7], R_OUT: P = [60, 40, 10, 1], R_REST: P = [52.4, 41.5, 0, 1], T = 0.35;
      const kk = s < T ? s / T : s > t.dur! - T ? (t.dur! - s) / T : 1;
      let p = R_REST, behind = false;
      if (kk < 0.5) { p = mix(R_BEH, R_OUT, ez(kk / 0.5)); behind = true; } else if (kk < 1) p = mix(R_OUT, R_REST, ez((kk - 0.5) / 0.5));
      props.handR = place(p, behind);
      props.handL = place([LREST[0], LREST[1], 0, 1], false);
    } else if (t.name === "arrow") arrowFrame(s, t.dur!, props);
    else {
      let lp: Vec = LREST, ls = 1;
      const typing = t.name === "typer", lUse = typing ? LTYPE : t.lStart, lEnd = typing ? LTYPE : t.lEnd, hEnd = t.holdEnd ?? t.hold!;
      if (s < OUT) {   // pulled out from behind the back: hidden part first, then in front of the body
        const u = s / OUT;
        if (u < 0.5) tool(t, mix(t.behind!, t.out!, ez(u / 0.5)), true, props);
        else {
          const e = ez((u - 0.5) / 0.5);
          tool(t, mix(t.out!, t.hold!, e), false, props);
          if (lUse) { lp = mix(LREST, lUse, e); if (typing) ls = 1 + (LS - 1) * e; }
        }
      } else if (s < OUT + t.use!) {
        const a = useAnim(t, s - OUT);
        tool(t, a.pose, false, props);
        if (typing) ls = LS;
        if (a.lp) lp = a.lp;
      } else if (s < OUT + t.use! + IN) {   // and put away again the same way
        const u = (s - OUT - t.use!) / IN;
        if (u < 0.5) {
          const e = ez(u / 0.5);
          tool(t, mix(hEnd, t.out!, e), false, props);
          if (lEnd) { lp = mix(lEnd, LREST, e); if (typing) ls = LS + (1 - LS) * e; }
        } else tool(t, mix(t.out!, t.behind!, ez((u - 0.5) / 0.5)), true, props);
      }   // else: a beat with empty hands, reaching for the next tool
      props.handL = place([lp[0], lp[1], 0, ls], false);
    }
    if (i >= n)
      frames.push({
        props,
        look,
        glance: glanceFrom === null ? [0, 0] : glance(now - glanceFrom),
        eyesSy: eyesSy * (blinkFrom === null ? 1 : smilBlink(now - blinkFrom)),   // the template's blinks scale the eyes on top
        tongue: { opacity: browsOp, scale: tongueS },
        smile: smileOp,
        paint: { prog: paintOp > 0 ? prog : 0, opacity: paintOp },
      });
  }
  return frames;
}

/** [x, y] turned by `deg` (an SVG rotate), spread as the local translate of place() */
function rotated(deg: number, x: number, y: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [Math.cos(a) * x - Math.sin(a) * y, Math.sin(a) * x + Math.cos(a) * y];
}

// ---- from frames to tracks ----
const D = Math.round(CYCLE * 1000);
const r2 = (v: number) => Math.round(v * 100) / 100;

/**
 * Linear keys from samples (one every STEP ms), leaving out those a straight line between their neighbours gives.
 * A jump between two samples far faster than anything moves (the typewriter's carriage going back to the start of a
 * line, a prop reappearing elsewhere) becomes a clean step halfway between them (two keys at the same time) rather
 * than a slide through the middle.
 */
const JUMP = 300;   // in tolerances per sample: 6 units, 60 degrees (the fastest real moves are about half that)
function keys<V extends number | Vec>(values: V[], tol: number): Key<V>[] {
  const dist = (a: V, b: V) => (typeof a === "number" ? Math.abs(a - (b as number)) : Math.max(Math.abs(a[0] - (b as Vec)[0]), Math.abs(a[1] - (b as Vec)[1])));
  const lerpV = (a: V, b: V, u: number) => (typeof a === "number" ? a + ((b as number) - a) * u : [a[0] + ((b as Vec)[0] - a[0]) * u, a[1] + ((b as Vec)[1] - a[1]) * u]) as V;
  const round = (v: V) => (typeof v === "number" ? r2(v) : [r2(v[0]), r2(v[1])]) as V;
  const out: Key<V>[] = [[0, round(values[0]), "linear"]];
  let a = 0;   // the sample of the last key
  for (let j = 1; j < values.length; j++) {
    if (dist(values[j - 1], values[j]) > JUMP * tol) {
      if (a < j - 1) out.push([(j - 1) * STEP, round(values[j - 1]), "linear"]);
      out.push([(j - 0.5) * STEP, round(values[j - 1]), "linear"], [(j - 0.5) * STEP, round(values[j]), "linear"]);
      a = j;
      continue;
    }
    // can the line from a to j stand for every sample between them? (a key at least every 60 samples keeps this quick)
    let ok = j - a <= 60;
    for (let m = a + 1; ok && m < j; m++) if (dist(lerpV(values[a], values[j], (m - a) / (j - a)), values[m]) > tol) ok = false;
    if (!ok) {
      a = j - 1;
      out.push([a * STEP, round(values[a]), "linear"]);
    }
  }
  if (a < values.length - 1) out.push([Math.min(D, (values.length - 1) * STEP), round(values[values.length - 1]), "linear"]);
  return out;
}
/** [from, to) spans of the samples where `on` holds */
function spans(on: boolean[]): Span[] {
  const out: Span[] = [];
  let from = -1;
  on.forEach((v, i) => {
    if (v && from < 0) from = i;
    if (!v && from >= 0) { out.push([from * STEP, i * STEP]); from = -1; }
  });
  if (from >= 0) out.push([from * STEP, D]);
  return out;
}
/** a series where the samples a prop is hidden for hold its last shown value (so they cost no keys) */
function held<V>(values: (V | undefined)[], fallback: V): V[] {
  const first = values.find((v) => v !== undefined) ?? fallback;
  let last = first;
  return values.map((v) => (v === undefined ? last : (last = v)));
}
/** rotations without the jumps of a full turn between samples (the brush flips round through 384 = 24 degrees) */
function unwrap(values: number[]): number[] {
  const out: number[] = [];
  values.forEach((v, i) => {
    if (i > 0) while (v - out[i - 1] > 180) v -= 360;
    if (i > 0) while (v - out[i - 1] < -180) v += 360;
    out.push(v);
  });
  return out;
}

/**
 * The props in the original's layering, back to front. Behind the body: the painted line (it is on the svg itself,
 * under everything), then whatever is tucked away. In front: the faces (they are part of the agent's face), the
 * arrow (under the hand that grips it), the free hand (under the tools in front), the empty right hand, then each
 * tool with its own hand drawn as the original does (on top of the brush, the shapes and the photo; under the eraser
 * and the typewriter).
 */
export const PROP_ORDER = [
  ...Array.from({ length: PAINT_FRAMES }, (_, k) => `paint${k + 1}`),
  ...Array.from({ length: EYE_FRAMES }, (_, k) => `eyes${k + 1}`),
  "smile", "tongue",
  "arrow", "handL", "handR",
  "brush", "brushHand",
  "eraserHand", "eraser",
  "shape0", "shape1", "shape2", "juggleHand",
  "typerHand", "typerBase", "typerCarriage",
  "photo",
] as const;

// the template breathes (1.02 0.98 and back, every 3.4 s, about the feet), and the tools and hands breathe with it;
// 8 breaths of 3.28 s fit the loop
const BREATHS = 8, BREATH: Vec = [1.02, 0.98], FEET = SHAPES.squircle.feet;
const breathKeys = <V>(rest: V, full: V): Key<V>[] => Array.from({ length: 2 * BREATHS + 1 }, (_, k) => [Math.round((k * D) / (2 * BREATHS)), k % 2 ? full : rest] as Key<V>);
/**
 * The painted line lies on the original's svg itself, so it does not breathe. Here it is inside the body, so it moves
 * against the breathing: this offset puts the middle of the line back where it was (its ends are off by 0.2 at most).
 */
const PAINT_MID = strokeAt(0.5);
const PAINT_STILL: Vec = [0, 1].map((i) => r2(FEET[i] + (PAINT_MID[i] - FEET[i]) / BREATH[i] - PAINT_MID[i])) as unknown as Vec;

function build(): AgentAnimation {
  const frames = simulate();
  const props: Record<string, PropTrack> = {};
  const eyesQ = frames.map((f) => Math.round(f.eyesSy * EYE_STEPS));   // which eye frame shows (EYE_STEPS: the rig's own eyes)
  const faceAt = (f: Frame): Vec => [f.look[0] + f.glance[0], f.look[1] + f.glance[1]];
  for (const name of PROP_ORDER) {
    let shown: boolean[], at: (Vec | undefined)[], p: PropTrack;
    if (name.startsWith("paint")) {
      const k = Number(name.slice(5));
      shown = frames.map((f) => f.paint.opacity > 0.001 && Math.max(1, Math.round(f.paint.prog * PAINT_FRAMES)) === k && f.paint.prog > 0);
      // it lies under everything, behind the body (only the tools tucked away behind the back are drawn over it)
      p = { attach: "world", offset: breathKeys<Vec>([0, 0], PAINT_STILL), visible: spans(shown), behind: [[0, D]] };
      if (k === PAINT_FRAMES) p = { ...p, opacity: keys(held(frames.map((f, i) => (shown[i] ? f.paint.opacity : undefined)), 1), 0.005) };
    } else if (name.startsWith("eyes")) {
      const k = Number(name.slice(4));
      shown = eyesQ.map((q) => q === k);
      at = frames.map((f, i) => (shown[i] ? faceAt(f) : undefined));
      p = { attach: "world", offset: keys(held(at, [0, 0] as Vec), 0.02), visible: spans(shown) };
    } else if (name === "smile") {
      shown = frames.map((f) => f.smile > 0.001);
      p = {
        attach: "world",
        offset: keys(held(frames.map((f, i) => (shown[i] ? f.look : undefined)), [0, 0] as Vec), 0.02),
        opacity: keys(held(frames.map((f, i) => (shown[i] ? f.smile : undefined)), 0), 0.005),
        visible: spans(shown),
      };
    } else if (name === "tongue") {
      shown = frames.map((f) => f.tongue.opacity > 0.001);
      p = {
        attach: "world",
        offset: keys(held(frames.map((f, i) => (shown[i] ? ([36.2 + f.look[0], 41.2 + f.look[1]] as Vec) : undefined)), [36.2, 41.2] as Vec), 0.02),
        rotate: [[0, 52]],
        scale: keys(held(frames.map((f, i) => (shown[i] ? f.tongue.scale : undefined)), 1), 0.003),
        opacity: keys(held(frames.map((f, i) => (shown[i] ? f.tongue.opacity : undefined)), 0), 0.005),
        visible: spans(shown),
      };
    } else {
      const placed = frames.map((f) => f.props[name]);
      shown = placed.map((q) => !!q);
      p = {
        attach: "world",
        offset: keys(held(placed.map((q) => q?.at), [32, 32] as Vec), 0.02),
        rotate: keys(unwrap(held(placed.map((q) => q?.rot), 0)), 0.2),
        scale: keys(held(placed.map((q) => q?.scale), 1), 0.002),
        behind: spans(placed.map((q) => !!q?.behind)),
      };
      if (!shown.every(Boolean)) p.visible = spans(shown);
    }
    props[name] = p;
  }
  return {
    duration: D,
    rest: 350,   // the rest turn: the right hand just out, the eyes still ahead
    body: { squash: breathKeys<Vec>([1, 1], BREATH) },
    eyes: {
      look: keys(frames.map(faceAt), 0.02),
      // the squashed-eye frames (or none, when shut for the smile) stand in while the eyes are narrowed, closed or
      // blinking: the original's blinks (150 to 300 ms, down to 0.08) are slower than the rig's own quick blink
      hidden: spans(eyesQ.map((q) => q < EYE_STEPS)),
    },
    // the original's own hands are props (see above); the rig's wait out of sight behind the body
    hands: { L: { path: [[0, [26, 34]]], behind: [[0, D]] }, R: { path: [[0, [38, 34]]], behind: [[0, D]] } },
    props,
    events: TURNS.map((t, k) => [Math.round(START[k] * 1000), `tool:${t.tool}`] as const),
  };
}

export const toolCycle: AgentAnimation = build();
