// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import Themes from "../src/components/LandingPage/media/Themes";
import { createThemeClock } from "../src/components/LandingPage/media/Themes/clock";
import {
  FALLBACK_AFTER_MS,
  HAT_LOOP_MS,
  MORPH_MS,
  STAGE_H,
  STAGE_W,
  THEME_KEYS,
  THEME_VARS,
  THEMES,
  cq,
  nextTheme,
  themeAfterPutOns,
  themeVars,
} from "../src/components/LandingPage/media/Themes/themes";
import { MEDIA_MANIFEST } from "../src/components/LandingPage/media/manifest";
import { hatSwap } from "../src/components/Agents/animations";
import { HAT_KINDS } from "../src/components/Agents/props/Hat";

const CSS = fs.readFileSync(path.join(__dirname, "../src/components/LandingPage/media/Themes/styles.module.css"), "utf8");

const COLOR = /^(#[0-9a-f]{6}|rgba\(\d+, \d+, \d+, (0|1|0?\.\d+)\))$/i;
const LENGTH = /^-?\d+(\.\d+)?px$/;

describe("theme table", () => {
  it("has one theme per hat, in the hat-swapping agent's order", () => {
    expect(THEMES.length).toBe(HAT_KINDS.length);
    expect(THEMES[0].name).toMatch(/light/);
  });

  it("gives every theme every value, each of its registered type", () => {
    for (const theme of THEMES) {
      for (const key of THEME_KEYS) {
        const value = theme[key];
        const { syntax } = THEME_VARS[key];
        if (syntax === "<color>") expect(value, `${theme.name} ${key}`).toMatch(COLOR);
        else if (syntax === "<length>") expect(value, `${theme.name} ${key}`).toMatch(LENGTH);
        else expect(value, `${theme.name} ${key}`).toMatch(/^(\d+(\.\d+)?px|\d+%)$/);
      }
    }
  });

  it("turns the design's cqw of the 605px stage into px", () => {
    expect(STAGE_W).toBe(605);
    expect(STAGE_H).toBeCloseTo(415.94, 2);
    expect(cq(0.55)).toBe("3.328px");
    expect(cq(2.8)).toBe("16.94px");
    expect(cq(0)).toBe("0px");
  });

  it("maps a theme to its custom properties", () => {
    const vars = themeVars(THEMES[1]);
    expect(Object.keys(vars)).toHaveLength(THEME_KEYS.length);
    expect(vars["--theme-canvas"]).toBe("#141416");
    expect(vars["--theme-send-radius"]).toBe("50%");
    expect(Object.keys(vars).every((name) => name.startsWith("--theme-"))).toBe(true);
  });

  it("wraps around", () => {
    expect(nextTheme(0)).toBe(1);
    expect(nextTheme(THEMES.length - 1)).toBe(0);
    expect(themeAfterPutOns(0)).toBe(0);
    expect(themeAfterPutOns(1)).toBe(1);
    expect(themeAfterPutOns(THEMES.length + 2)).toBe(2);
  });
});

describe("styles", () => {
  it("registers and transitions every theme value, with its syntax", () => {
    for (const { name, syntax } of Object.values(THEME_VARS)) {
      expect(CSS, name).toMatch(new RegExp(`@property ${name} \\{ syntax: "${syntax}";`));
      const transitioned = CSS.match(/transition-property:([^;]+);/)![1].split(",").map((s) => s.trim());
      expect(transitioned, name).toContain(name);
    }
    expect(CSS).toContain(`--themes-morph: ${MORPH_MS / 1000}s`);
  });

  it("has no hex colours (they are theme data) and turns the transitions off for reduced motion", () => {
    expect(CSS).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(CSS).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.root \{\s*transition: none;/);
  });

  it("keeps the prompt a real font of 12px or more (plan §3.7)", () => {
    const size = Number(CSS.match(/\.prompt \{[^}]*font-size: ([\d.]+)px/)![1]);
    expect(size).toBeGreaterThanOrEqual(12);
  });
});

describe("clock", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("follows the agent's putOn events, from the hat agent's loop", () => {
    expect(HAT_LOOP_MS).toBe(hatSwap.duration);
    expect(hatSwap.events?.some(([, name]) => name === "putOn")).toBe(true);
    expect(MEDIA_MANIFEST.themes.listens).toEqual(["putOn"]);
  });

  it("wears the next theme on each putOn and runs no fallback while they arrive", () => {
    const apply = vi.fn();
    const clock = createThemeClock(apply);
    clock.setActive(true);
    for (let n = 1; n <= 7; n++) {
      vi.advanceTimersByTime(HAT_LOOP_MS);
      clock.putOn();
      expect(clock.index).toBe(n % THEMES.length);
    }
    expect(apply.mock.calls.map(([i]) => i)).toEqual([1, 2, 3, 4, 0, 1, 2]);
    clock.dispose();
  });

  it("moves on by itself after 1.5 loops without a putOn, one theme per loop, until one arrives", () => {
    const apply = vi.fn();
    const clock = createThemeClock(apply);
    clock.setActive(true);
    vi.advanceTimersByTime(FALLBACK_AFTER_MS - 1);
    expect(apply).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(clock.index).toBe(1);
    vi.advanceTimersByTime(HAT_LOOP_MS);
    expect(clock.index).toBe(2);
    // an event stops the fallback and wears the agent's hat (its first putOn: the second theme)
    clock.putOn();
    expect(clock.index).toBe(1);
    vi.advanceTimersByTime(FALLBACK_AFTER_MS - 1);
    expect(clock.index).toBe(1);
    clock.dispose();
  });

  it("only runs the fallback while on screen", () => {
    const apply = vi.fn();
    const clock = createThemeClock(apply);
    vi.advanceTimersByTime(FALLBACK_AFTER_MS * 3);
    expect(apply).not.toHaveBeenCalled();
    clock.setActive(true);
    vi.advanceTimersByTime(FALLBACK_AFTER_MS);
    clock.setActive(false);
    vi.advanceTimersByTime(HAT_LOOP_MS * 5);
    expect(apply.mock.calls).toEqual([[1]]);
    // disposed for good
    clock.dispose();
    clock.setActive(true);
    vi.advanceTimersByTime(FALLBACK_AFTER_MS * 3);
    expect(apply.mock.calls).toEqual([[1]]);
  });
});

describe("server output", () => {
  const html = renderToString(createElement(Themes, { subscribe: () => () => {} }));

  it("is decorative and wears the first theme", () => {
    expect(html).toMatch(/^<div[^>]*aria-hidden="true"/);
    for (const [name, value] of Object.entries(themeVars(THEMES[0]))) expect(html).toContain(`${name}:${value}`);
  });

  it("draws the workspace manager, the more menu and the chat box on a 605px stage", () => {
    expect(html).toContain("--stage-w:605px");
    expect(html).toContain("Describe what to build…");
    expect(html.match(/<svg/g)).toHaveLength(4);
  });
});
