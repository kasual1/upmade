// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import StarBoard from "../src/components/LandingPage/media/StarBoard";
import {
  COAST_S,
  FAST,
  LABEL_PX,
  PITCH,
  RAMP_UP_S,
  STAR_H,
  STAR_W,
  rampFor,
  rampRate,
  starPositions,
} from "../src/components/LandingPage/media/StarBoard/board";
import { createSectionSignal } from "../src/components/LandingPage/hooks/useSectionSignal";
import { stageScale } from "../src/components/LandingPage/primitives/ScaledStage";
import { cornerGutterBottom, cornerOverhang, FREE_BELOW } from "../src/components/LandingPage/primitives/MediaFrame";
import { CORNER_OVERLAP, CORNER_SIZES, cornerOffset } from "../src/components/LandingPage/primitives/CornerAgent";
import { LANDING_AGENTS } from "../src/components/LandingPage/agents";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const REPO = "https://github.com/example/repo";

describe("star board geometry", () => {
  const stars = starPositions();

  it("covers the board in brickwork rows, with a spare column for the drift", () => {
    const rows = new Map<number, number[]>();
    for (const s of stars) rows.set(s.y, [...(rows.get(s.y) ?? []), s.x]);
    expect(rows.size).toBeGreaterThanOrEqual(8);
    const ys = [...rows.keys()].sort((a, b) => a - b);
    expect(ys[0]).toBeLessThanOrEqual(0);
    // the last row reaches (nearly) the bottom; the board is drawn scaled up 1.2x, which covers the rest
    expect(ys[ys.length - 1] + STAR_H).toBeGreaterThan(95);
    for (const xs of rows.values()) {
      expect(Math.min(...xs)).toBeLessThanOrEqual(PITCH);
      // after drifting one pitch to the left, the row still reaches the right edge
      expect(Math.max(...xs) + STAR_W - PITCH).toBeGreaterThanOrEqual(100);
    }
    // every other row is shifted by half a pitch
    const firstX = (i: number) => Math.min(...rows.get(ys[i])!);
    expect(Math.abs(firstX(1) - firstX(0))).toBeCloseTo(PITCH / 2, 5);
  });

  it("labels are a real font of 12px or more (plan §3.7)", () => {
    expect(LABEL_PX).toBeGreaterThanOrEqual(12);
  });
});

describe("drift ramps (hook point for the glasses agent)", () => {
  it("maps the glasses events, nothing else", () => {
    expect(rampFor("glassesOn")).toBe("up");
    expect(rampFor("glassesOff")).toBe("down");
    expect(rampFor("flip")).toBeNull();
  });

  it("ramps up to FAST and coasts back to 1, continuously from the current rate", () => {
    expect(rampRate("up", 1, 0)).toBe(1);
    expect(rampRate("up", 1, RAMP_UP_S)).toBe(FAST);
    expect(rampRate("up", 1, RAMP_UP_S / 2)).toBeCloseTo((1 + FAST) / 2, 5);
    expect(rampRate("down", FAST, 0)).toBe(FAST);
    expect(rampRate("down", FAST, COAST_S)).toBe(1);
    // the coast sheds most of the speed early
    expect(rampRate("down", FAST, COAST_S / 3)).toBeLessThan((FAST + 1) / 2);
    // interrupting a ramp starts from the rate it reached, no jump
    expect(rampRate("down", 12, 0)).toBe(12);
    expect(rampRate("up", 12, 10)).toBe(FAST);
  });
});

describe("ScaledStage scale", () => {
  it("shrinks to the width, never up, by default", () => {
    expect(stageScale("shrink", 280, 100, 560, 385)).toBe(0.5);
    expect(stageScale("shrink", 1120, 770, 560, 385)).toBe(1);
  });

  it("covers the box with 'cover'", () => {
    expect(stageScale("cover", 1120, 700, 560, 385)).toBe(2);
    expect(stageScale("cover", 280, 300, 560, 385)).toBeCloseTo(300 / 385, 3);
    expect(stageScale("cover", 0, 0, 560, 385)).toBe(1);
  });
});

describe("MediaFrame corner room", () => {
  it("measures the overhang from the corner offset and the agent's reach", () => {
    const o = cornerOverhang({ key: "juggler", corner: "bl", size: "l" });
    const { l } = CORNER_SIZES;
    const wide = cornerOffset("juggler", "bl", l.px), phone = cornerOffset("juggler", "bl", l.phone.px);
    expect(o.side).toBe(wide.dx + Math.ceil(LANDING_AGENTS.juggler.reach.left * l.px));
    expect(o.sidePhone).toBe(phone.dx + Math.ceil(LANDING_AGENTS.juggler.reach.left * l.phone.px));
    expect(o.bottom).toBe(wide.dy);
  });

  it.each([
    ["juggler", "bl", "l"],
    ["frameworkSign", "br", "m"],
    ["cyclingGlasses", "bl", "s"],
  ] as const)("places %s so its body overlaps the frame's corner by CORNER_OVERLAP", (key, corner, size) => {
    const body = LANDING_AGENTS[key].body!;
    for (const px of [CORNER_SIZES[size].px, CORNER_SIZES[size].phone.px]) {
      const { dx, dy } = cornerOffset(key, corner, px);
      const outer = corner === "bl" ? body.left : body.right;
      // how far the body's outer side and bottom get past the frame's side and bottom edge
      const pastSide = dx - outer * px, pastBottom = dy - body.bottom * px;
      const w = (1 - body.left - body.right) * px, h = (1 - body.top - body.bottom) * px;
      expect(pastSide).toBeCloseTo(CORNER_OVERLAP.x * w, 0);
      expect(pastBottom).toBeCloseTo(CORNER_OVERLAP.y * h, 0);
      expect(pastSide).toBeGreaterThan(0);
      expect(pastBottom).toBeGreaterThan(0);
    }
  });

  it("keeps room below only past FREE_BELOW, or the design's minimum", () => {
    const corner = { key: "cyclingGlasses", corner: "bl", size: "s" } as const;
    const o = cornerOverhang(corner);
    expect(cornerGutterBottom(corner)).toEqual({
      bottom: Math.max(0, o.bottom - FREE_BELOW),
      bottomPhone: Math.max(0, o.bottomPhone - FREE_BELOW),
      bottomSmall: Math.max(0, (o.bottomSmall ?? o.bottomPhone) - FREE_BELOW),
    });
    expect(cornerGutterBottom(corner, { bottom: 200, bottomPhone: 150 })).toEqual({ bottom: 200, bottomPhone: 150, bottomSmall: 150 });
  });

  it("shrinks the xs corner agents again at 420px and below, and their room with them", () => {
    const corner = { key: "hatSwap", corner: "bl", size: "xs" } as const;
    const o = cornerOverhang(corner);
    expect(CORNER_SIZES.xs.small!.px).toBeLessThan(CORNER_SIZES.xs.phone.px);
    expect(o.sideSmall!).toBeLessThan(o.sidePhone);
  });
});

describe("StarBoard (server output)", () => {
  const html = renderToString(createElement(StarBoard, { props: { repoUrl: REPO }, subscribe: () => () => {} }));

  it("is decorative: hidden from assistive technology, links out of the tab order", () => {
    expect(html).toMatch(/^<div[^>]*aria-hidden="true"/);
    const links = html.match(/<a [^>]*>/g) ?? [];
    expect(links.length).toBe(starPositions().length);
    for (const a of links) {
      expect(a).toContain(`href="${REPO}"`);
      expect(a).toContain('tabindex="-1"');
      expect(a).toContain('rel="noopener noreferrer"');
    }
  });
});

describe("StarBoard (client)", () => {
  type FakeAnimation = { playState: string; playbackRate: number; play(): void; pause(): void; cancel(): void; updatePlaybackRate(r: number): void };
  let animations: FakeAnimation[];
  let observers: Array<{ cb: (e: Array<{ isIntersecting: boolean; target: Element }>) => void; els: Element[] }>;
  let container: HTMLDivElement;
  let root: Root;
  let reduced = false;
  let rafs: FrameRequestCallback[];

  beforeEach(() => {
    animations = [];
    observers = [];
    rafs = [];
    reduced = false;
    (Element.prototype as unknown as { animate: unknown }).animate = function () {
      const a: FakeAnimation = {
        playState: "running",
        playbackRate: 1,
        play() {
          this.playState = "running";
        },
        pause() {
          this.playState = "paused";
        },
        cancel() {
          this.playState = "idle";
        },
        updatePlaybackRate(r) {
          this.playbackRate = r;
        },
      };
      animations.push(a);
      return a;
    };
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        els: Element[] = [];
        constructor(public cb: (e: Array<{ isIntersecting: boolean; target: Element }>) => void) {
          observers.push(this);
        }
        observe(el: Element) {
          this.els.push(el);
        }
        unobserve() {}
        disconnect() {}
      },
    );
    vi.stubGlobal("matchMedia", (q: string) => ({ matches: reduced && q.includes("reduce"), addEventListener() {}, removeEventListener() {} }));
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => rafs.push(cb));
    vi.stubGlobal("cancelAnimationFrame", () => {});
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  const view = (inView: boolean) =>
    act(() => observers.forEach((o) => o.cb(o.els.map((target) => ({ isIntersecting: inView, target })))));

  it("drifts only in view, and ramps its speed on the glasses' events", () => {
    const signal = createSectionSignal();
    act(() => root.render(createElement(StarBoard, { props: { repoUrl: REPO }, subscribe: signal.subscribe })));
    expect(animations).toHaveLength(1);
    expect(animations[0].playState).toBe("paused");
    view(true);
    expect(animations[0].playState).toBe("running");
    view(false);
    expect(animations[0].playState).toBe("paused");

    const now = vi.spyOn(performance, "now").mockReturnValue(0);
    signal.emit("glassesOn");
    const flush = (t: number) => {
      const pending = rafs;
      rafs = [];
      pending.forEach((cb) => cb(t));
    };
    flush(RAMP_UP_S * 1000);
    expect(animations[0].playbackRate).toBe(FAST);
    expect(rafs).toHaveLength(0); // the ramp ends
    now.mockReturnValue(5000);
    signal.emit("glassesOff");
    flush(5000 + COAST_S * 1000);
    expect(animations[0].playbackRate).toBe(1);
    now.mockRestore();
  });

  it("stays static with reduced motion", () => {
    reduced = true;
    act(() => root.render(createElement(StarBoard, { props: { repoUrl: REPO }, subscribe: () => () => {} })));
    view(true);
    expect(animations).toHaveLength(0);
  });
});
