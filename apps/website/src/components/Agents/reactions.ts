/**
 * Reactions: short moves an agent plays on top of its animation when someone hovers over it or clicks it. Each one is
 * rolled at random (the kind of hop, its height, speed, tilt and squash), so the agent never reacts the same way twice
 * in a row. Pure functions: `randomHop()` rolls one, `hopAt()` says what it adds at a moment.
 */
import { sample } from "./timeline";
import type { Track, Vec } from "./types";

export type HopKind = "single" | "double" | "wiggle";

export interface Hop {
  kind: HopKind;
  duration: number;
  lift: Track<number>;
  lean: Track<number>;
  squash: Track<Vec>;
  /** when it blinks (on landing) */
  blink: number;
}

/** One random hop. Pass a seeded `random` for repeatable hops (tests). */
export function randomHop(random: () => number = Math.random): Hop {
  const between = (a: number, b: number) => a + random() * (b - a);
  const roll = random();
  const kind: HopKind = roll < 0.25 ? "double" : roll < 0.55 ? "wiggle" : "single";
  const side = random() < 0.5 ? -1 : 1;

  if (kind === "double") {
    // two quick hops, the second lower
    const d = between(330, 400), h1 = between(4, 7), h2 = h1 * between(0.45, 0.75), s = between(0.05, 0.09), lean = side * between(2, 6);
    const hop = (t0: number, h: number) => ({
      lift: [[t0 + 0.15 * d, 0], [t0 + 0.5 * d, -h, "out"], [t0 + 0.82 * d, 0, "in"]] as const,
      squash: [[t0 + 0.15 * d, [1 + s, 1 - s]], [t0 + 0.5 * d, [1 - s / 2, 1 + s / 2]], [t0 + 0.82 * d, [1 + s, 1 - s]]] as const,
    });
    const a = hop(0, h1), b = hop(0.82 * d, h2);
    return {
      kind,
      duration: 1.82 * d,
      lift: [[0, 0], ...a.lift, ...b.lift, [1.82 * d, 0]],
      lean: [[0, 0], [0.5 * d, lean], [0.82 * d, 0], [1.32 * d, -lean * 0.6], [1.82 * d, 0]],
      squash: [[0, [1, 1]], ...a.squash, ...b.squash, [1.82 * d, [1, 1]]],
      blink: 1.64 * d,
    };
  }

  const d = between(440, 620), h = between(5, 10.5), s = between(0.06, 0.12), lean = side * between(3, 10);
  const lift: Track<number> = [[0, 0], [0.15 * d, 0], [0.5 * d, -h, "out"], [0.82 * d, 0, "in"], [d, 0]];
  const squash: Track<Vec> = [[0, [1, 1]], [0.15 * d, [1 + s, 1 - s]], [0.5 * d, [1 - s / 2, 1 + s / 2]], [0.82 * d, [1 + s, 1 - s]], [d, [1, 1]]];
  const tilt: Track<number> =
    kind === "wiggle"
      ? [[0, 0], [0.3 * d, lean], [0.45 * d, -lean], [0.6 * d, lean * 0.7], [0.82 * d, 0], [d, 0]]   // side to side in the air
      : [[0, 0], [0.15 * d, 0], [0.5 * d, lean], [0.82 * d, 0], [d, 0]];
  return { kind, duration: d, lift, lean: tilt, squash, blink: 0.86 * d };
}

/** What a hop adds `elapsed` ms after it started, or null once it is over. */
export function hopAt(hop: Hop, elapsed: number): { lift: number; lean: number; scale: Vec; open: number } | null {
  if (elapsed < 0 || elapsed >= hop.duration) return null;
  const d = Math.abs(elapsed - hop.blink);
  return {
    lift: sample(hop.lift, elapsed, 0),
    lean: sample(hop.lean, elapsed, 0),
    scale: sample(hop.squash, elapsed, [1, 1] as Vec),
    open: d < 45 ? 0.1 + 0.9 * (d / 45) : 1,
  };
}
