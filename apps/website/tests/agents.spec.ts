import { describe, expect, it } from "vitest";
import { eventsBetween, poseAt, sample, validate } from "../src/components/Agents/timeline";
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
  it.each([["idle", idle], ["hatSwap", hatSwap], ["bouquetReveal", bouquetReveal]] as const)("%s has valid data", (_, anim) => {
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
