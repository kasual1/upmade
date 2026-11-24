import type { AgentAnimation, Key, Track, Vec } from "../types";
import { handAt, objectAt, type Cascade } from "./cascade";

/**
 * The juggler (the DOM-canvas section of infinite.html): the blue circle agent pulls a vase, an apple and a
 * calculator from behind its back and juggles them in a three-ball cascade, in a 6.75 s loop.
 *
 *   0-0.42 s     stands still, looking ahead
 *   0.42-0.96 s  looks down at its hands, which wait at its sides, low on the body (46 55) and (18 55)
 *   1.02-1.65 s  the three objects appear at the hands (fading in by 1.26 s, growing from 0.4 to full size by
 *                1.62 s): the vase and the calculator in the right hand, the apple in the left. The right hand tosses
 *                the calculator straight up from 1.26 s; it is at the top of its arc as the cascade starts
 *   1.65-5.25 s  the cascade: a throw every 0.3 s, alternating hands, each object going round in 1.8 s, twice. The
 *                objects spin at 200 degrees a second, a third of a turn apart. The eyes look up and follow the
 *                throws from side to side
 *   5.25-5.85 s  the hands catch everything and carry it down to where it came from; the objects shrink back and
 *                fade out (5.58-5.85 s), the eyes come back down
 *   5.88-6.39 s  looks ahead again; blinks at 6.31 s (shutting over 61 ms, reopening over 81 ms, at an even speed, as in the original)
 *
 * The original draws the body at 0.66 with its feet (32 49.6) at (32 63.5) of its 64x64 box, and the hands and the
 * objects at full size in that box, on top of the body (vase, apple, calculator, then the two hands), so the throws
 * fit inside the box. Here the agent keeps the family's normal size and place (so it lines up with the others), and
 * the objects and both visible hands are "world" props taken from the original's box into the agent's own space
 * (see `W`), drawn in that order and scaled by 1/`S` to keep their size against the body. The throws therefore rise
 * about 31 units above the top of the agent's box: leave room above it. The rig's own hands wait
 * behind the middle of the body, out of sight. The original has no behind-the-body layer: the objects come "from
 * behind its back" by fading in at the hands, beside the body, and so do they here.
 *
 * Props: `vase`, `apple`, `calculator`, `handR`, `handL`. No events.
 */
const D = 6750;

/** the scale the original draws the body at (the props are scaled by 1/S to keep their size against the body) */
const S = 0.66;
/** A point in the original's 64x64 box, in this agent's own space (feet (32 49.6) drawn at (32 63.5), at 0.66). */
const W = (x: number, y: number): Vec => [+(32 + (x - 32) / S).toFixed(2), +(49.6 + (y - 63.5) / S).toFixed(2)];

/** the cascade runs from the first throw to the last catch-and-hold: two full rounds of 1.8 s */
const C0 = 1650, C1 = 5250;
/** a beat: one throw every 0.3 s, alternating hands */
const BEAT = 300;
/** the original was baked into keys every 30 ms; the cascade is rebuilt here at the same rate */
const STEP = 30;

/** how much lower than the original the hands juggle: at the middle of the body rather than up by the face */
const DROP = 6;
/**
 * The cascade, in the box (see cascade.ts): the right hand throws from (42.1 51.1) and catches at (49.3 51.1), the
 * throws peak at y 10.1, an empty hand rises 3.2 on its way out and a full one scoops down 4.9 on its way back in.
 * A throw flies for 2.1 beats (630 ms), its x running fast to 21.7 for the first 12/21 of it (as the original does).
 * The original juggles at y 45.1; here the hands are DROP lower.
 */
const JUGGLE: Cascade = {
  throwAt: [42.1, 45.1 + DROP], catchAt: [49.3, 45.1 + DROP], top: 10.1, rise: 3.2, scoop: 4.9, flight: 2.1,
  knee: { at: 12 / 21, x: (42.1 - 21.7) / (42.1 - 14.7) },
};
/** the same at the original's height: the lead-in and wind-down below were made to meet that one */
const ORIGINAL: Cascade = { ...JUGGLE, throwAt: [42.1, 45.1], catchAt: [49.3, 45.1] };

/** beats since the cascade started */
const beats = (t: number) => (t - C0) / BEAT;
/** the objects: the vase is thrown first (beat 0, right hand), the apple next (left), then the calculator (right) */
const VASE = 0, APPLE = 1, CALCULATOR = 2;

type Points = [number, number, number][];
const ease = (u: number) => { const v = Math.max(0, Math.min(1, u)); return v * v * (3 - 2 * v); };

/**
 * A path in the box: the original's keys for the lead-in and the wind-down (linear), around the cascade. The lead-in
 * and wind-down were made to meet the original cascade; the difference to this one (the lower hands) is eased into
 * them over the 0.3 s next to the cascade, so they still meet it.
 */
function path(before: Points, at: (c: Cascade, tau: number) => Vec, after: Points): Track<Vec> {
  const shift = (t: number): Vec => {
    const tau = beats(t), a = at(ORIGINAL, tau), b = at(JUGGLE, tau);
    return [b[0] - a[0], b[1] - a[1]];
  };
  const din = shift(C0), dout = shift(C1);
  const moved = (keys: Points, d: Vec, w: (t: number) => number) =>
    keys.map(([t, x, y]): Key<Vec> => [t, W(x + d[0] * w(t), y + d[1] * w(t)), "linear"]);
  const cascade: Key<Vec>[] = [];
  for (let t = C0; t <= C1; t += STEP) cascade.push([t, W(...at(JUGGLE, beats(t))), "linear"]);
  return [
    [0, W(before[0][1], before[0][2])],
    ...moved(before, din, (t) => ease((t - (C0 - 300)) / 300)),
    ...cascade,
    ...moved(after, dout, (t) => 1 - ease((t - C1) / 300)),
  ];
}

/** The right hand, with the vase in it, rises a little and comes in to its throw point by 1.65 s; after the last
 *  round it carries the vase back down to (46 55). The vase sits right in the hand while held. */
const rightIn: [number, number, number][] = [
  [1020, 46, 55], [1050, 45.9, 55.1], [1080, 45.7, 55.1], [1110, 45.6, 54.7], [1140, 45.5, 54.1], [1230, 45.2, 51.7],
  [1260, 45.1, 51], [1290, 45, 50.6], [1320, 44.8, 50.4], [1350, 44.5, 50.7], [1440, 43.4, 51.9], [1470, 43.1, 50.6],
  [1500, 42.8, 49.1], [1530, 42.6, 47.7], [1560, 42.4, 46.6], [1590, 42.2, 45.9], [1620, 42.1, 45.3],
];
const rightOut: [number, number, number][] = [
  [5280, 42.2, 45.3], [5310, 42.2, 45.9], [5370, 42.7, 48.2], [5400, 43, 49.7], [5430, 43.3, 51.4], [5460, 43.6, 51.7],
  [5490, 44, 51.2], [5520, 44.3, 51], [5550, 44.5, 51.1], [5580, 44.7, 51.5], [5610, 44.8, 52.1], [5640, 44.9, 52.9],
  [5670, 45.1, 53.6], [5700, 45.2, 54.3], [5730, 45.4, 54.9], [5760, 45.5, 55.2], [5790, 45.8, 55.2], [5820, 45.9, 55],
  [5880, 46, 55],
];
/** the vase: thrown first, at 1.65 s */
const vasePath = path(rightIn, (c, tau) => objectAt(c, VASE, tau), rightOut);

/** the calculator: tossed straight up out of the right hand from 1.26 s, it tops its arc (39 10.1) at 1.65 s, a
 *  third of a round ahead of the vase; it falls last, into the right hand at 5.6 s, and goes down with it */
const calculatorPath = path(
  [
    [1020, 46, 55], [1080, 45.6, 55.4], [1110, 45.5, 55.3], [1200, 44.9, 54.3], [1230, 44.8, 53.9], [1260, 44.5, 53.2],
    [1320, 44, 43], [1350, 43.7, 38.4], [1410, 42.7, 29.8], [1440, 42.3, 25.9], [1470, 41.6, 22], [1500, 40.8, 18.7],
    [1530, 40.2, 15.8], [1560, 39.8, 13.3], [1590, 39.3, 11.6], [1620, 39, 10.4],
  ],
  (c, tau) => objectAt(c, CALCULATOR, tau),
  [
    [5280, 39, 10.6], [5310, 39.3, 11.8], [5340, 39.8, 13.9], [5370, 40.4, 16.7], [5400, 41.1, 20], [5430, 42.1, 23.9],
    [5460, 42.5, 28.1], [5490, 43, 32.6], [5520, 43.5, 37.5], [5550, 43.7, 42.9], [5580, 44, 48.7], [5610, 44.2, 54.3],
    [5640, 44.4, 55.1], [5670, 44.6, 55.3], [5700, 44.9, 55.6], [5730, 45.2, 55.7], [5760, 45.4, 55.7], [5790, 45.7, 55.4],
    [5820, 45.9, 55.1], [5880, 46, 55],
  ],
);

/** the apple: in the left hand, which lifts it and lets it go at 1.38 s, a short hop up, so that it is falling back
 *  into that hand as the cascade starts (two thirds of a round ahead of the vase); it ends the same way */
const applePath = path(
  [
    [1020, 18, 55], [1050, 18, 55.1], [1080, 17.9, 55.1], [1110, 17.7, 54.8], [1140, 17.5, 54.3], [1170, 17.3, 53.5],
    [1230, 16.7, 52.1], [1260, 16.4, 51.5], [1290, 16.2, 51.1], [1320, 16, 51.1], [1350, 15.9, 51.4], [1380, 15.9, 52],
    [1440, 15.7, 47.4], [1470, 15.7, 45.4], [1530, 15.6, 41.9], [1560, 15.6, 40.5], [1590, 15.5, 39.6], [1620, 15.5, 39],
  ],
  (c, tau) => objectAt(c, APPLE, tau),
  [
    [5280, 15.5, 39], [5310, 15.5, 39.8], [5340, 15.6, 40.8], [5370, 15.6, 42.4], [5400, 15.6, 44.2], [5430, 15.7, 46.3],
    [5490, 15.9, 51.2], [5520, 16, 51.8], [5550, 16.1, 51.8], [5580, 16.4, 52.1], [5610, 16.6, 52.6], [5700, 17.5, 54.5],
    [5730, 17.7, 55], [5760, 17.9, 55.3], [5790, 18, 55.2], [5850, 18, 55], [5880, 18, 55],
  ],
);

/** the left hand: the right hand's loop mirrored, half a hand loop (0.3 s) behind */
const leftPath = path(
  [
    [1020, 18, 55], [1050, 18, 55.1], [1080, 17.9, 55.1], [1110, 17.6, 54.7], [1140, 17.4, 54.1], [1230, 16.5, 51.7],
    [1260, 16.2, 51], [1290, 15.9, 50.6], [1320, 15.7, 50.4], [1380, 15.5, 51.1], [1410, 15.3, 51.6], [1440, 15.3, 52],
    [1470, 15.2, 50.3], [1500, 15.1, 48.8], [1530, 15, 47.6], [1560, 15, 46.3], [1590, 14.9, 45.6], [1620, 14.8, 45.1],
  ],
  (c, tau) => handAt(c, "L", tau),
  [
    [5280, 14.8, 45.1], [5310, 14.9, 45.7], [5340, 15, 46.6], [5370, 15.1, 47.9], [5400, 15.1, 49.4], [5430, 15.2, 51.2],
    [5460, 15.3, 51.8], [5490, 15.4, 51.3], [5520, 15.6, 51], [5550, 15.8, 51.1], [5580, 16, 51.5], [5610, 16.4, 52.1],
    [5640, 16.7, 52.9], [5700, 17.3, 54.3], [5730, 17.6, 54.9], [5760, 17.9, 55.2], [5790, 17.9, 55.2], [5820, 18, 55],
    [5880, 18, 55],
  ],
);
const rightPath = path(rightIn, (c, tau) => handAt(c, "R", tau), rightOut);

/**
 * The spin: still while they come out; at 1.35 s each object turns (in one 30 ms key, as in the original) to its place
 * in the spin, then they all turn at 200 degrees a second (6 degrees per 30 ms key), a third of a turn apart, until
 * 5.55 s, when they snap back upright for the trip down (the snaps go the same way round as the original's).
 */
const SPIN_FROM = 1350, SPIN_TO = 5550, SPIN_RATE = 0.2;
const spin = (start: number, end: number): Track<number> => {
  const turned = start + SPIN_RATE * (SPIN_TO - SPIN_FROM);
  return [[0, 0], [1320, 0], [SPIN_FROM, start, "linear"], [SPIN_TO, turned, "linear"], [5580, end, "linear"]];
};

/** they grow from 0.4 to full size as they come out and shrink back as they go; scaled by 1/`S` to keep their size against the body */
const size: Track<number> = [[0, 0.4 / S], [1020, 0.4 / S], [1620, 1 / S], [5250, 1 / S], [5850, 0.4 / S]];
/** they fade in at the hands (1.02-1.26 s) and out again (5.58-5.85 s) */
const fade: Track<number> = [
  [0, 0], [1020, 0.01, "linear"], [1080, 0.13, "linear"], [1140, 0.36, "linear"], [1260, 1, "linear"],
  [5580, 1], [5640, 0.7, "linear"], [5700, 0.39, "linear"], [5760, 0.15, "linear"], [5820, 0.02, "linear"], [5850, 0, "linear"],
];
const SHOWN = [[1000, 5860]] as const;

const object = (offset: Track<Vec>, rotate: Track<number>) =>
  ({ attach: "world", offset, rotate, scale: size, opacity: fade, visible: SHOWN }) as const;
/** the hands at the agent's own size, like every agent's hands */
const hand = (offset: Track<Vec>) => ({ attach: "world", offset }) as const;

/** where the rig's own hands wait: behind the middle of the body */
const HIDDEN = { path: [[0, [32, 40]]], behind: [[0, D]] } as const;

export const juggler: AgentAnimation = {
  duration: D,
  rest: 2300,
  // drawn at the family's normal size and place, like every other agent; the throws arc up above the box
  eyes: {
    look: [
      // looks down at its hands (0.42-0.96 s) while the objects come out
      [0, [0, 0]], [420, [0, 0]], [960, [0, 1.4]], [1350, [0, 1.4]],
      // up to the throws, then from side to side with them: right at 1.95 s, left at 2.55 s, every 0.6 s
      [1500, [0.03, 0.99], "in"], [1650, [0.39, -0.94], "linear"], [1710, [0.71, -1.8], "linear"],
      [1950, [1.73, -2.8], "out"],
      [2550, [-1.73, -2.8]], [3150, [1.73, -2.8]], [3750, [-1.73, -2.8]], [4350, [1.73, -2.8]], [4950, [-1.73, -2.8]],
      // and back down with the catch
      [5160, [-0.89, -1.8], "in"], [5250, [-0.39, -0.46], "linear"], [5400, [-0.03, 1.17], "linear"], [5520, [0, 1.4], "out"],
      // then ahead again: speeding up to halfway at 6.135 s and slowing to a stop at 6.39 s, as in the original
      [5880, [0, 1.4]], [6135, [0, 0.7], "in"], [6390, [0, 0], "out"],
    ],
    // the original's blink: a linear scale to .1 from 6250 ms, shut at 6311 ms, open again by 6392 ms
    blink: { close: 61, open: 81, depth: 0.1, ease: "linear" },
    blinks: [6311],
  },
  hands: { L: HIDDEN, R: HIDDEN },
  // drawn in this order, as in the original: the objects, then the hands on top
  props: {
    vase: object(vasePath, spin(270, 1080)),
    apple: object(applePath, spin(30, 720)),
    calculator: object(calculatorPath, spin(150, 720)),
    handR: hand(rightPath),
    handL: hand(leftPath),
  },
};
