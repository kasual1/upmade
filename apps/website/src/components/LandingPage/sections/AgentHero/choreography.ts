/**
 * The agentic hero's choreography (the design's hero script, L671-1042), imperative: it runs on the DOM the
 * component rendered, through refs, with no React state per frame. `startAgentHero(els, opts)` wires the chat box,
 * plays the scripted demo and returns a cleanup that stops every timer, frame loop and listener.
 *
 * - The chat: a blinking blue caret and ellipses (long text), the demo prompts typed into the box one after the
 *   other and run when sent (Enter or the button), free-text commands (logic.ts parseCommand), and a restart.
 * - The board (a layer over the hero): the agent's cursor flies out and places notes, frames, arrows, the
 *   hand-drawn "Welcome", typed text and a working GitHub card; objects can be dragged by pointer or arrow keys.
 * - The center agent morphs into the cursor (its [data-part="outline"] is resampled onto the arrowhead), the crew
 *   scatters and the title and subtitle clear; "clear" brings everything back.
 * - Reduced motion (read at each step): no morph, scatter or arcs; results are placed directly.
 */
import {
  ARROW,
  COMPACT_BELOW,
  RUNNERS,
  STACK_SLOTS,
  WELCOME_STROKES,
  WELCOME_VIEWBOX,
  arrowTargets,
  describeCommand,
  ease,
  esc,
  firstFreeSlot,
  lerp,
  linkPaths,
  matchRing,
  parseCommand,
  pop,
  runFrames,
  slotPos,
  snap,
  stackGap,
  strokeDurations,
  unionBox,
  type Box,
  type Command,
  type FreeSlot,
  type NoteColour,
  type Slot,
  type StackSlot,
  type Vec,
} from "./logic";

export interface AgentHeroEls {
  hero: HTMLElement;
  copy: HTMLElement;
  title: HTMLElement;
  subtitle: HTMLElement;
  /** the center agent's wrapper (it holds the AgentSlot) */
  center: HTMLElement;
  /** back left, friend left, friend right, back right */
  runners: HTMLElement[];
  form: HTMLFormElement;
  input: HTMLInputElement;
  send: HTMLButtonElement;
  caret: HTMLElement;
  ellLeft: HTMLElement;
  ellRight: HTMLElement;
  board: HTMLElement;
  /** where board objects go (inside the board, no React children) */
  layer: HTMLElement;
  links: SVGSVGElement;
  cursor: HTMLElement;
  arrow: SVGSVGElement;
  arrowPath: SVGPathElement;
  who: HTMLElement;
  status: HTMLElement;
}

export interface AgentHeroOptions {
  agentName: string;
  demo: readonly string[];
  repoUrl: string;
  repoSlug: string;
  shareUrl: string;
  /** the CSS module's class names */
  cls: Readonly<Record<string, string>>;
}

interface Obj {
  el: HTMLElement;
  slot: Slot;
  kind: string;
  dx: number;
  dy: number;
}
interface Link {
  path: SVGPathElement;
  head: SVGPathElement;
  from: Obj;
  to: Obj;
}

const NS = "http://www.w3.org/2000/svg";
const NOTE_BG: Record<NoteColour, string> = {
  yellow: "var(--lp-yellow)",
  green: "var(--lp-green)",
  pink: "var(--lp-pink)",
  blue: "var(--lp-blue)",
};

const GH_MARK =
  "M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.7 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z";

export function startAgentHero(els: AgentHeroEls, opts: AgentHeroOptions): () => void {
  const { hero, copy, center, form, input, send, cursor, who, layer } = els;
  const c = opts.cls;
  const reduce = () => !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  let alive = true;
  const cleanups: (() => void)[] = [];
  const on = <K extends keyof HTMLElementEventMap>(
    el: HTMLElement | Window,
    type: K,
    fn: (e: HTMLElementEventMap[K]) => void,
    o?: AddEventListenerOptions,
  ) => {
    el.addEventListener(type, fn as EventListener, o);
    cleanups.push(() => el.removeEventListener(type, fn as EventListener, o));
  };

  // ---- time: FF (fast-forward) resolves waits at once and makes frame loops jump to their end ----
  let FF = false;
  const pendingWaits = new Set<() => void>();
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number) => {
    const t = window.setTimeout(() => {
      timers.delete(t);
      if (alive) fn();
    }, ms);
    timers.add(t);
  };
  const sleep = (ms: number): Promise<void> =>
    !alive
      ? new Promise<void>(() => {})
      : FF || ms <= 0
        ? Promise.resolve()
        : new Promise<void>((r) => {
            const done = () => {
              window.clearTimeout(t);
              timers.delete(t);
              pendingWaits.delete(done);
              if (alive) r();
            };
            const t = window.setTimeout(done, ms);
            timers.add(t);
            pendingWaits.add(done);
          });
  async function fastForward(p: Promise<unknown>) {
    FF = true;
    [...pendingWaits].forEach((d) => d());
    try {
      await p;
    } catch {
      /* the step's own failure does not stop the next one */
    } finally {
      FF = false;
    }
  }
  /** runs fn(t) on each frame for `ms` (t from 0 to 1); resolves at the end (never, once disposed) */
  const frames = (ms: number, fn: (t: number) => void, stop?: () => boolean): Promise<void> =>
    new Promise((done) => {
      const t0 = performance.now();
      const step = (now: number) => {
        if (!alive) return;
        if (stop?.()) return done();
        const t = FF ? 1 : Math.min(1, (now - t0) / ms);
        fn(t);
        if (t < 1) requestAnimationFrame(step);
        else done();
      };
      step(t0);
    });

  // ---- geometry ----
  const rel = (el: Element): Box => {
    const h = hero.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - h.left, y: r.top - h.top, w: r.width, h: r.height };
  };
  /** an element's layout offset inside an ancestor (transforms do not count) */
  const offsetIn = (el: HTMLElement, anc: HTMLElement) => {
    let x = 0;
    let y = 0;
    let n: HTMLElement | null = el;
    while (n && n !== anc) {
      x += n.offsetLeft;
      y += n.offsetTop;
      n = n.offsetParent as HTMLElement | null;
    }
    return { x, y };
  };
  const copyBox = () => {
    const o = offsetIn(copy, hero);
    return { x: o.x, y: o.y };
  };
  const agentBox = (): Box => {
    const o = offsetIn(center, hero);
    return { x: o.x, y: o.y, w: center.offsetWidth, h: center.offsetHeight };
  };
  const compact = () => hero.clientWidth < COMPACT_BELOW;

  // ---- live region ----
  const announce = (text: string) => {
    els.status.textContent = "";
    later(() => (els.status.textContent = text), 60);
  };

  // ---- the chat box: a blinking blue caret at the end of the text, ellipses where it runs past the box ----
  const measure = document.createElement("canvas").getContext("2d");
  let caretSolid = 0;
  function updateEll() {
    const i = input;
    els.ellLeft.style.left = `${i.offsetLeft}px`;
    els.ellRight.style.left = `${i.offsetLeft + i.clientWidth}px`;
    els.ellLeft.classList.toggle(c.ellOn, i.scrollLeft > 1);
    els.ellRight.classList.toggle(c.ellOn, i.scrollLeft + i.clientWidth < i.scrollWidth - 1);
  }
  function updateCaret() {
    if (!alive) return;
    if (measure) measure.font = getComputedStyle(input).font;
    input.scrollLeft = input.scrollWidth; // keep the end of a long prompt in view
    const w = measure ? measure.measureText(input.value).width : 0;
    els.caret.style.left = `${input.offsetLeft + Math.min(w - input.scrollLeft, input.clientWidth) + 1}px`;
    els.caret.classList.add(c.solid);
    window.clearTimeout(caretSolid);
    caretSolid = window.setTimeout(() => els.caret.classList.remove(c.solid), 450);
    updateEll();
  }
  cleanups.push(() => window.clearTimeout(caretSolid));
  const setValue = (v: string) => {
    input.value = v;
    updateCaret();
  };
  for (const ev of ["scroll", "keyup", "click", "select", "focus"] as const)
    on(input, ev, () => requestAnimationFrame(() => alive && updateEll()));
  on(input, "input", updateCaret);
  on(input, "focus", () => form.classList.add(c.inputFocus));
  on(input, "blur", () => {
    form.classList.remove(c.inputFocus);
    updateCaret();
  });
  document.fonts?.ready.then(() => updateCaret());

  // ---- the board ----
  const objects: Obj[] = [];
  const links: Link[] = [];
  let agentInCursor = false;
  let morphRun = 0;

  function place(o: Obj) {
    let p: { x: number; y: number };
    const k = STACK_SLOTS.indexOf(o.slot as StackSlot);
    if (k === 0) {
      const cb = copyBox();
      const t = offsetIn(els.title, copy);
      const s = offsetIn(els.subtitle, copy);
      const a = agentBox();
      const bottom = agentInCursor ? a.y + a.h : cb.y + s.y + els.subtitle.offsetHeight;
      const cy = (cb.y + t.y + bottom) / 2;
      p = { x: hero.clientWidth / 2 - o.el.offsetWidth / 2, y: cy - o.el.offsetHeight / 2 };
    } else if (k > 0) {
      const prev = STACK_SLOTS.slice(0, k)
        .reverse()
        .map((sl) => objects.find((x) => x.slot === sl))
        .find(Boolean);
      const top = prev
        ? parseFloat(prev.el.style.top) + prev.el.offsetHeight + stackGap(o.slot as StackSlot, compact())
        : copyBox().y + offsetIn(els.title, copy).y;
      p = { x: hero.clientWidth / 2 - o.el.offsetWidth / 2, y: top };
    } else p = slotPos(o.slot as FreeSlot, hero.clientWidth, agentBox());
    // keep it on the hero horizontally, so it can't cause overflow
    const x = Math.max(4 - o.dx, Math.min(p.x, hero.clientWidth - o.el.offsetWidth - 4 - o.dx));
    o.el.style.left = `${x + o.dx}px`;
    o.el.style.top = `${p.y + o.dy}px`;
  }
  const placeStack = () =>
    STACK_SLOTS.forEach((sl) => {
      const x = objects.find((o) => o.slot === sl);
      if (x) place(x);
    });
  function drawLink(l: Link) {
    const { d, head } = linkPaths(rel(l.from.el), rel(l.to.el));
    l.path.setAttribute("d", d);
    l.head.setAttribute("d", head);
  }
  const relayout = () => {
    objects.forEach(place);
    links.forEach(drawLink);
  };
  on(window, "resize", () => {
    relayout();
    updateCaret();
  });

  function makeDraggable(o: Obj) {
    const el = o.el;
    let d: { id: number; x: number; y: number; dx: number; dy: number } | null = null;
    el.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || (e.target as Element).closest("a,button")) return;
      e.preventDefault();
      el.focus({ preventScroll: true });
      d = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: o.dx, dy: o.dy };
      el.setPointerCapture(e.pointerId);
      el.dataset.dragging = "";
    });
    el.addEventListener("pointermove", (e) => {
      if (!d || d.id !== e.pointerId) return;
      o.dx = d.dx + e.clientX - d.x;
      o.dy = d.dy + e.clientY - d.y;
      place(o);
      links.forEach(drawLink);
    });
    const end = () => {
      d = null;
      delete el.dataset.dragging;
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("lostpointercapture", end);
    // arrow keys move it (Shift for bigger steps), like the canvas's own objects
    el.addEventListener("keydown", (e) => {
      if (e.target !== el) return;
      const step = ({ ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] } as Record<string, number[]>)[e.key];
      if (!step) return;
      e.preventDefault();
      const s = e.shiftKey ? 20 : 5;
      o.dx += step[0] * s;
      o.dy += step[1] * s;
      place(o);
      links.forEach(drawLink);
    });
  }

  function removeObject(old: Obj) {
    old.el.remove();
    for (let i = links.length - 1; i >= 0; i--)
      if (links[i].from === old || links[i].to === old) {
        links[i].path.remove();
        links[i].head.remove();
        links.splice(i, 1);
      }
  }
  function freeSlot(): FreeSlot {
    const f = firstFreeSlot(objects.map((o) => o.slot));
    if (f) return f;
    // all taken: the oldest free-slot object makes room
    const i = objects.findIndex((o) => !STACK_SLOTS.includes(o.slot as StackSlot));
    const old = objects.splice(i, 1)[0];
    removeObject(old);
    return old.slot as FreeSlot;
  }

  function addObject(kind: string[], slot: Slot, html: string, label: string, style?: Record<string, string>) {
    const el = document.createElement("div");
    el.className = [c.bobj, ...kind].join(" ");
    el.innerHTML = html;
    el.tabIndex = 0;
    el.setAttribute("role", "group");
    el.setAttribute("aria-roledescription", "canvas object");
    el.setAttribute("aria-label", `${label} (drag, or move with the arrow keys)`);
    if (style) for (const [k, v] of Object.entries(style)) el.style.setProperty(k, v);
    layer.appendChild(el);
    const o: Obj = { el, slot, kind: kind.join(" "), dx: 0, dy: 0 };
    objects.push(o);
    place(o);
    makeDraggable(o);
    return o;
  }

  // ---- the agent's cursor ----
  const cursorTo = (x: number, y: number) => {
    cursor.style.setProperty("--cx", `${x}px`);
    cursor.style.setProperty("--cy", `${y}px`);
  };
  const curPos = () => ({
    x: parseFloat(cursor.style.getPropertyValue("--cx")) || 0,
    y: parseFloat(cursor.style.getPropertyValue("--cy")) || 0,
  });
  const isOn = () => cursor.classList.contains(c.on);
  /** jumps without the transition */
  const jump = (fn: () => void) => {
    cursor.style.transition = "none";
    fn();
    void cursor.offsetWidth;
    cursor.style.transition = "";
  };
  // the chat box is the agent's den: the cursor is masked at the box's top edge while it slips behind it
  const maskAtChat = (y: number) => {
    const top = rel(form).y - y;
    cursor.style.clipPath = `polygon(-80px -80px,calc(100% + 80px) -80px,calc(100% + 80px) ${top}px,-80px ${top}px)`;
  };
  const denSpot = () => {
    const f = rel(form);
    return { x: f.x + f.w * 0.42, y: f.y + cursor.offsetHeight + 10 };
  };
  async function arcCursor(x: number, y: number, ms: number, mask: boolean, bowK = 0.14) {
    const s0 = curPos();
    const dx = x - s0.x;
    const dy = y - s0.y;
    const dist = Math.hypot(dx, dy) || 1;
    let px = -dy / dist;
    let py = dx / dist;
    if (px < 0) {
      px = -px;
      py = -py;
    }
    const bow = bowK * dist;
    cursor.style.transition = "opacity .2s";
    await frames(ms, (t) => {
      const e = ease(t);
      const b = bow * 4 * e * (1 - e);
      const cy = s0.y + dy * e + py * b;
      cursorTo(s0.x + dx * e + px * b, cy);
      if (mask) maskAtChat(cy);
    });
    cursor.style.transition = "";
  }
  async function hideBehindChat() {
    if (reduce()) {
      cursor.classList.remove(c.on);
      return;
    }
    // right above the chat box (after typing): straight down behind it; from further out: on a gentle arc
    const d = denSpot();
    const f = rel(form);
    const p = curPos();
    const above = p.x >= f.x && p.x <= f.x + f.w && p.y < f.y;
    await arcCursor(above ? Math.min(Math.max(p.x, f.x + 24), f.x + f.w - 120) : d.x, d.y, above ? 520 : 640, true, above ? 0 : 0.14);
    jump(() => cursor.classList.remove(c.on));
    cursor.style.clipPath = "";
  }
  async function emergeFromChat(x: number, y: number) {
    const d = denSpot();
    jump(() => {
      cursorTo(d.x, d.y);
      maskAtChat(d.y);
      cursor.classList.add(c.on);
    });
    if (!reduce()) await arcCursor(x, y, 600, true);
    else cursorTo(x, y);
    cursor.style.clipPath = "";
  }
  async function fly(x: number, y: number) {
    if (agentInCursor && !isOn()) return emergeFromChat(x, y); // the agent comes back out of the chat box
    if (!isOn()) {
      const a = agentBox();
      jump(() => {
        cursorTo(a.x + a.w * 0.6, a.y + a.h * 0.5);
        cursor.classList.add(c.on);
      });
    }
    cursorTo(x, y);
    await sleep(reduce() ? 0 : 520);
  }
  async function home() {
    if (agentInCursor) {
      if (isOn()) await hideBehindChat();
      return;
    }
    if (!isOn()) return;
    const a = agentBox();
    cursorTo(a.x + a.w * 0.6, a.y + a.h * 0.5);
    await sleep(reduce() ? 0 : 600);
    cursor.classList.remove(c.on);
  }

  // ---- the center agent: hops, and morphs into the cursor's arrowhead (and back out on "clear") ----
  const outline = () => center.querySelector<SVGPathElement>('[data-part="outline"]');
  /** a hop of the agent itself (Agent.tsx hops when its body is clicked) */
  const hop = () => {
    if (reduce() || agentInCursor) return;
    center.querySelector('[data-part="body"]')?.dispatchEvent(new MouseEvent("click"));
  };
  /** the arrowhead takes the agent's own fill (its gradient), so the cursor is the agent */
  const paintArrow = () => {
    const o = outline();
    const fill = o?.getAttribute("fill");
    if (fill) els.arrowPath.setAttribute("fill", fill);
  };
  paintArrow();
  later(paintArrow, 300); // the agent may mount after this runs (AgentSlot's ready gate)

  const toHero = (el: SVGGraphicsElement, x: number, y: number): Vec => {
    const m = el.getScreenCTM();
    const h = hero.getBoundingClientRect();
    if (!m) return [0, 0];
    return [m.a * x + m.c * y + m.e - h.left, m.b * x + m.d * y + m.f - h.top];
  };
  const cursorStart = () => {
    const a = agentBox();
    return { x: a.x + a.w / 2 - 8, y: a.y + a.h / 2 - 9 };
  };

  function morphShapes() {
    const head = outline();
    if (!head) return null;
    const N = 120;
    const len = head.getTotalLength();
    const raw: Vec[] = [];
    for (let k = 0; k < N; k++) {
      const p = head.getPointAtLength((len * k) / N);
      raw.push([p.x, p.y]);
    }
    const { ring, cn } = matchRing(raw);
    const from = ring.map(([x, y]) => toHero(head, x, y));
    const to = arrowTargets(cn, ARROW).map(([x, y]) => toHero(els.arrow, x, y));
    const hm = head.getScreenCTM();
    const am = els.arrow.getScreenCTM();
    const sw0 = 3.6 * (hm ? Math.hypot(hm.a, hm.b) : 1);
    const sw1 = 1.6 * (am ? am.a : 1);
    // the eyes and their catchlights travel with the shape and close on the way
    const hr = hero.getBoundingClientRect();
    const bits = [...center.querySelectorAll<SVGGraphicsElement>('[data-part="eyes"] rect, [data-part="eyes"] circle')].map((e) => {
      const r = e.getBoundingClientRect();
      return {
        x: r.left - hr.left,
        y: r.top - hr.top,
        w: r.width,
        h: r.height,
        fill: e.getAttribute("fill") ?? "currentColor",
        round: e.tagName.toLowerCase() === "circle",
        el: null as SVGRectElement | null,
      };
    });
    const avg = (ps: Vec[]): Vec => ps.reduce<Vec>((s, p) => [s[0] + p[0] / ps.length, s[1] + p[1] / ps.length], [0, 0]);
    const c0 = avg(from);
    const c1 = avg(to);
    const k1 = sw1 / sw0;
    // travel on a gentle arc: bow to the upper side by ~16% of the distance
    const dx = c1[0] - c0[0];
    const dy = c1[1] - c0[1];
    const dist = Math.hypot(dx, dy) || 1;
    let px = -dy / dist;
    let py = dx / dist;
    if (py > 0) {
      px = -px;
      py = -py;
    }
    const bow = 0.16 * dist;
    const arc = (e: number) => 4 * e * (1 - e);
    const o = document.createElementNS(NS, "svg");
    o.setAttribute("class", c.morph);
    o.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(NS, "path");
    path.setAttribute("fill", head.getAttribute("fill") ?? "currentColor");
    path.setAttribute("stroke", head.getAttribute("stroke") ?? "currentColor");
    path.setAttribute("stroke-linejoin", "round");
    o.appendChild(path);
    const eyes = document.createElementNS(NS, "g");
    o.appendChild(eyes);
    bits.forEach((b) => {
      const e = document.createElementNS(NS, "rect");
      e.setAttribute("fill", b.fill);
      e.setAttribute("rx", String(b.round ? b.w / 2 : Math.min(b.w, b.h) / 2));
      eyes.appendChild(e);
      b.el = e;
    });
    const frame = (t: number) => {
      const e = snap(t);
      const q = pop(t);
      const ox = px * bow * arc(e);
      const oy = py * bow * arc(e);
      path.setAttribute(
        "d",
        "M" +
          from
            .map(
              (p, k) =>
                (c1[0] + (lerp(p[0], to[k][0], e) + ox - c1[0]) * q).toFixed(2) +
                " " +
                (c1[1] + (lerp(p[1], to[k][1], e) + oy - c1[1]) * q).toFixed(2),
            )
            .join("L") +
          "Z",
      );
      path.setAttribute("stroke-width", String(lerp(sw0, sw1, e) * q));
      const cx = lerp(c0[0], c1[0], e) + ox;
      const cy = lerp(c0[1], c1[1], e) + oy;
      const sc = lerp(1, k1, e);
      const close = Math.max(0, 1 - ease(Math.min(1, t / 0.3))); // the eyes shut within the first ~30%
      bits.forEach((b) => {
        const w = b.w * sc;
        const h = b.h * sc * (b.round ? close : Math.max(0.08, close));
        b.el!.setAttribute("x", String(cx + (b.x - c0[0]) * sc));
        b.el!.setAttribute("y", String(cy + (b.y + b.h / 2 - c0[1]) * sc - h / 2));
        b.el!.setAttribute("width", String(w));
        b.el!.setAttribute("height", String(h));
        b.el!.setAttribute("opacity", close < 0.08 ? "0" : "1");
      });
    };
    return { o, frame };
  }
  const playMorph = (m: NonNullable<ReturnType<typeof morphShapes>>, forward: boolean, ms: number) => {
    const run = morphRun;
    return frames(
      ms,
      (f) => m.frame(forward ? f : 1 - f),
      () => {
        if (run === morphRun) return false;
        m.o.remove();
        return true;
      },
    );
  };
  const parkCursor = (tip?: { x: number; y: number }) => {
    const p = tip ?? cursorStart();
    jump(() => cursorTo(p.x, p.y));
  };
  let leap: Animation | null = null;
  /** tip: where the arrow should end up (the first stroke of a drawing), so it travels there while it morphs */
  async function agentIntoCursor(tip?: { x: number; y: number }) {
    if (center.classList.contains(c.gone)) return;
    agentInCursor = true;
    const run = morphRun;
    paintArrow();
    if (!reduce()) {
      // kick-off: a quick, big leap to the top right; the morph takes over mid-air from the live pose
      center.querySelector('[data-part="body"]')?.dispatchEvent(new MouseEvent("click"));
      const W = center.offsetWidth;
      leap = center.animate(
        [{ transform: "none" }, { transform: `translate(${(W * 0.16).toFixed(1)}px, ${(-W * 0.3).toFixed(1)}px) rotate(8deg)` }],
        { duration: 600, easing: "cubic-bezier(.2,.7,.4,1)", fill: "forwards" },
      );
      await sleep(550);
      if (run !== morphRun) return;
    }
    parkCursor(tip);
    cursor.classList.add(c.bare);
    if (reduce()) {
      center.classList.add(c.gone);
      cursor.classList.add(c.on);
      cursor.classList.remove(c.bare);
      return;
    }
    const m = morphShapes();
    center.classList.add(c.gone);
    leap?.cancel();
    leap = null;
    if (m) {
      els.layer.appendChild(m.o);
      m.frame(0);
      await playMorph(m, true, 460);
      if (!m.o.isConnected) return;
    }
    jump(() => cursor.classList.add(c.on));
    m?.o.remove();
    cursor.classList.remove(c.bare);
    await sleep(200); // the label slides out of the arrow
  }
  async function agentOutOfCursor() {
    if (!agentInCursor) return;
    const p = cursorStart();
    cursor.classList.add(c.bare);
    if (isOn()) {
      cursorTo(p.x, p.y);
      await sleep(reduce() ? 0 : 560);
    } else await emergeFromChat(p.x, p.y);
    agentInCursor = false;
    if (reduce()) {
      cursor.classList.remove(c.on, c.bare);
      center.classList.remove(c.gone);
      return;
    }
    const m = morphShapes();
    if (m) {
      els.layer.appendChild(m.o);
      m.frame(1);
    }
    jump(() => cursor.classList.remove(c.on));
    if (m) {
      await playMorph(m, false, 460);
      if (!m.o.isConnected) return;
    }
    center.classList.remove(c.gone);
    m?.o.remove();
    cursor.classList.remove(c.bare);
  }

  // ---- the crew scatters when the agent gets to work; the title and subtitle float away ----
  function scatterCrew() {
    els.runners.forEach((el, i) => {
      const r = RUNNERS[i];
      if (!el || !r || el.dataset.ran !== undefined) return;
      el.dataset.ran = "";
      if (reduce()) {
        el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" });
        return;
      }
      el.style.transformOrigin = "50% 85%";
      el.animate(runFrames(r, hero.offsetWidth, el.offsetWidth), {
        duration: 880 + Math.random() * 260,
        delay: r.delay,
        easing: "linear",
        fill: "forwards",
      });
    });
  }
  /** the crew comes back (on "clear"): they pop back in where they stood; `instant` for the restart */
  function returnCrew(instant = false) {
    els.runners.forEach((el, i) => {
      if (el.dataset.ran === undefined) return;
      el.getAnimations().forEach((a) => a.cancel());
      delete el.dataset.ran;
      if (instant || reduce()) return;
      el.animate(
        [
          { opacity: 0, transform: "translateY(10px) scale(.85)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 420, delay: 120 + i * 60, easing: "cubic-bezier(.3,1.5,.5,1)", fill: "backwards" },
      );
    });
  }
  async function clearTitle() {
    if (copy.classList.contains(c.cleared)) return;
    copy.classList.add(c.cleared);
    scatterCrew();
    await sleep(reduce() ? 0 : 650);
  }
  function restoreTitle(instant = false) {
    copy.classList.remove(c.cleared);
    returnCrew(instant);
  }

  // ---- actions ----
  async function doNote(text: string, colour: NoteColour = "yellow", slot?: FreeSlot) {
    const s = slot ?? freeSlot();
    const p = slotPos(s, hero.clientWidth, agentBox());
    await fly(p.x + 20, p.y + 18);
    const r = (Math.random() * 6 - 3).toFixed(1);
    addObject([c.note], s, `${esc(text)}<small>added by ${esc(opts.agentName)}</small>`, `Note: ${text}`, {
      background: NOTE_BG[colour],
      "--r": `${r}deg`,
    });
  }
  async function doFrame(title: string) {
    const s = freeSlot();
    const p = slotPos(s, hero.clientWidth, agentBox());
    await fly(p.x + 24, p.y + 20);
    addObject([c.frame], s, `<b>${esc(title)}</b><i></i><i></i><i></i>`, `Frame: ${title}`);
  }
  async function doArrow() {
    const two = objects.slice(-2);
    if (two.length < 2) return doNote("Nothing to connect yet", "pink");
    const B = rel(two[1].el);
    await fly(B.x + B.w / 2, B.y + B.h / 2);
    const path = document.createElementNS(NS, "path");
    const head = document.createElementNS(NS, "path");
    els.links.append(path, head);
    const l: Link = { path, head, from: two[0], to: two[1] };
    links.push(l);
    drawLink(l);
    path.style.setProperty("--len", String(path.getTotalLength()));
    path.classList.add(c.draw);
  }
  const tipToHero = (svg: SVGSVGElement, pt: DOMPoint) => {
    const [x, y] = toHero(svg, pt.x, pt.y);
    return { x, y };
  };
  async function doWelcome(slot?: Slot, morph = false) {
    let s: Slot = slot ?? "hi";
    if (s !== "title" && objects.some((o) => o.slot === s)) s = freeSlot();
    if (s === "title" && objects.some((o) => o.slot === "title")) s = freeSlot();
    if (morph) agentInCursor = true; // lay the drawing out for the space the agent is about to free
    const o = addObject(
      s === "title" ? [c.hi, c.big] : [c.hi],
      s,
      `<svg viewBox="${WELCOME_VIEWBOX}" role="img" aria-label="Welcome"></svg>`,
      "Hand-drawn “Welcome”",
    );
    o.el.style.animation = "none";
    place(o);
    const svg = o.el.querySelector("svg")!;
    const motion = !reduce();
    const paths = WELCOME_STROKES.map((d) => {
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", d);
      svg.appendChild(p);
      const len = p.getTotalLength() || 1;
      p.style.strokeDasharray = `${len} ${len + 2}`;
      p.style.strokeDashoffset = motion ? String(len) : "0";
      return { p, len };
    });
    const ms = strokeDurations(paths.map((p) => p.len));
    const first = tipToHero(svg, paths[0].p.getPointAtLength(0));
    if (morph) {
      agentInCursor = false;
      await agentIntoCursor(first); // the agent becomes the cursor on its way to the first stroke
    }
    if (!motion) return;
    if (!morph) await fly(first.x, first.y);
    for (const [i, s2] of paths.entries()) {
      const start = tipToHero(svg, s2.p.getPointAtLength(0));
      cursorTo(start.x, start.y);
      await sleep(60);
      cursor.style.transition = "opacity .25s"; // follow the pen tip exactly while drawing
      await frames(ms[i], (f) => {
        s2.p.style.strokeDashoffset = String(s2.len * (1 - f));
        const tip = tipToHero(svg, s2.p.getPointAtLength(s2.len * f));
        cursorTo(tip.x, tip.y);
      });
      cursor.style.transition = "";
    }
  }
  async function doText(text: string, slot?: Slot) {
    const s: Slot = slot ?? (objects.some((o) => o.slot === "caption") ? freeSlot() : "caption");
    const o = addObject([c.btext], s, `<span></span><i class="${c.caret}" aria-hidden="true"></i>`, `Text: ${text}`);
    o.el.style.animation = "none";
    const span = o.el.querySelector("span")!;
    const caret = o.el.querySelector("i")!;
    // sized for the finished text, then filled letter by letter
    span.textContent = text;
    o.el.style.width = `${Math.ceil(o.el.getBoundingClientRect().width)}px`;
    span.textContent = "";
    place(o);
    const tip = (mid = false) => {
      const r = rel(caret);
      return { x: r.x + r.w + 1, y: r.y + r.h * (mid ? 0.5 : 0.62) };
    };
    if (reduce()) {
      span.textContent = text;
      o.el.classList.add(c.active, c.done);
      return;
    }
    const t0 = tip();
    await fly(t0.x, t0.y); // out of the chat box, straight to the caret
    // while typing, the pink caret is the agent: the arrow fades out and the label slides up beside the caret
    cursor.style.transition = "opacity .25s";
    cursor.classList.add(c.typing);
    o.el.classList.add(c.active);
    {
      const p = tip(true);
      cursorTo(p.x, p.y);
    }
    await sleep(160);
    for (const ch of text) {
      span.textContent += ch;
      const p = tip(true);
      cursorTo(p.x, p.y);
      await sleep(ch === " " ? 45 : 22 + Math.random() * 26);
    }
    await sleep(220);
    o.el.classList.add(c.done);
    cursor.classList.remove(c.typing);
    cursor.style.transition = "";
    await sleep(200);
  }

  // selection: a marquee around the given objects, then a pink selection box with handles
  let selEl: HTMLElement | null = null;
  const clearSelection = () => {
    selEl?.remove();
    selEl = null;
  };
  const setBox = (el: HTMLElement, b: Box) =>
    Object.assign(el.style, { left: `${b.x}px`, top: `${b.y}px`, width: `${b.w}px`, height: `${b.h}px` });
  async function dragAlong(ms: number, fn: (e: number) => void) {
    cursor.style.transition = "opacity .25s";
    await frames(ms, (t) => fn(ease(t)));
    cursor.style.transition = "";
  }
  async function selectObjects(list: Obj[]) {
    clearSelection();
    const pad = compact() ? 10 : 14;
    const u = unionBox(list.map((o) => rel(o.el)), pad + 12);
    await fly(u.x, u.y);
    const m = document.createElement("div");
    m.className = c.marquee;
    m.setAttribute("aria-hidden", "true");
    layer.appendChild(m);
    await dragAlong(400, (e) => {
      setBox(m, { x: u.x, y: u.y, w: u.w * e, h: u.h * e });
      cursorTo(u.x + u.w * e, u.y + u.h * e);
    });
    await sleep(50);
    m.remove();
    selEl = document.createElement("div");
    selEl.className = c.selection;
    selEl.setAttribute("aria-hidden", "true");
    setBox(selEl, unionBox(list.map((o) => rel(o.el)), pad));
    selEl.innerHTML = [
      [0, 0],
      [100, 0],
      [100, 100],
      [0, 100],
    ]
      .map(([x, y]) => `<i style="left:${x}%;top:${y}%"></i>`)
      .join("");
    layer.appendChild(selEl);
    await sleep(150);
  }
  on(els.board, "pointerdown", clearSelection, { capture: true }); // touching the canvas drops the selection

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Upmade", text: "Upmade, the agentic canvas development kit", url: opts.shareUrl });
        return;
      }
      await navigator.clipboard.writeText(opts.shareUrl);
      announce("Link copied.");
    } catch {
      /* cancelled, or no clipboard: the button stays as it is */
    }
  }
  function githubCard() {
    const g = c.gen;
    return (
      `<svg class="${c.ghMark} ${g}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="${GH_MARK}"/></svg>` +
      `<span class="${c.ghMeta} ${g}"><b>${esc(opts.repoSlug)}</b><small>Open source · MIT</small></span>` +
      `<span class="${c.ghActions}"><a class="${c.ghBtn} ${c.star} ${g}" href="${esc(opts.repoUrl)}" target="_blank" rel="noopener noreferrer">` +
      `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1-4.5-4.2 6.1-.8z"/></svg>Star</a>` +
      `<button type="button" class="${c.ghBtn} ${c.share} ${g}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3"/><path d="m7 8 5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg><span>Share</span></button></span>`
    );
  }
  async function doGitHubCard() {
    const title = objects.find((o) => o.slot === "title");
    const cap = objects.find((o) => o.slot === "caption");
    const inStack = !!(title && cap) && !objects.some((o) => o.slot === "card");
    const slot: Slot = inStack ? "card" : freeSlot();
    const o = addObject([c.ghcard, c.pending], slot, githubCard(), `GitHub card for ${opts.repoSlug}`);
    o.el.style.animation = "none";
    place(o); // laid out (unseen) so its size is known
    o.el.querySelector("button")?.addEventListener("click", () => void share());
    const parts = [...o.el.querySelectorAll<HTMLElement | SVGElement>(`.${c.gen}`)];
    parts.forEach((p, k) => (p.style.transitionDelay = `${k * 45}ms`));
    // while it is generated, the whole card is one grey skeleton block with a glare
    const sk = document.createElement("span");
    sk.className = c.ghSkel;
    sk.setAttribute("aria-hidden", "true");
    o.el.appendChild(sk);
    const reveal = () => {
      o.el.classList.remove(c.loading);
      parts.forEach((p) => p.classList.add(c.in));
    };
    if (reduce()) {
      if (inStack) {
        title!.dy -= (stackGap("card", compact()) + o.el.offsetHeight) / 2 + 50;
        placeStack();
      }
      o.el.classList.remove(c.pending);
      reveal();
      return;
    }
    if (inStack) {
      // 1) select Welcome and the text
      await selectObjects([title!, cap!]);
      // 2) grab the selection and move it up, making room for the card below
      const b0 = unionBox([rel(title!.el), rel(cap!.el)], compact() ? 10 : 14);
      const dy0 = title!.dy;
      const shift = -(stackGap("card", compact()) + o.el.offsetHeight) / 2 - 50;
      const gx = b0.x + b0.w * 0.5;
      const gy = b0.y + b0.h * 0.42;
      await arcCursor(gx, gy, 220, false, 0.1);
      await sleep(50);
      await dragAlong(400, (e) => {
        title!.dy = dy0 + shift * e;
        placeStack();
        if (selEl) setBox(selEl, { x: b0.x, y: b0.y + shift * e, w: b0.w, h: b0.h });
        cursorTo(gx, gy + shift * e);
      });
      await sleep(90);
      clearSelection();
      await sleep(60);
    }
    // 3) generate: a skeleton, a glare sweeps over it for 800 ms, then the real card
    const cx = parseFloat(o.el.style.left);
    const cy = parseFloat(o.el.style.top);
    await arcCursor(cx + o.el.offsetWidth, cy + o.el.offsetHeight, 420, false, 0.12); // to its bottom-right corner
    // while generating, the arrow steps aside and only the label stays, docked under the card's right edge
    {
      const wr = rel(who);
      const cr = rel(o.el);
      cursor.style.setProperty("--dock-x", `${cr.x + cr.w - wr.w - wr.x}px`);
      cursor.style.setProperty("--dock-y", `${cr.y + cr.h + 4 - wr.y}px`);
    }
    o.el.classList.remove(c.pending);
    o.el.classList.add(c.loading);
    cursor.classList.add(c.dockAnim, c.docked);
    await sleep(800);
    reveal();
    await sleep(260);
    cursor.classList.remove(c.docked);
    await sleep(560);
    cursor.classList.remove(c.dockAnim);
  }
  async function doClear() {
    restoreTitle();
    clearSelection();
    objects.splice(0).forEach((o) => o.el.remove());
    links.splice(0).forEach((l) => {
      l.path.remove();
      l.head.remove();
    });
    if (agentInCursor) await agentOutOfCursor();
  }

  /** runs a parsed command; `demo` makes "Welcome" take the title's place (the agent morphs on its way) */
  async function perform(cmd: Command, demo = false) {
    switch (cmd.kind) {
      case "clear":
        return doClear();
      case "welcome":
        if (demo && !objects.some((o) => o.slot === "title")) {
          void clearTitle(); // the title and subtitle leave...
          return doWelcome("title", !agentInCursor); // ...while the agent jumps, morphs into the cursor and draws
        }
        return doWelcome();
      case "arrow":
        return doArrow();
      case "frame":
        return doFrame(cmd.title);
      case "github":
        return doGitHubCard();
      case "text":
        // typed text takes the title's place (it would sit on the title otherwise): the copy clears first
        if (!objects.some((o) => o.slot === "caption")) await clearTitle();
        return doText(cmd.text);
      case "note":
        return doNote(cmd.text, cmd.colour);
    }
  }

  // ---- sending ----
  let busy = false;
  /** free commands the visitor sent, run one after another in the order sent */
  let freeQueue: Promise<void> = Promise.resolve();
  const press = () => {
    send.classList.add(c.press);
    later(() => send.classList.remove(c.press), 150);
  };
  const isRestart = () => send.dataset.restart !== undefined;
  function setRestart(onOff: boolean) {
    if (isRestart() === onOff) return;
    if (onOff) send.dataset.restart = "";
    else delete send.dataset.restart;
    send.setAttribute("aria-label", onOff ? "Restart demo" : "Send");
    send.disabled = onOff ? false : !input.value.trim();
  }
  async function sendFree(text: string) {
    busy = true;
    press();
    setValue("");
    send.disabled = true;
    hop();
    const cmd = parseCommand(text);
    await sleep(reduce() ? 0 : 450);
    await perform(cmd);
    announce(describeCommand(cmd));
    await sleep(reduce() ? 0 : 350);
    await home();
    busy = false;
  }

  // ---- the scripted demo: each prompt is typed into the chat box, then waits for the visitor to send it ----
  let demoRun = 0;
  let demoActive = false;
  let demoTyping = false;
  let demoWaiter: (() => void) | null = null;
  let sendQueued = false; // send was pressed while the prompt was still being typed
  let currentStep: Promise<void> | null = null;
  async function typeInto(text: string, token: number) {
    if (token !== demoRun) return false; // the visitor took over: leave their text alone
    demoTyping = true;
    setValue("");
    if (reduce()) {
      setValue(text);
      send.disabled = false;
      demoTyping = false;
      return true;
    }
    for (const ch of text) {
      if (token !== demoRun) {
        demoTyping = false;
        return false;
      }
      if (sendQueued) {
        setValue(text); // sent mid-typing: the rest of the prompt appears at once
        break;
      }
      setValue(input.value + ch);
      send.disabled = false;
      await sleep(14 + Math.random() * 18);
    }
    demoTyping = false;
    return token === demoRun;
  }
  const waitForSend = () =>
    new Promise<void>((r) => {
      if (sendQueued) {
        sendQueued = false;
        return r();
      }
      demoWaiter = r;
    });
  async function runDemo() {
    const steps = opts.demo;
    if (!steps.length) return;
    const token = ++demoRun;
    demoActive = true;
    await sleep(reduce() ? 0 : 900);
    if (!(await typeInto(steps[0], token))) return;
    await waitForSend();
    for (let i = 0; i < steps.length; i++) {
      if (token !== demoRun) return;
      while (busy) await sleep(80); // a free command the visitor sent is still playing: one choreography at a time
      if (token !== demoRun) return;
      busy = true;
      press();
      setValue("");
      send.disabled = true;
      if (i === steps.length - 1) setRestart(true); // the last prompt is on its way: offer a restart right away
      const cmd = parseCommand(steps[i]);
      if (i === 0 && cmd.kind !== "welcome") hop();
      const step = (currentStep = (async () => {
        await perform(cmd, true);
        announce(describeCommand(cmd));
        await sleep(reduce() ? 0 : 250);
        await home();
      })());
      if (i < steps.length - 1) {
        // the next prompt is ready at once; sending it while this step still plays fast-forwards the step
        if (!(await typeInto(steps[i + 1], token))) {
          await step;
          currentStep = null;
          busy = false; // the visitor took over: their message runs once this step is done
          return;
        }
        const sent = waitForSend();
        const first = await Promise.race([step.then(() => "done"), sent.then(() => "skip")]);
        if (first === "skip") await fastForward(step);
        else {
          busy = false;
          await sent;
        }
      } else await step;
      currentStep = null;
      busy = false;
    }
    demoActive = false;
  }
  // if the visitor edits the prompt or types their own, the demo steps aside and their text is a normal command
  function takeOver(e: Event) {
    if (!demoActive) return;
    // typing into a half-typed demo prompt: the prompt goes, only what the visitor typed stays
    if (demoTyping && e instanceof InputEvent && e.inputType === "insertText") setValue(e.data ?? "");
    sendQueued = false;
    demoActive = false;
    demoRun++;
    demoWaiter = null;
    demoTyping = false;
  }
  on(input, "input", (e) => {
    if (e.isTrusted) takeOver(e);
    setRestart(false);
    send.disabled = !input.value.trim();
  });
  on(form, "submit", (e) => {
    e.preventDefault();
    if (isRestart()) {
      void resetHero();
      return;
    }
    const v = input.value.trim();
    if (!v) return;
    if (demoWaiter) {
      const go = demoWaiter; // the visitor sends the waiting demo prompt
      demoWaiter = null;
      // empty and disable the box at once: a second Enter or click before the demo loop does it would otherwise
      // send the same prompt again as a free command
      setValue("");
      send.disabled = true;
      go();
      return;
    }
    if (demoTyping && demoActive) {
      sendQueued = true; // ...or sends it before it is fully typed
      return;
    }
    setValue("");
    send.disabled = true;
    // one queue, oldest first: each free command waits for the agent's current step (demo or free) to finish
    freeQueue = freeQueue.then(async () => {
      while (busy && alive) await sleep(80);
      if (alive) await sendFree(v);
    });
  });

  /** Puts the hero back as the server rendered it: no board objects, the cursor home, the title and crew back. */
  function clearBoard() {
    objects.splice(0).forEach((o) => o.el.remove());
    links.splice(0).forEach((l) => {
      l.path.remove();
      l.head.remove();
    });
    layer.querySelectorAll(`.${c.morph}, .${c.marquee}`).forEach((e) => e.remove());
    clearSelection();
    cursor.classList.remove(c.on, c.bare, c.typing, c.docked, c.dockAnim);
    cursor.style.clipPath = "";
    leap?.cancel();
    center.classList.remove(c.gone);
    restoreTitle(true);
    setValue("");
    send.disabled = true;
  }

  async function resetHero() {
    demoRun++;
    sendQueued = false;
    if (currentStep) {
      await fastForward(currentStep);
      currentStep = null;
    }
    setRestart(false);
    demoActive = false;
    demoWaiter = null;
    demoTyping = false;
    busy = false;
    agentInCursor = false;
    morphRun++;
    hero.classList.add(c.noAnim);
    clearBoard();
    void hero.offsetWidth;
    hero.classList.remove(c.noAnim);
    announce("The demo starts again.");
    void runDemo();
  }

  updateCaret();
  void runDemo();

  return () => {
    alive = false;
    morphRun++;
    demoRun++;
    timers.forEach((t) => window.clearTimeout(t));
    pendingWaits.clear();
    cleanups.forEach((f) => f());
    // leave the DOM as the server rendered it, so a re-run (new config, hot reload) starts from a clean board
    clearBoard();
    setRestart(false);
  };
}
