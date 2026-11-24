/**
 * One requestAnimationFrame loop for every agent on the page. Each playing agent subscribes a tick; the loop
 * stops when nobody is subscribed. Frames are capped at 100 ms, so a backgrounded tab doesn't jump ahead.
 */
import { eventsBetween } from "./timeline";
import type { AgentAnimation } from "./types";

type Tick = (dt: number) => void;
const ticks = new Set<Tick>();
let raf = 0;
let last = 0;

function frame(now: number) {
  const dt = Math.min(now - last, 100);
  last = now;
  ticks.forEach((tick) => tick(dt));
  raf = ticks.size ? requestAnimationFrame(frame) : 0;
}

export function subscribe(tick: Tick): () => void {
  ticks.add(tick);
  if (!raf) {
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  return () => {
    ticks.delete(tick);
  };
}

/** A clock for one animation: advances, wraps round the loop and reports the events it passes. */
export function createClock(anim: AgentAnimation, start = 0) {
  let time = start;
  return {
    get time() {
      return time % anim.duration;
    },
    advance(dt: number, onEvent?: (name: string) => void) {
      const from = time;
      time += dt;
      if (onEvent) eventsBetween(anim, from, time).forEach(onEvent);
      return time % anim.duration;
    },
  };
}
