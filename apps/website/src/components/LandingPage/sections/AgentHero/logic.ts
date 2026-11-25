/**
 * The agentic hero's pure helpers (no DOM, no React), so tests/landing-agent-hero.spec.ts can import them: what a
 * chat message asks for, where the board's slots are, the morph's point matching, the crew's run-off keyframes,
 * the easings and the hand-drawn "Welcome" strokes. The choreography (choreography.ts) does the DOM work.
 */

export type NoteColour = "yellow" | "green" | "pink" | "blue";
export const NOTE_COLOURS: readonly NoteColour[] = ["yellow", "green", "pink", "blue"];

/** What a chat message asks the agent to do (the design's perform()). */
export type Command =
  | { kind: "clear" }
  | { kind: "welcome" }
  | { kind: "arrow" }
  | { kind: "frame"; title: string }
  | { kind: "github" }
  | { kind: "text"; text: string }
  | { kind: "note"; text: string; colour?: NoteColour };

/** A very small "understanding" of free-text commands, in the design's order of precedence. */
export function parseCommand(cmd: string): Command {
  const t = cmd.toLowerCase();
  const colour = NOTE_COLOURS.find((c) => t.includes(c));
  if (/\b(clear|reset|erase|remove all)\b/.test(t)) return { kind: "clear" };
  if (/\b(path|hand-?drawn|handwrit|sketch|welcome)\b/.test(t) || /\bhi\b/.test(t)) return { kind: "welcome" };
  if (/\b(arrow|connect|link)\b/.test(t)) return { kind: "arrow" };
  if (/\b(frame|box|rectangle|card|section)\b/.test(t) && !/\b(github|star|share)\b/.test(t)) {
    const m = cmd.match(/(?:called|named|titled|:)\s*(.+)$/i);
    return { kind: "frame", title: m ? m[1].trim() : "New frame" };
  }
  if (/\b(github|star|share)\b/.test(t)) return { kind: "github" };
  if (/\btext\b/.test(t)) {
    const q = cmd.match(/["“]([^"”]+)["”]/);
    const m = cmd.match(/(?:saying|says?|:)\s*(.+)$/i);
    const text = q ? q[1] : m ? m[1].trim().replace(/^["“]|["”]$/g, "") : "Text";
    return { kind: "text", text };
  }
  const m = cmd.match(/(?:saying|says?|:)\s*(.+)$/i);
  return { kind: "note", text: m ? m[1].trim() : cmd.trim(), colour };
}

/** A short sentence for the live region: what the agent did. */
export function describeCommand(c: Command): string {
  switch (c.kind) {
    case "clear":
      return "The agent cleared the canvas.";
    case "welcome":
      return "The agent drew “Welcome” by hand.";
    case "arrow":
      return "The agent connected the last two objects with an arrow.";
    case "frame":
      return `The agent added a frame called “${c.title}”.`;
    case "github":
      return "The agent generated a card to star or share Upmade on GitHub.";
    case "text":
      return `The agent typed “${c.text}”.`;
    case "note":
      return `The agent added a ${c.colour ?? "yellow"} note: “${c.text}”.`;
  }
}

// ---- board slots ----

export type FreeSlot = "hi" | "n1" | "n2" | "frame" | "n3" | "n4";
export const FREE_SLOTS: readonly FreeSlot[] = ["hi", "n1", "n2", "frame", "n3", "n4"];
/** "title" (Welcome) is centred in the space the copy frees; "caption" sits below it and "card" below that */
export type StackSlot = "title" | "caption" | "card";
export const STACK_SLOTS: readonly StackSlot[] = ["title", "caption", "card"];
export type Slot = FreeSlot | StackSlot;

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface Point {
  x: number;
  y: number;
}

/** below this hero width the objects gather around the agent, smaller (the design's compact() and its ≤1099px rules) */
export const COMPACT_BELOW = 1100;
/** the compact objects' width (notes and frames) */
export const COMPACT_W = 112;

/** Where a free slot sits: beside the copy on wide screens, around the agent on narrow ones (heroWidth, agent box). */
export function slotPos(slot: FreeSlot, heroWidth: number, a: Box): Point {
  const W = heroWidth;
  if (W >= COMPACT_BELOW) {
    const L = Math.max(16, W * 0.07);
    const R = W - Math.max(16, W * 0.07);
    const wide: Record<FreeSlot, Point> = {
      hi: { x: L + 10, y: a.y - 150 },
      n1: { x: L, y: a.y - 190 },
      n2: { x: L + 20, y: a.y + 70 },
      frame: { x: R - 230, y: a.y - 170 },
      n3: { x: R - 200, y: a.y + 90 },
      n4: { x: L + 30, y: a.y - 40 },
    };
    return wide[slot];
  }
  const gap = 12;
  const w = COMPACT_W;
  const narrow: Record<FreeSlot, Point> = {
    hi: { x: Math.max(8, a.x - gap - w - 4), y: a.y - 26 },
    n1: { x: Math.max(8, a.x - gap - w), y: a.y - 34 },
    n2: { x: Math.max(8, a.x - gap - w + 6), y: a.y + a.h - 44 },
    frame: { x: Math.min(W - w - 8, a.x + a.w + gap), y: a.y + 4 },
    n3: { x: Math.min(W - w - 8, a.x + a.w + gap + 4), y: a.y + a.h - 6 },
    n4: { x: Math.max(8, a.x - gap - w), y: a.y + a.h + 40 },
  };
  return narrow[slot];
}

/** The first free slot, or null when all six are taken (the oldest object then makes room). */
export function firstFreeSlot(used: readonly Slot[]): FreeSlot | null {
  return FREE_SLOTS.find((s) => !used.includes(s)) ?? null;
}

export function stackGap(slot: StackSlot, compact: boolean): number {
  return slot === "caption" ? (compact ? 18 : 26) : compact ? 22 : 30;
}

/** The selection's box around several boxes, with padding. */
export function unionBox(boxes: readonly Box[], pad: number): Box {
  const x = Math.min(...boxes.map((r) => r.x)) - pad;
  const y = Math.min(...boxes.map((r) => r.y)) - pad;
  return {
    x,
    y,
    w: Math.max(...boxes.map((r) => r.x + r.w)) + pad - x,
    h: Math.max(...boxes.map((r) => r.y + r.h)) + pad - y,
  };
}

/** The curved link between two objects' boxes (the design's drawLink): the path and its arrowhead. */
export function linkPaths(a: Box, b: Box): { d: string; head: string } {
  const A = { x: a.x + a.w / 2, top: a.y, bottom: a.y + a.h, y: a.y + a.h / 2 };
  const B = { x: b.x + b.w / 2, top: b.y, bottom: b.y + b.h, y: b.y + b.h / 2 };
  const down = B.y > A.y;
  const y1 = down ? A.bottom + 6 : A.top - 6;
  const y2 = down ? B.top - 8 : B.bottom + 8;
  const mx = (A.x + B.x) / 2 - 30;
  const s = down ? -1 : 1;
  return {
    d: `M${A.x} ${y1} Q${mx} ${(y1 + y2) / 2} ${B.x} ${y2}`,
    head: `M${B.x - 6} ${y2 + 7 * s} L${B.x} ${y2} L${B.x + 6} ${y2 + 7 * s}`,
  };
}

// ---- easings ----

export const ease = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** fast start, soft landing */
export const snap = (t: number): number => 1 - Math.pow(1 - t, 4);
/** the arrow swells once and settles */
export const pop = (t: number): number => (t < 0.55 ? 1 : 1 + 0.32 * Math.sin((Math.PI * (t - 0.55)) / 0.45));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

// ---- the morph: the agent's outline becomes the cursor's arrowhead ----

export type Vec = [number, number];

/** the arrowhead polygon in its 24×24 viewBox, tip first, clockwise on screen */
export const ARROW: readonly Vec[] = [
  [3, 2],
  [21, 10.6],
  [13.1, 13.4],
  [10.5, 21],
];

/** twice the signed area: positive when the loop runs clockwise on screen (y down) */
export function signedArea2(ring: readonly Vec[]): number {
  let s = 0;
  for (let k = 0; k < ring.length; k++) {
    const [x0, y0] = ring[k];
    const [x1, y1] = ring[(k + 1) % ring.length];
    s += x0 * y1 - x1 * y0;
  }
  return s;
}

const nearest = (ring: readonly Vec[], [x, y]: Vec): number =>
  ring.reduce((b, p, k) => (Math.hypot(p[0] - x, p[1] - y) < Math.hypot(ring[b][0] - x, ring[b][1] - y) ? k : b), 0);

/**
 * Prepares the sampled outline for the morph: clockwise on screen, starting at the point nearest the outline's
 * top-left corner (it travels to the arrow's tip), so corners land on corners. Returns the ring and, for the four
 * arrow edges, the index ranges [cn[c], cn[c+1]) of the ring points that travel along each edge.
 */
export function matchRing(raw: readonly Vec[]): { ring: Vec[]; cn: number[] } {
  const N = raw.length;
  const pts = signedArea2(raw) < 0 ? [...raw].reverse() : [...raw];
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const off = nearest(pts, [x0, y0]);
  const ring = pts.slice(off).concat(pts.slice(0, off));
  let cn = [0, ...([[x1, y0], [x1, y1], [x0, y1]] as Vec[]).map((c) => nearest(ring, c)), N];
  // a shape whose corners do not come in order (or collapse) is split into four equal runs instead
  if (!cn.every((v, k) => k === 0 || v > cn[k - 1])) cn = [0, N / 4, N / 2, (3 * N) / 4, N].map(Math.round);
  return { ring, cn };
}

/** The point on the arrow (viewBox units) each ring point travels to, from matchRing's corner indices. */
export function arrowTargets(cn: readonly number[], arrow: readonly Vec[] = ARROW): Vec[] {
  const to: Vec[] = [];
  for (let c = 0; c < 4; c++) {
    const A = arrow[c];
    const B = arrow[(c + 1) % 4];
    for (let k = cn[c]; k < cn[c + 1]; k++) {
      const t = (k - cn[c]) / (cn[c + 1] - cn[c]);
      to.push([lerp(A[0], B[0], t), lerp(A[1], B[1], t)]);
    }
  }
  return to;
}

// ---- the crew running off ----

export interface Runner {
  /** -1 runs left, 1 right */
  dx: number;
  dy: number;
  hops: number;
  lean: number;
  delay: number;
}

/** back left, friend left, friend right, back right (the design's RUNNERS) */
export const RUNNERS: readonly Runner[] = [
  { dx: -1, dy: 0, hops: 5, lean: -14, delay: 0 },
  { dx: -1, dy: 0, hops: 3, lean: -10, delay: 110 },
  { dx: 1, dy: 0, hops: 4, lean: 12, delay: 50 },
  { dx: 1, dy: 0, hops: 5, lean: 14, delay: 150 },
];

/**
 * The keyframes of one crew member scampering off: it crouches and leans back, then runs off in little hops,
 * speeding up and fading as it leaves. `heroWidth` sets the distance, `width` the hop height.
 */
export function runFrames(r: Runner, heroWidth: number, width: number): { transform: string; opacity: number }[] {
  const dist = heroWidth * 0.62;
  const N = 36;
  const crouch = 0.16;
  const hopH = Math.min(46, width * 0.32);
  const f: { transform: string; opacity: number }[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    let x = 0;
    let y = 0;
    let sx = 1;
    let sy = 1;
    let rot = 0;
    let op = 1;
    if (t <= crouch) {
      const c = Math.sin(((Math.PI * t) / crouch) * 0.5);
      sx = 1 + 0.08 * c;
      sy = 1 - 0.12 * c;
      rot = r.lean * 0.4 * c;
      x = -r.dx * 4 * c;
    } else {
      const u = (t - crouch) / (1 - crouch);
      const p = Math.pow(u, 1.55);
      x = r.dx * dist * p;
      y = r.dy * dist * p - hopH * Math.abs(Math.sin(Math.PI * r.hops * u)) * (1 - 0.4 * u);
      const air = Math.abs(Math.cos(Math.PI * r.hops * u));
      sx = 1 - 0.06 * air * (1 - u) + 0.03;
      sy = 1 + 0.08 * (1 - air) * (1 - u) - 0.03;
      rot = r.lean * Math.min(1, u * 4);
      op = u < 0.62 ? 1 : 1 - (u - 0.62) / 0.38;
    }
    f.push({
      transform: `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${rot.toFixed(1)}deg) scale(${sx.toFixed(3)},${sy.toFixed(3)})`,
      opacity: +op.toFixed(3),
    });
  }
  return f;
}

// ---- the hand-drawn "Welcome" (the lettering the Upmade app draws for a new user) ----

export const WELCOME_VIEWBOX = "18 29 253 72";
/** both strokes are revealed in writing order over this long, split by length */
export const WELCOME_MS = 1850;
export const WELCOME_STROKES: readonly string[] = [
  "M 20,34 C 21,30 25.5,29.9 26,35 C 28.1,55.9 24,98 30,98 C 36,98 45,72 52,54 C 51,74 52,98 58,98 C 66,98 77,62 83,34",
  "M 83,88 C 95,86 103.5,79.1 102,73 C 100.5,67.1 89.2,69.8 86,83 C 83.4,93.9 90,99.2 98,98 C 104,97.1 110.5,93.4 114,88 C 122.4,74.8 128.1,52 130,37 C 131,29 126.8,29 125,37 C 120.6,55.9 116.8,88.6 121,96 C 124.2,101.6 131.6,97.6 136,92 C 143.2,82.8 149,72.5 157,72 C 160,71.8 161,75 159,77 C 156,72 145.8,74.2 143,86 C 140.6,96.2 147.9,99.8 154,98 C 158,96.8 162.8,93.6 165,90 C 170.4,81 174,72 181,72 C 188,72 189.7,82.3 185,92 C 181.5,99.3 172,100 171,92 C 170,84 177,73 185,73 C 189,73 193,73 197,72 C 197,80 196,92 194,98 C 199,82 204,72 210,72 C 215,72 215,82 211,98 C 216,82 221,72 227,72 C 232,72 232.4,84.1 229,94 C 227.2,99.1 230.8,99.7 235,97 C 243.6,91.4 256,86 256,77 C 256,70 244,69.7 241,82 C 238.1,93.8 245,99.2 253,98 C 259,97.1 265,94 269,90",
];

/** Splits the drawing time between strokes by their lengths. */
export function strokeDurations(lengths: readonly number[], total = WELCOME_MS): number[] {
  const sum = lengths.reduce((n, l) => n + l, 0) || 1;
  return lengths.map((l) => (total * l) / sum);
}

/** Escapes text for innerHTML. */
export const esc = (t: string): string => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
