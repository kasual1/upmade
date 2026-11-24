import type { Vec } from "../types";

/**
 * A three-ball juggling cascade, shared by the agents that juggle (the juggler, the tool cycle's shapes): throws
 * alternate right and left on every beat, each object flying from the inside of one hand (its throw point) over the
 * agent's head to the outside of the other (its catch point), then riding in that hand, scooped down and back in, to
 * be thrown again three beats after its last throw. The left hand mirrors the right about x 32. All times are in
 * beats; positions are in whatever space the points are given in.
 */
export interface Cascade {
  /** the right hand's throw point (inside, in front of the body) and catch point (outside) */
  throwAt: Vec;
  catchAt: Vec;
  /** the y the throws peak at */
  top: number;
  /** how far an empty hand rises on its way out to the catch point */
  rise: number;
  /** how far a hand dips while it carries a caught object back in */
  scoop: number;
  /** beats a throw is in the air (the object is held for the rest of its 3 beats) */
  flight: number;
  /** optional: the x of a throw runs fast to `x` (a fraction of the way across) by `at` (a fraction of the flight),
   *  then on more slowly, as a hand flicks it across */
  knee?: { at: number; x: number };
}

const mirror = ([x, y]: Vec): Vec => [64 - x, y];

/** Where object k (0, 1, 2) is at beat `tau`: object k is first thrown on beat k, by the right hand on even beats. */
export function objectAt(c: Cascade, k: number, tau: number): Vec {
  const n = Math.floor((tau - k) / 3), beat = k + 3 * n, u = tau - beat;
  const right = ((beat % 2) + 2) % 2 === 0;
  const p = u < c.flight ? flightAt(c, u / c.flight) : heldAt(c, (u - c.flight) / (3 - c.flight));
  return right ? p : mirror(p);
}

/** Where a hand is at beat `tau`: the right hand throws on even beats, the left on odd ones. */
export function handAt(c: Cascade, side: "R" | "L", tau: number): Vec {
  const ph = (((tau - (side === "R" ? 0 : 1)) % 2) + 2) % 2, empty = c.flight - 1;
  let p: Vec;
  if (ph < empty) {
    // just thrown: an eased arc up and out to the catch point
    const u = (1 - Math.cos((Math.PI * ph) / empty)) / 2;
    p = [c.throwAt[0] + (c.catchAt[0] - c.throwAt[0]) * u, c.throwAt[1] - c.rise * Math.sin(Math.PI * u)];
  } else p = mirror(heldAt(c, (ph - empty) / (3 - c.flight)));   // the object it caught from the other hand
  return side === "R" ? p : mirror(p);
}

/** A right-hand throw, a fraction s of the way through its flight to the left hand's catch point. */
function flightAt(c: Cascade, s: number): Vec {
  const [x0, y0] = c.throwAt, [x1, y1] = mirror(c.catchAt);
  const x = c.knee
    ? s <= c.knee.at
      ? x0 + (x1 - x0) * c.knee.x * (s / c.knee.at)
      : x0 + (x1 - x0) * (c.knee.x + (1 - c.knee.x) * ((s - c.knee.at) / (1 - c.knee.at)))
    : x0 + (x1 - x0) * s;
  return [x, y0 + (y1 - y0) * s - 4 * ((y0 + y1) / 2 - c.top) * s * (1 - s)];
}

/** An object caught by the left hand, a fraction s of the way back in from its catch point to its throw point. */
function heldAt(c: Cascade, s: number): Vec {
  const [cx, cy] = mirror(c.catchAt), [tx] = mirror(c.throwAt);
  return [cx + (tx - cx) * s, cy + c.scoop * Math.sin(Math.PI * s)];
}
