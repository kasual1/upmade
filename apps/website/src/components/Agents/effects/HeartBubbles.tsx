import { useEffect, useImperativeHandle, useRef, type CSSProperties, type Ref, type RefObject } from "react";
import { INK } from "../tokens";

/** Sends extra, faster hearts up (an agent's smile, a click). */
export interface HeartBubblesHandle {
  burst(count: number): void;
}

export interface HeartBubblesProps {
  /** the agent the hearts rise from behind: they start at its head and are sized to it */
  agent: RefObject<Element | null>;
  ref?: Ref<HeartBubblesHandle>;
  className?: string;
  style?: CSSProperties;
}

/** Light and base colour of each heart's gradient, one picked at random per heart. */
const FILLS: [string, string][] = [["#ff8aa0", "#F43F5E"], ["#ff8bc5", "#FF6AB5"], ["#ffb8c6", "#FB8199"]];
/** The most hearts in the air at once; a new one only spawns once an earlier one has gone. */
const MAX_HEARTS = 14;
/** A plump heart, 22 by 20 units around its middle with its tip at the bottom. */
const HEART = "M0 10C-3 6.5-11 2.5-11-3.5C-11-7.5-8-10-5.5-10C-2.5-10-.5-8 0-6C.5-8 2.5-10 5.5-10C8-10 11-7.5 11-3.5C11 2.5 3 6.5 0 10Z";
/** Each colour is drawn once into a sprite this big (UNITS units across), so a heart looks the same at any size. */
const UNITS = 28, SPRITE = 128;
/** The agent width the heart sizes were made for: hearts scale with the agent. */
const SIZED_FOR = 123;

const between = (a: number, b: number) => a + Math.random() * (b - a);
/** Eases from 0 to 1 with a slight overshoot, so a heart pops in. */
const easeOutBack = (t: number) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2;

interface Heart {
  on: boolean; sprite: HTMLCanvasElement; born: number; life: number; x: number; y: number;
  rise: number; drift: number; size: number; sway: number; swayRate: number; phase: number;
}

/**
 * Hearts that slowly bubble up from behind an agent, so it looks like it is in love (the landing page's lovestruck
 * agent). Drawn flat in the agents' style, with an ink outline and a soft pink gradient: they pop in, sway, turn a
 * little and shrink away near the top; `burst(n)` sends n quicker ones up. A canvas laid behind the agent (give it a
 * box around the agent with room above it). Plays only while on screen; with reduced motion nothing is drawn.
 */
export default function HeartBubbles({ agent, ref, className, style }: HeartBubblesProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const extraRef = useRef(0);
  useImperativeHandle(ref, () => ({ burst: (n) => { extraRef.current = Math.min(extraRef.current + n, MAX_HEARTS); } }), []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.style.cssText = "display:block;width:100%;height:100%";
    host.appendChild(canvas);

    const path = new Path2D(HEART);
    const sprites = FILLS.map(([light, base]) => {
      const c = document.createElement("canvas");
      c.width = c.height = SPRITE;
      const g = c.getContext("2d")!;
      g.setTransform(SPRITE / UNITS, 0, 0, SPRITE / UNITS, SPRITE / 2, SPRITE / 2);
      const fill = g.createLinearGradient(0, -10, 0, 10);
      fill.addColorStop(0, light);
      fill.addColorStop(0.65, base);
      g.fillStyle = fill;
      g.fill(path);
      g.lineWidth = 2.6;
      g.lineJoin = "round";
      g.strokeStyle = INK;
      g.stroke(path);
      return c;
    });
    const hearts: Heart[] = Array.from({ length: MAX_HEARTS }, () => ({
      on: false, sprite: sprites[0], born: 0, life: 0, x: 0, y: 0, rise: 0, drift: 0, size: 0, sway: 0, swayRate: 0, phase: 0,
    }));

    // the agent's middle and size, and the part of the canvas inside the viewport, in CSS pixels from its top left
    let w = 0, h = 0, dpr = 1, agentX = 0, agentY = 0, agentW = 0, agentH = 0, minX = 0, maxX = 0;
    const resize = () => {
      w = host.clientWidth;
      h = host.clientHeight;
      const el = agent.current;
      if (!w || !h || !el) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const f = host.getBoundingClientRect(), b = el.getBoundingClientRect();
      agentX = b.left + b.width / 2 - f.left;
      agentY = b.top + b.height / 2 - f.top;
      agentW = b.width;
      agentH = b.height;
      minX = Math.max(0, -f.left);
      maxX = Math.min(w, document.documentElement.clientWidth - f.left);   // near the screen's edge on phones
    };

    // hearts start behind the agent's head, so they peek out over it as they rise
    const spawn = (ht: Heart, now: number, life: number) => {
      ht.born = now;
      ht.life = life;
      ht.size = between(21, 33) * (agentW / SIZED_FOR);
      ht.sway = between(4, 10);
      const room = ht.sway + ht.size / 2 + 4, clamp = (x: number) => Math.min(Math.max(x, minX + room), maxX - room);
      ht.x = clamp(agentX + between(-0.16, 0.16) * agentW);
      ht.y = agentY - agentH * (0.5 - between(0.22, 0.4));
      ht.rise = (ht.y - ht.size) * between(0.6, 1);
      ht.drift = clamp(ht.x + (ht.x - agentX) * between(0.2, 0.6)) - ht.x;
      ht.swayRate = between(1.4, 2.4);
      ht.phase = between(0, Math.PI * 2);
      ht.sprite = sprites[Math.floor(Math.random() * sprites.length)];
      ht.on = true;
    };

    let clock = 0, last = 0, nextSpawn = 0, nextExtra = 0, raf = 0, running = false;
    const tick = (time: number) => {
      clock += Math.max(0, Math.min((time - last) / 1000, 0.1));   // only advances while running, at most 0.1 s a frame
      last = time;
      if (clock >= nextSpawn) {
        const ht = hearts.find((c) => !c.on);
        if (ht) spawn(ht, clock, between(2.5, 3.4));
        nextSpawn = clock + between(0.6, 0.95);
      }
      if (extraRef.current > 0 && clock >= nextExtra) {
        const ht = hearts.find((c) => !c.on);
        if (ht) spawn(ht, clock, between(1.1, 1.6));
        extraRef.current -= 1;
        nextExtra = clock + between(0.05, 0.1);
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingQuality = "high";
      for (let i = hearts.length - 1; i >= 0; i--) {   // the first hearts are drawn last, in front
        const ht = hearts[i];
        if (!ht.on) continue;
        const age = clock - ht.born, p = age / ht.life;
        if (p >= 1) { ht.on = false; continue; }
        const wave = Math.sin(ht.phase + age * ht.swayRate);
        const pop = p < 0.1 ? easeOutBack(p / 0.1) : 1;
        const out = Math.max(0, (p - 0.72) / 0.28);   // shrinks away over the last part of its life
        const s = Math.max(0.001, (ht.size / 22) * pop * (1 - out * out * (3 - 2 * out)));
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.translate(ht.x + ht.drift * p + wave * ht.sway * Math.min(1, p * 4), ht.y - ht.rise * p);
        ctx.rotate(wave * 0.2);
        ctx.scale(s * Math.cos(Math.sin(ht.phase * 2 + age * 1.3) * 0.5), s);   // tilts with its sway and turns a little
        ctx.globalAlpha = Math.min(1, (1 - out) * 4);
        ctx.drawImage(ht.sprite, -UNITS / 2, -UNITS / 2, UNITS, UNITS);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (running) return;
      running = true;
      resize();
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    window.addEventListener("resize", resize);
    const io = new IntersectionObserver((es) => (es.some((e) => e.isIntersecting) ? start() : stop()));
    io.observe(host);
    resize();
    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("resize", resize);
      canvas.remove();
    };
  }, [agent]);

  return <div ref={hostRef} className={className} style={{ pointerEvents: "none", ...style }} aria-hidden="true" />;
}
