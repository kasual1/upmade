// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import CodeTyper from "../src/components/LandingPage/media/CodeTyper";
import { tokenizeLine } from "../src/components/LandingPage/media/CodeTyper/highlight";
import { CODE_FONT_PX, codeScale, designFontPx } from "../src/components/LandingPage/media/CodeTyper/scale";
import {
  CHAR_MS,
  FLIP_LEAD_MS,
  HOLD_MS,
  LEAD_MS,
  LINE_MS,
  SIGN_TURNS_MS,
  computedTurnMs,
  turnMs,
  typingEnd,
  typingTimes,
} from "../src/components/LandingPage/media/CodeTyper/typing";
import { createSectionSignal, type Subscribe } from "../src/components/LandingPage/hooks/useSectionSignal";
import { CODE_FRAMEWORKS } from "../src/content/landing/frameworks";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const noSignal: Subscribe = () => () => {};

describe("tokenizeLine (the highlight tokenizer)", () => {
  it("gives every line of every snippet back, with no empty tokens", () => {
    for (const { code } of CODE_FRAMEWORKS) {
      for (const line of code.split("\n")) {
        const tokens = tokenizeLine(line);
        expect(tokens.map((t) => t.text).join("")).toBe(line);
        for (const t of tokens) expect(t.text).not.toBe("");
      }
    }
    expect(tokenizeLine("")).toEqual([]);
  });

  it("marks keywords, strings, tags and decorators", () => {
    expect(tokenizeLine("import { UpmadeEditor } from '@upmade/react-editor';")).toEqual([
      { text: "import", kind: "keyword" },
      { text: " { UpmadeEditor } " },
      { text: "from", kind: "keyword" },
      { text: " " },
      { text: "'@upmade/react-editor'", kind: "string" },
      { text: ";" },
    ]);
    expect(tokenizeLine("  return <UpmadeEditor />;")).toEqual([
      { text: "  " },
      { text: "return", kind: "keyword" },
      { text: " " },
      { text: "<UpmadeEditor", kind: "tag" },
      { text: " " },
      { text: "/>", kind: "tag" },
      { text: ";" },
    ]);
    expect(tokenizeLine('<script setup lang="ts">')).toEqual([
      { text: "<script", kind: "tag" },
      { text: " " },
      { text: "setup", kind: "keyword" },
      { text: " lang=" },
      { text: '"ts"', kind: "string" },
      { text: ">", kind: "tag" },
    ]);
    expect(tokenizeLine("@Component({")).toEqual([{ text: "@Component", kind: "decorator" }, { text: "({" }]);
    expect(tokenizeLine("  template: `<upmade-editor />`,")).toEqual([
      { text: "  template: " },
      { text: "`<upmade-editor />`", kind: "string" },
      { text: "," },
    ]);
  });

  it("highlights a string while it is being typed (no closing quote yet)", () => {
    expect(tokenizeLine("import { Component } from '@ang")).toEqual([
      { text: "import", kind: "keyword" },
      { text: " { Component } " },
      { text: "from", kind: "keyword" },
      { text: " " },
      { text: "'@ang", kind: "string" },
    ]);
  });

  it("does not mark keywords inside words", () => {
    expect(tokenizeLine("exported imports classy")).toEqual([{ text: "exported imports classy" }]);
  });
});

describe("typing timing", () => {
  it("types a character every 22 ms and a line break in 140 ms, after a 350 ms lead", () => {
    expect(typingTimes("ab\nc")).toEqual([LEAD_MS + CHAR_MS, LEAD_MS + 2 * CHAR_MS, LEAD_MS + 2 * CHAR_MS + LINE_MS, LEAD_MS + 3 * CHAR_MS + LINE_MS]);
    expect(typingEnd("")).toBe(LEAD_MS);
    expect(computedTurnMs("ab")).toBe(LEAD_MS + 2 * CHAR_MS + HOLD_MS);
  });

  it("matches the framework sign's documented turns, so the two never drift (frameworkSign.ts)", () => {
    expect(CODE_FRAMEWORKS.map((f) => f.id)).toEqual(["react", "vue", "angular"]);
    for (const f of CODE_FRAMEWORKS) expect(computedTurnMs(f.code)).toBe(SIGN_TURNS_MS[f.id]);
    expect(CODE_FRAMEWORKS.reduce((sum, f) => sum + turnMs(f), 0)).toBe(22342);
  });

  it("uses the typed length for a framework the sign does not know", () => {
    expect(turnMs({ id: "svelte", code: "abc" })).toBe(computedTurnMs("abc"));
    expect(turnMs({ id: "constructor", code: "abc" })).toBe(computedTurnMs("abc"));
  });
});

describe("code scale (plan §3.7)", () => {
  it("is a real 14px font, looking like the design's 11 to 14px", () => {
    expect(CODE_FONT_PX).toBeGreaterThanOrEqual(12);
    expect(codeScale(600)).toBe(1);
    expect(codeScale(540)).toBe(1);
    expect(codeScale(450)).toBeCloseTo(designFontPx(450) / 14, 4);
    expect(designFontPx(450)).toBeCloseTo(11.5, 5);
    expect(codeScale(258)).toBeCloseTo(11 / 14, 4);
    expect(codeScale(0)).toBe(1);
    expect(codeScale(Number.NaN)).toBe(1);
  });
});

describe("CodeTyper (server output)", () => {
  const html = renderToString(createElement(CodeTyper, { props: { frameworks: CODE_FRAMEWORKS }, subscribe: noSignal }));
  const container = document.createElement("div");
  container.innerHTML = html;
  const live = container.querySelector("[class*=live]")!;

  it("shows the React snippet fully typed, its file name and line numbers", () => {
    expect(container.querySelector("[class*=file]")?.textContent).toBe("Editor.tsx");
    const lines = [...live.querySelectorAll("[class*=line]")];
    expect(lines.map((l) => l.querySelector("[class*=number]")?.textContent)).toEqual(["1", "2", "3", "4", "5"]);
    expect(lines.map((l) => l.querySelector("[class*=text]")?.textContent).join("\n")).toBe(CODE_FRAMEWORKS[0].code);
    // the caret, blinking (not typing), after the last line
    expect(lines[4].querySelector("[class*=caret]")?.className).toMatch(/blink/);
    expect(live.querySelectorAll("[class*=caret]")).toHaveLength(1);
  });

  it("is decorative, with the React snippet as text for screen readers and search engines", () => {
    expect(container.querySelector("[class*=window]")?.getAttribute("aria-hidden")).toBe("true");
    const figure = container.querySelector("figure")!;
    expect(figure.closest("[aria-hidden]")).toBeNull();
    expect(figure.querySelector("figcaption")?.textContent).toBe("React quick start, Editor.tsx:");
    expect(figure.querySelector("code")?.textContent).toBe(CODE_FRAMEWORKS[0].code);
  });

  it("reserves the height of every snippet (invisible copies)", () => {
    const ghosts = [...container.querySelectorAll("[class*=ghost]")];
    expect(ghosts.map((g) => [...g.querySelectorAll("[class*=text]")].map((l) => l.textContent).join("\n"))).toEqual(
      CODE_FRAMEWORKS.map((f) => f.code),
    );
  });

  it("marks every element holding code text as mono", () => {
    for (const el of container.querySelectorAll("[class*=window] span, [class*=window] div")) {
      if ([...el.childNodes].some((n) => n.nodeType === 3 && n.textContent)) expect(el.getAttribute("data-font")).toBe("mono");
    }
  });
});

describe("CodeTyper (client)", () => {
  /** every stub observer ever made (useInView shares one per set of options across tests) */
  const observers: Array<{ cb: (e: Array<{ isIntersecting: boolean; target: Element }>) => void; els: Element[] }> = [];
  let container: HTMLDivElement;
  let root: Root;
  let reduced = false;

  beforeEach(() => {
    reduced = false;
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance", "Date"] });
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

  const view = (inView: boolean) =>
    act(() => observers.forEach((o) => o.cb(o.els.map((target) => ({ isIntersecting: inView, target })))));
  const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));
  const file = () => container.querySelector("[class*=file]")?.textContent;
  const typed = () =>
    [...container.querySelectorAll("[class*=live] [class*=text]")].map((l) => l.textContent).join("\n");
  const caret = () => container.querySelector("[class*=live] [class*=caret]")!.className;

  const mount = (subscribe: Subscribe = noSignal) =>
    act(() => root.render(createElement(CodeTyper, { props: { frameworks: CODE_FRAMEWORKS }, subscribe })));

  it("waits until in view, then types each framework on the sign's turns", () => {
    mount();
    advance(20000);
    expect(file()).toBe("Editor.tsx");
    expect(typed()).toBe(CODE_FRAMEWORKS[0].code);

    view(true);
    expect(typed()).toBe("");
    expect(caret()).not.toMatch(/blink/);
    advance(LEAD_MS + CHAR_MS);
    expect(typed()).toBe("i");
    advance(typingEnd(CODE_FRAMEWORKS[0].code) - LEAD_MS - CHAR_MS);
    expect(typed()).toBe(CODE_FRAMEWORKS[0].code);
    advance(100);
    expect(caret()).toMatch(/blink/);

    advance(SIGN_TURNS_MS.react - typingEnd(CODE_FRAMEWORKS[0].code) - 100 - 1);
    expect(file()).toBe("Editor.tsx");
    advance(1);
    expect(file()).toBe("Editor.vue");
    expect(typed()).toBe("");
    advance(SIGN_TURNS_MS.vue);
    expect(file()).toBe("editor.component.ts");
    advance(SIGN_TURNS_MS.angular - 1);
    expect(typed()).toBe(CODE_FRAMEWORKS[2].code);
    advance(1);
    expect(file()).toBe("Editor.tsx");
  });

  it("stops out of view and restarts the current framework when back", () => {
    mount();
    view(true);
    advance(SIGN_TURNS_MS.react + 1000);
    expect(file()).toBe("Editor.vue");
    const before = typed();
    view(false);
    advance(30000);
    expect(file()).toBe("Editor.vue");
    expect(typed()).toBe(before);
    view(true);
    expect(typed()).toBe("");
    expect(file()).toBe("Editor.vue");
  });

  it("hands the clock to the sign once it flips (the hook point)", () => {
    const signal = createSectionSignal();
    mount(signal.subscribe);
    view(true);
    advance(2000);
    signal.emit("flip");
    advance(FLIP_LEAD_MS - 1);
    expect(file()).toBe("Editor.tsx");
    advance(1);
    expect(file()).toBe("Editor.vue");
    // no turn timer of its own any more: it waits for the next flip
    advance(60000);
    expect(file()).toBe("Editor.vue");
    expect(typed()).toBe(CODE_FRAMEWORKS[1].code);
    signal.emit("glassesOn");
    advance(1000);
    expect(file()).toBe("Editor.vue");
    signal.emit("flip");
    advance(FLIP_LEAD_MS);
    expect(file()).toBe("editor.component.ts");
  });

  it("shows the React snippet still with reduced motion", () => {
    reduced = true;
    mount();
    view(true);
    advance(30000);
    expect(file()).toBe("Editor.tsx");
    expect(typed()).toBe(CODE_FRAMEWORKS[0].code);
  });
});
