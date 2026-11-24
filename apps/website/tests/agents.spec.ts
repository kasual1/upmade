import { describe, expect, it } from "vitest";
import { eventsBetween, openness, poseAt, sample, validate } from "../src/components/Agents/timeline";
import * as animations from "../src/components/Agents/animations";
import { bouquetReveal, hatSwap, idle } from "../src/components/Agents/animations";
import { SHAPES } from "../src/components/Agents/tokens";

describe("sample", () => {
  const track = [[0, 0], [100, 10, "linear"], [200, 0]] as const;
  it("holds before the first and after the last key", () => {
    expect(sample(track, -50, 99)).toBe(0);
    expect(sample(track, 500, 99)).toBe(0);
  });
  it("interpolates with the key's ease", () => {
    expect(sample(track, 50, 99)).toBe(5); // linear into the second key
    expect(sample(track, 150, 99)).toBe(5); // smoothstep is symmetric at the middle
  });
  it("interpolates vectors and falls back without a track", () => {
    expect(sample([[0, [0, 0]], [100, [10, -10], "linear"]], 25, [0, 0])).toEqual([2.5, -2.5]);
    expect(sample(undefined, 25, [1, 2])).toEqual([1, 2]);
  });
});

describe("eventsBetween", () => {
  it("reports events passed, including across the end of the loop", () => {
    expect(eventsBetween(hatSwap, 1000, 1400)).toEqual(["swap"]);
    expect(eventsBetween(hatSwap, 2000, 2600 + 1400)).toEqual(["swap", "putOn"]); // putOn at 2050, then swap at 1350 of the next loop
    expect(eventsBetween(hatSwap, 1400, 2000)).toEqual([]);
  });
});

describe("animations", () => {
  it.each(Object.entries(animations))("%s has valid data", (_, anim) => {
    expect(validate(anim)).toEqual([]);
  });

  it("hat swap: one hat is always visible, and the held hat is behind the body only while it is down behind the back", () => {
    for (let t = 0; t < hatSwap.duration; t += 10) {
      const { worn, held } = poseAt(hatSwap, t).props;
      expect(Number(worn.visible) + Number(held.visible)).toBe(1);
      if (held.visible && held.behind) {
        // while switching layers the hat is above the head; while hidden it is centred well inside the body
        const top = SHAPES.squircle.head[1];
        const aboveHead = held.at[1] < top - 2;
        const insideBody = held.at[0] > 20 && held.at[0] < 44 && held.at[1] > 30;
        expect(aboveHead || insideBody || t < 1150 || t > 1550).toBe(true);
      }
    }
  });

  it("bouquet reveal: the hand and the bouquet change layers together", () => {
    for (let t = 0; t < bouquetReveal.duration; t += 10) {
      const pose = poseAt(bouquetReveal, t, "circle");
      if (pose.props.bouquet.visible) expect(pose.props.bouquet.behind).toBe(pose.hands.R.behind);
    }
  });
});

describe("reactions", () => {
  // a small seeded generator, so the random hops are repeatable here
  const seeded = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  it("every hop starts and ends at rest, and is over after its duration", async () => {
    const { randomHop, hopAt } = await import("../src/components/Agents/reactions");
    const random = seeded(7);
    for (let n = 0; n < 200; n++) {
      const hop = randomHop(random);
      const start = hopAt(hop, 0)!, end = hopAt(hop, hop.duration - 0.001)!;
      for (const p of [start, end]) {
        expect(Math.abs(p.lift)).toBeLessThan(0.05);
        expect(Math.abs(p.lean)).toBeLessThan(0.05);
        expect(Math.abs(p.scale[0] - 1)).toBeLessThan(0.01);
      }
      expect(hopAt(hop, hop.duration)).toBeNull();
      expect(validate({ duration: hop.duration, body: { lift: hop.lift, lean: hop.lean, squash: hop.squash } })).toEqual([]);
    }
  });

  it("hops vary: all three kinds come up, with different heights and tilts", async () => {
    const { randomHop, hopAt } = await import("../src/components/Agents/reactions");
    const random = seeded(42);
    const hops = Array.from({ length: 60 }, () => randomHop(random));
    expect(new Set(hops.map((h) => h.kind))).toEqual(new Set(["single", "double", "wiggle"]));
    const peaks = hops.map((h) => Math.min(...Array.from({ length: 50 }, (_, k) => hopAt(h, (h.duration * k) / 50)!.lift)));
    expect(new Set(peaks.map((p) => p.toFixed(1))).size).toBeGreaterThan(20);
  });
});

describe("blinks", () => {
  it("a plain time blinks for 45 ms each way down to .1", () => {
    expect(openness([1000], 1000)).toBeCloseTo(0.1);
    expect(openness([1000], 954)).toBe(1);
    expect(openness([1000], 1046)).toBe(1);
    expect(openness([1000], 1022.5)).toBeCloseTo(0.55);
  });

  it("a blink can close fast, hold and reopen slowly, at its own depth", () => {
    const b = { at: 1000, close: 80, hold: 200, open: 160, depth: 0.42 };
    expect(openness([b], 919)).toBe(1);
    expect(openness([b], 1000)).toBeCloseTo(0.42);
    expect(openness([b], 1150)).toBeCloseTo(0.42);
    expect(openness([b], 1280)).toBeGreaterThan(0.42);
    expect(openness([b], 1361)).toBe(1);
  });

  it("the animation's blink shape applies to plain times, and blinks wrap round the loop", () => {
    const anim = { duration: 2000, eyes: { blinks: [1980], blink: { open: 100 } } };
    expect(poseAt(anim, 1980).eyes.open).toBeCloseTo(0.1);
    expect(poseAt(anim, 40).eyes.open).toBeLessThan(1);   // 60 ms into the 100 ms reopen, past the loop's end
    expect(poseAt(anim, 90).eyes.open).toBe(1);
  });

  it("validate catches bad blinks", () => {
    expect(validate({ duration: 1000, eyes: { blinks: [{ at: 1200 }, { at: 500, close: 0 }, { at: 600, depth: 2 }] } })).toHaveLength(3);
  });
});

describe("shift", () => {
  it("moves the body sideways", () => {
    const anim = { duration: 1000, body: { shift: [[0, 0], [1000, -8, "linear"]] as const } };
    expect(poseAt(anim, 500).body.shift).toBeCloseTo(-4);
    expect(poseAt({ duration: 1000 }, 500).body.shift).toBe(0);
    expect(validate({ duration: 1000, body: { shift: [[0, 0], [1200, 1]] } })).toHaveLength(1);
  });
});

describe("eyes", () => {
  it("a linear blink moves at an even speed", () => {
    const b = { at: 1000, close: 100, open: 100, depth: 0, ease: "linear" as const };
    expect(openness([b], 950)).toBeCloseTo(0.5);
    expect(openness([b], 975)).toBeCloseTo(0.25);
    expect(openness([b], 1025)).toBeCloseTo(0.25);
  });

  it("lid, scale and glint are sampled, with neutral defaults", () => {
    const anim = {
      duration: 1000,
      eyes: { lid: [[0, 0], [1000, 0.5, "linear"]] as const, scale: [[0, [1, 1]], [1000, [1, 1.2], "linear"]] as const, glint: [[0, [0, 0]], [1000, [1, -1], "linear"]] as const },
    };
    const e = poseAt(anim, 500).eyes;
    expect(e.lid).toBeCloseTo(0.25);
    expect(e.scale[1]).toBeCloseTo(1.1);
    expect(e.glint).toEqual([0.5, -0.5]);
    const d = poseAt({ duration: 1000 }, 500).eyes;
    expect([d.lid, d.scale, d.glint]).toEqual([0, [1, 1], [0, 0]]);
    expect(validate({ duration: 1000, eyes: { lid: [[0, 1.5]] } })).toHaveLength(1);
  });
});

describe("frame", () => {
  it("is checked, and every framed animation stands on a ground inside its drawing", () => {
    expect(validate({ duration: 1000, frame: { scale: 0, ground: 49 } })).toHaveLength(1);
    for (const [name, anim] of Object.entries(animations)) {
      if (!anim.frame) continue;
      expect(anim.frame.scale, name).toBeGreaterThan(0.5);
      expect(anim.frame.scale, name).toBeLessThanOrEqual(1);
      expect(anim.frame.ground, name).toBeGreaterThan(30);
      expect(anim.frame.ground, name).toBeLessThan(64);
    }
  });

  it("layers drawn together share a frame", () => {
    expect(animations.painterStage.frame).toEqual(animations.painter.frame);
    expect(animations.handoffTriangle.frame).toEqual(animations.handoff.frame);
    expect(animations.handoffCircle.frame).toEqual(animations.handoff.frame);
  });
});

describe("scene props", () => {
  it("are placed by their offset alone, like world props", () => {
    const anim = { duration: 1000, props: { line: { attach: "scene" as const, offset: [[0, [4, 60]]] as const } } };
    expect(poseAt(anim, 500).props.line.at).toEqual([4, 60]);
  });

  it("the tool cycle's painted line is a scene prop, so it stays put while the agent hops", () => {
    const paint = Object.entries(animations.toolCycle.props ?? {}).filter(([name]) => name.startsWith("paint"));
    expect(paint.length).toBeGreaterThan(0);
    for (const [, p] of paint) expect(p.attach).toBe("scene");
  });
});

describe("hands", () => {
  // the body's left outer edge (outline + half its 3.6 stroke) at each shape's hand height, measured in the browser
  // (isPointInFill / isPointInStroke on the outline path); squircle and triangle were the reference (1.14 and 0.87)
  const OUTER_EDGE = { squircle: 10.34, circle: 14.6, bullet: 10.44, pill: 10.72, triangle: 9.87 } as const;

  it("rest about 1 past the body's outer edge, so they overlap its outline, mirrored about the middle", () => {
    for (const [name, spec] of Object.entries(SHAPES)) {
      const [lx, ly] = spec.hands.L, [rx, ry] = spec.hands.R;
      const past = OUTER_EDGE[name as keyof typeof OUTER_EDGE] - lx;
      expect(past, name).toBeGreaterThan(0.6);
      expect(past, name).toBeLessThan(1.4);
      expect(rx, name).toBeCloseTo(64 - lx, 5);
      expect(ry, name).toBe(ly);
    }
  });
});
