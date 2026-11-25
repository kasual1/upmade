// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import FramesDemo from "../src/components/LandingPage/media/FramesDemo";
import {
  FINAL_STATE,
  FRAMES,
  LOOP_MS,
  SHOP_UNIT,
  SHOP_W,
  STAGE_H,
  STAGE_W,
  START_STATE,
  STEPS,
  addButtonBox,
  cursorPoint,
  shopScale,
  stateAt,
} from "../src/components/LandingPage/media/FramesDemo/frames";
import { createSectionSignal } from "../src/components/LandingPage/hooks/useSectionSignal";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const { subscribe } = createSectionSignal();

describe("frames demo geometry", () => {
  it("keeps the frames and their titlebars on the 16:11 stage", () => {
    expect(STAGE_W / STAGE_H).toBeCloseTo(16 / 11, 5);
    for (const f of Object.values(FRAMES)) {
      expect(f.left).toBeGreaterThanOrEqual(0);
      expect(f.left + f.width).toBeLessThanOrEqual(STAGE_W);
      expect(f.top - 63).toBeGreaterThanOrEqual(0); // titlebar (50) + gap (13)
      expect(f.top + f.height).toBeLessThanOrEqual(STAGE_H);
    }
  });

  it("scales the shop pages down from their layout widths, never up", () => {
    for (const device of ["desktop", "phone"] as const) {
      const { k, height } = shopScale(device);
      expect(k).toBeLessThanOrEqual(1);
      expect(SHOP_W[device] * k).toBeCloseTo(FRAMES[device].width, 5);
      expect(height * k).toBeCloseTo(FRAMES[device].height, 5);
    }
  });

  it("lays the smallest shop text (the note, 1.8u) out at 12px or more (plan §3.7)", () => {
    for (const u of Object.values(SHOP_UNIT)) expect(u * 1.8).toBeGreaterThanOrEqual(12);
  });

  it("points the cursor at the add button, the phone page, or below the stage", () => {
    const add = addButtonBox();
    expect(cursorPoint("add")).toEqual({ x: add.left + add.width / 2, y: add.top + add.height / 2 });
    expect(add.left + add.width).toBeLessThanOrEqual(FRAMES.desktop.left + FRAMES.desktop.width);
    const phone = cursorPoint("phone");
    expect(phone.x).toBeGreaterThan(FRAMES.phone.left);
    expect(phone.y).toBeLessThan(FRAMES.phone.top + FRAMES.phone.height);
    expect(cursorPoint("offscreen").y).toBeGreaterThan(STAGE_H);
  });
});

describe("frames demo script", () => {
  it("builds the desktop page, adds the phone, builds it, then loops", () => {
    expect(stateAt(0)).toEqual(START_STATE);
    expect(stateAt(1600)).toMatchObject({ built: true, phone: false, target: "offscreen" });
    expect(stateAt(3750)).toMatchObject({ target: "add", pressed: true, phone: false });
    expect(stateAt(4000)).toMatchObject({ pressed: false, phone: true, phoneBuilt: false });
    expect(stateAt(LOOP_MS - 1)).toEqual(FINAL_STATE);
    expect(stateAt(LOOP_MS)).toEqual(START_STATE);
    const times = STEPS.map((s) => s.ms);
    expect([...times].sort((a, b) => a - b)).toEqual(times);
    expect(times[times.length - 1]).toBeLessThan(LOOP_MS);
  });
});

describe("FramesDemo server output", () => {
  const html = renderToString(createElement(FramesDemo, { subscribe }));

  it("is decorative and renders the finished state (both frames built, cursor shown)", () => {
    expect(html).toMatch(/^<div[^>]*aria-hidden="true"/);
    expect(html.match(/data-built="true"/g)).toHaveLength(2);
    expect(html.match(/data-done="true"/g)).toHaveLength(2);
    expect(html).not.toContain("data-hidden");
    expect(html).not.toContain("data-solo");
    expect(html).toContain("The blue vase.");
    expect(html).toContain("Desktop");
    expect(html).toContain("Phone");
    expect(html).toContain("data-scaled-stage");
  });

  it("uses no hex colours", () => {
    expect(html).not.toMatch(/#[0-9a-f]{3,6}\b/i);
  });
});

describe("FramesDemo in the browser", () => {
  let container: HTMLDivElement;
  let root: Root;
  let reduce = false;
  let ioCallbacks: ((entries: { isIntersecting: boolean; target: Element }[]) => void)[] = [];

  beforeEach(() => {
    vi.useFakeTimers();
    reduce = false;
    ioCallbacks = [];
    vi.stubGlobal("matchMedia", (q: string) => ({
      matches: reduce && q.includes("reduce"),
      addEventListener() {},
      removeEventListener() {},
    }));
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        targets: Element[] = [];
        constructor(cb: (entries: { isIntersecting: boolean; target: Element }[]) => void) {
          ioCallbacks.push((entries) => cb(entries.map((e) => ({ ...e, target: this.targets[0] }))));
        }
        observe(t: Element) {
          this.targets.push(t);
        }
        unobserve() {}
        disconnect() {}
      },
    );
    container = document.createElement("div");
    document.body.append(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const built = () => [...container.querySelectorAll("[data-built]")].length;
  const setInView = (on: boolean) => act(() => ioCallbacks.forEach((cb) => cb([{ isIntersecting: on } as never])));

  it("plays only in view and stops its timers when it leaves", () => {
    root = createRoot(container);
    act(() => root.render(createElement(FramesDemo, { subscribe })));
    expect(built()).toBe(2); // not started before it is in view
    setInView(true);
    expect(built()).toBe(0);
    expect(container.querySelector("[data-solo]")).not.toBeNull();
    act(() => vi.advanceTimersByTime(1600));
    expect(built()).toBe(1);
    act(() => vi.advanceTimersByTime(LOOP_MS - 1600 - 1));
    expect(built()).toBe(2);
    act(() => vi.advanceTimersByTime(1));
    expect(built()).toBe(0); // the next round
    setInView(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("shows the finished state with reduced motion", () => {
    reduce = true;
    root = createRoot(container);
    act(() => root.render(createElement(FramesDemo, { subscribe })));
    setInView(true);
    act(() => vi.advanceTimersByTime(LOOP_MS * 2));
    expect(built()).toBe(2);
    expect(vi.getTimerCount()).toBe(0);
  });
});
