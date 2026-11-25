// @vitest-environment jsdom
/**
 * M11 (plan §3.5): the agents wired to their sections. The data the pairings rely on is checked against the real
 * animations (the agents stream is authoritative), and each pairing's behaviour is driven with a section signal:
 * the sign → the code typer, the glasses → the star board, the toolCycle agent ↔ the hero toolbar.
 */
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from "vitest";
import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

// Docusaurus-only modules, replaced by plain stand-ins (as in landing-hero.spec.ts)
vi.mock("../src/components/Brand/Icon", () => ({
  default: ({ children }: { children?: ReactNode }) => createElement("svg", { "aria-hidden": "true" }, children),
  ArrowIcon: () => null,
  GitHubIcon: () => null,
}));
vi.mock("../src/components/LandingPage/primitives/LinkTo", () => ({
  default: ({ link, newTab: _newTab, children, ...rest }: { link: { kind: string }; newTab?: boolean; children?: ReactNode }) =>
    createElement("a", { href: `#${link.kind}`, ...rest }, children),
}));
vi.mock("../src/components/LandingPage/sections/Hero/HeroTop", () => ({ default: () => null }));
// the hero's agent: records what the hero passes it (the real one plays only in a browser)
const slot: { onEvent?: (name: string) => void; start?: number; rate?: number } = {};
vi.mock("../src/components/LandingPage/primitives/AgentSlot", () => ({
  default: (props: typeof slot) => {
    slot.onEvent = props.onEvent;
    slot.start = props.start;
    slot.rate = props.rate;
    return createElement("div", { "data-agent-slot": "" });
  },
}));

import * as animations from "../src/components/Agents/animations";
import type { AgentAnimation } from "../src/components/Agents/types";
import { AGENT_EVENTS, SIGN_FRAMEWORKS } from "../src/components/LandingPage/agents";
import { TOOL_START, TOSS_RATE, TOSS_TOOL, toolOfEvent } from "../src/components/LandingPage/toolCycle";
import { TOOL_KEYS } from "../src/components/LandingPage/primitives/Toolbar/tools";
import Toolbar from "../src/components/LandingPage/primitives/Toolbar";
import Hero from "../src/components/LandingPage/sections/Hero";
import CodeTyper from "../src/components/LandingPage/media/CodeTyper";
import StarBoard from "../src/components/LandingPage/media/StarBoard";
import { COAST_S, GLASSES_ON_MAX_S } from "../src/components/LandingPage/media/StarBoard/board";
import { FLIP_LEAD_MS, SIGN_TURNS_MS, typingEnd } from "../src/components/LandingPage/media/CodeTyper/typing";
import { createSectionSignal } from "../src/components/LandingPage/hooks/useSectionSignal";
import { CODE_FRAMEWORKS } from "../src/content/landing/frameworks";
import { infinitePage } from "../src/content/landing/infinite";
import type { HeroSection, SectionConfig } from "../src/components/LandingPage/types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const byKey = animations as unknown as Record<string, AgentAnimation | undefined>;
const sign = animations.frameworkSign;
const flipTimes = (sign.events ?? []).filter(([, n]) => n === "flip").map(([t]) => t);

describe("the pairings' data, against the real animations", () => {
  it("AGENT_EVENTS lists exactly the events each pairing agent's animation emits", () => {
    for (const [key, names] of Object.entries(AGENT_EVENTS)) {
      const emitted = [...new Set((byKey[key]?.events ?? []).map(([, n]) => n))].sort();
      expect([...names].sort(), key).toEqual(emitted);
    }
  });

  it("TOOL_START is each tool's tool:* event time, for every toolbar tool, in the toolbar's order", () => {
    const events = new Map((animations.toolCycle.events ?? []).map(([t, n]) => [n, t]));
    for (const tool of TOOL_KEYS) expect(TOOL_START[tool], tool).toBe(events.get(`tool:${tool}`));
    expect(TOOL_START.cursor).toBe(0);
    const starts = TOOL_KEYS.map((t) => TOOL_START[t]!);
    expect(starts).toEqual([...starts].sort((a, b) => a - b));
    expect(TOOL_START).toMatchInlineSnapshot(`
      {
        "arrow": 10530,
        "cursor": 0,
        "eraser": 7380,
        "image": 22890,
        "pen": 3600,
        "shapeRectangle": 14330,
        "type": 18810,
      }
    `);
    expect(TOOL_KEYS).toContain(TOSS_TOOL);
    expect(TOSS_RATE).toBe(4);
    expect(toolOfEvent("tool:pen")).toBe("pen");
    expect(toolOfEvent("flip")).toBeNull();
  });

  it("the sign's flip comes FLIP_LEAD_MS before the next framework's turn, and the sign starts on React", () => {
    const ends = SIGN_FRAMEWORKS.reduce<number[]>((acc, id) => [...acc, (acc.at(-1) ?? 0) + SIGN_TURNS_MS[id]], []);
    expect(ends.at(-1)).toBe(sign.duration);
    expect(flipTimes).toHaveLength(ends.length);
    flipTimes.forEach((t, k) => expect(ends[k] - t, `flip ${k}`).toBe(FLIP_LEAD_MS));
    expect(SIGN_FRAMEWORKS[0]).toBe("react");
  });

  it("the code typer's snippets come in the sign's order", () => {
    expect(CODE_FRAMEWORKS.map((f) => f.id)).toEqual([...SIGN_FRAMEWORKS]);
  });
});

/** every stub observer ever made (useInView shares one per set of options across tests) */
const observers: Array<{ cb: (e: Array<{ isIntersecting: boolean; target: Element }>) => void; els: Element[] }> = [];

/** a stub IntersectionObserver class; `view` reports every observed element as in or out of view */
function stubObservers() {
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
      unobserve(el: Element) {
        this.els = this.els.filter((e) => e !== el);
      }
      disconnect() {}
    },
  );
  return (inView: boolean) =>
    act(() => observers.forEach((o) => o.cb(o.els.map((target) => ({ isIntersecting: inView, target })))));
}

let container: HTMLDivElement;
let root: Root;
let reduced = false;
let view: (inView: boolean) => void;

beforeEach(() => {
  reduced = false;
  view = stubObservers();
  vi.stubGlobal("matchMedia", (q: string) => ({ matches: reduced && q.includes("reduce"), addEventListener() {}, removeEventListener() {} }));
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("the sign drives the code typer", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance", "Date"] });
  });
  const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));
  const file = () => container.querySelector("[class*=file]")?.textContent;
  const typed = () => [...container.querySelectorAll("[class*=live] [class*=text]")].map((l) => l.textContent).join("\n");
  const fileOf = (id: string) => CODE_FRAMEWORKS.find((f) => f.id === id)!.file;
  const mount = (subscribe = createSectionSignal().subscribe) =>
    act(() => root.render(createElement(CodeTyper, { props: { frameworks: CODE_FRAMEWORKS }, subscribe })));

  it("shows the sign's framework through three loops, flip by flip", () => {
    const signal = createSectionSignal();
    mount(signal.subscribe);
    view(true);
    let now = 0;
    let shown = 0; // the sign's framework
    for (let loop = 0; loop < 3; loop++) {
      for (const t of flipTimes) {
        const at = loop * sign.duration + t;
        advance(at - now - 1);
        now = at - 1;
        expect(file(), `before flip at ${at}`).toBe(fileOf(SIGN_FRAMEWORKS[shown]));
        advance(1);
        now = at;
        act(() => signal.emit("flip"));
        shown = (shown + 1) % SIGN_FRAMEWORKS.length;
        advance(FLIP_LEAD_MS);
        now += FLIP_LEAD_MS;
        expect(file(), `after flip at ${at}`).toBe(fileOf(SIGN_FRAMEWORKS[shown]));
        expect(typed()).toBe("");
      }
    }
  });

  it("counts the flips made while it is off screen, and comes back on the sign's framework", () => {
    const signal = createSectionSignal();
    mount(signal.subscribe);
    view(true);
    advance(1000);
    view(false);
    act(() => signal.emit("flip"));
    act(() => signal.emit("flip"));
    advance(5000);
    expect(file()).toBe(fileOf("react"));
    view(true);
    expect(file()).toBe(fileOf("angular"));
    expect(typed()).toBe("");
  });

  it("runs its own clock until the sign's first flip on each visit, and keeps typing when it got there first", () => {
    const signal = createSectionSignal();
    mount(signal.subscribe);
    view(true);
    // no flip (the agent is not playing yet): the documented turns
    advance(SIGN_TURNS_MS.react + 500);
    expect(file()).toBe(fileOf("vue"));
    const before = typed();
    expect(before.length).toBeGreaterThan(0);
    // the sign starts late and flips to Vue: already showing it, so no restart
    act(() => signal.emit("flip"));
    advance(FLIP_LEAD_MS + 100);
    expect(file()).toBe(fileOf("vue"));
    expect(typed().startsWith(before)).toBe(true);
    // from now on the sign is the clock: nothing moves on without a flip
    advance(60000);
    expect(file()).toBe(fileOf("vue"));
    expect(typed()).toBe(CODE_FRAMEWORKS[1].code);
    // a new visit with the agent still away: the fallback clock again
    view(false);
    view(true);
    expect(typed()).toBe("");
    advance(SIGN_TURNS_MS.vue);
    expect(file()).toBe(fileOf("angular"));
  });

  it("stays on the full React snippet with reduced motion, flips or not", () => {
    reduced = true;
    const signal = createSectionSignal();
    mount(signal.subscribe);
    view(true);
    act(() => signal.emit("flip"));
    advance(30000);
    expect(file()).toBe(fileOf("react"));
    expect(typed()).toBe(CODE_FRAMEWORKS[0].code);
    expect(typingEnd(CODE_FRAMEWORKS[0].code)).toBeLessThan(SIGN_TURNS_MS.react);
  });
});

describe("the glasses drive the star board", () => {
  it("coasts back by itself when glassesOff never comes", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    let rafs: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => rafs.push(cb));
    vi.stubGlobal("cancelAnimationFrame", () => {});
    const anim = { playbackRate: 1, play() {}, pause() {}, cancel() {}, updatePlaybackRate(r: number) { this.playbackRate = r; } };
    const proto = Element.prototype as unknown as { animate: unknown };
    const original = proto.animate;
    proto.animate = () => anim;
    onTestFinished(() => {
      proto.animate = original;
    });
    const flush = (t: number) => {
      const pending = rafs;
      rafs = [];
      pending.forEach((cb) => cb(t));
    };
    const now = vi.spyOn(performance, "now").mockReturnValue(0);
    const signal = createSectionSignal();
    act(() => root.render(createElement(StarBoard, { props: { repoUrl: "https://example.com" }, subscribe: signal.subscribe })));
    view(true);
    act(() => signal.emit("glassesOn"));
    flush(2000);
    expect(anim.playbackRate).toBe(30);
    now.mockReturnValue(GLASSES_ON_MAX_S * 1000);
    act(() => vi.advanceTimersByTime(GLASSES_ON_MAX_S * 1000));
    flush(GLASSES_ON_MAX_S * 1000 + (COAST_S * 1000) / 2);
    expect(anim.playbackRate).toBeGreaterThan(1);
    expect(anim.playbackRate).toBeLessThan(30);
    flush(GLASSES_ON_MAX_S * 1000 + COAST_S * 1000);
    expect(anim.playbackRate).toBe(1);
    now.mockRestore();
  });
});

describe("the toolCycle agent ↔ the toolbar", () => {
  const pressed = () => container.querySelector('[aria-pressed="true"]')?.getAttribute("data-tool");
  const tabStop = () => container.querySelector('[role=toolbar] [tabindex="0"]')?.getAttribute("data-tool");
  const click = (tool: string) => act(() => (container.querySelector(`[data-tool="${tool}"]`) as HTMLButtonElement).click());
  const agent = (name: string) => act(() => slot.onEvent?.(name));
  const hero = (infinitePage.sections as readonly SectionConfig[]).find((s): s is HeroSection => s.type === "hero")!;
  const mountHero = () => act(() => root.render(createElement(Hero, { config: hero })));

  it("Toolbar: the agent's tool events select, and the tab stop stays where the keyboard user is", () => {
    const signal = createSectionSignal();
    act(() => root.render(createElement(Toolbar, { tools: TOOL_KEYS, subscribe: signal.subscribe })));
    expect(pressed()).toBe("cursor");
    act(() => signal.emit("tool:pen"));
    expect(pressed()).toBe("pen");
    expect(tabStop()).toBe("pen");
    act(() => signal.emit("tool:hand"));
    act(() => signal.emit("flip"));
    expect(pressed()).toBe("pen");
    const cursor = container.querySelector('[data-tool="cursor"]') as HTMLButtonElement;
    act(() => cursor.focus());
    act(() => signal.emit("tool:eraser"));
    expect(pressed()).toBe("eraser");
    expect(tabStop()).toBe("cursor");
    act(() => cursor.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })));
    expect(document.activeElement?.getAttribute("data-tool")).toBe("pen");
    act(() => (document.activeElement as HTMLElement).blur());
    expect(tabStop()).toBe("eraser");
  });

  it("Hero: the toolbar follows the agent, and a click jumps the agent to the tool's turn", () => {
    mountHero();
    expect(pressed()).toBe("cursor");
    expect(slot.start).toBeUndefined();
    agent("tool:pen");
    expect(pressed()).toBe("pen");
    click("type");
    expect(pressed()).toBe("type");
    expect(slot.start).toBeCloseTo(TOOL_START.type!, 2);
    expect(slot.rate).toBe(1);
    // the tool of the agent's turn: nothing to do
    const start = slot.start;
    click("type");
    expect(slot.start).toBe(start);
    // the same turn again, after the loop moved on: a restart all the same
    agent("tool:image");
    click("type");
    expect(slot.start).not.toBe(start);
    expect(slot.start).toBeCloseTo(TOOL_START.type!, 2);
  });

  it("Hero: a click while the arrow is in the air finishes the catch at 4x, then jumps", () => {
    mountHero();
    agent("tool:arrow");
    expect(pressed()).toBe("arrow");
    click("image");
    expect(pressed()).toBe("image");
    expect(slot.rate).toBe(TOSS_RATE);
    expect(slot.start).toBeUndefined();
    click("eraser"); // changes where it goes, still finishing the catch
    expect(slot.rate).toBe(TOSS_RATE);
    agent("tool:shapeRectangle"); // the arrow is put away
    expect(slot.rate).toBe(1);
    expect(slot.start).toBeCloseTo(TOOL_START.eraser!, 2);
    expect(pressed()).toBe("eraser");
    // the next tool events select again
    agent("tool:arrow");
    expect(pressed()).toBe("arrow");
    // clicked the tool that comes next anyway: no jump, just back to normal speed
    const start = slot.start;
    click("shapeRectangle");
    expect(slot.rate).toBe(TOSS_RATE);
    agent("tool:shapeRectangle");
    expect(slot.rate).toBe(1);
    expect(slot.start).toBe(start);
    expect(pressed()).toBe("shapeRectangle");
  });

  it("Hero with reduced motion: cursor stays selected, a click only selects", () => {
    reduced = true;
    mountHero();
    expect(pressed()).toBe("cursor");
    click("pen");
    expect(pressed()).toBe("pen");
    expect(slot.start).toBeUndefined();
    expect(slot.rate).toBe(1);
  });
});
