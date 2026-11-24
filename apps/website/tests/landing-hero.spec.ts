import { describe, expect, it, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { renderToString } from "react-dom/server";

// The hero's links, logo, GitHub icon and menu button go through @docusaurus/*, which only resolves inside a
// Docusaurus build: they are replaced by plain stand-ins with the same accessible output.
vi.mock("../src/components/LandingPage/primitives/LinkTo", () => ({
  default: ({ link, newTab: _newTab, children, ...rest }: { link: { kind: string }; newTab?: boolean; children?: ReactNode }) =>
    createElement("a", { href: `#${link.kind}`, ...rest }, children),
}));
vi.mock("../src/components/Brand/BrandLogo", () => ({
  default: () => createElement("a", { href: "/", "aria-label": "upmade.io home" }),
}));
vi.mock("../src/components/Brand/Icon", () => ({
  default: ({ children }: { children?: ReactNode }) => createElement("svg", { "aria-hidden": "true" }, children),
  ArrowIcon: () => null,
  GitHubIcon: () => createElement("img", { alt: "" }),
}));
vi.mock("../src/components/Landing/MenuButton", () => ({
  default: () => createElement("button", { type: "button", "aria-label": "Toggle navigation bar" }),
}));

import Hero from "../src/components/LandingPage/sections/Hero";
import { TOOL_KEYS, TOOLS } from "../src/components/LandingPage/primitives/Toolbar";
import type { HeroSection, SectionConfig } from "../src/components/LandingPage/types";
import { infinitePage } from "../src/content/landing/infinite";

const sections: readonly SectionConfig[] = infinitePage.sections;
const config = sections.find((s): s is HeroSection => s.type === "hero")!;

describe("Hero (server output)", () => {
  const html = renderToString(createElement(Hero, { config }));

  it("renders the one h1, labelling the section, and the subtitle", () => {
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toMatch(new RegExp(`<h1[^>]*id="hero-heading"[^>]*>${config.title}</h1>`));
    expect(html).toMatch(/^<section[^>]*aria-labelledby="hero-heading"/);
    expect(html).toContain(config.subtitle);
  });

  it("names the hero nav apart from the Docusaurus navbar's \"Main\"", () => {
    expect(html).toContain('<nav class="');
    expect(html).toMatch(/<nav[^>]*aria-label="Primary"/);
    expect(html).not.toMatch(/aria-label="Main"/);
    expect(html).toMatch(/<a[^>]*aria-label="GitHub"/);
    expect(html).toContain('aria-label="Toggle navigation bar"');
  });

  it("marks the current page in the toggle", () => {
    expect(html).toMatch(/<nav[^>]*aria-label="Page version"/);
    expect(html).toMatch(/<a[^>]*aria-current="page"[^>]*>Infinite<\/a>/);
  });

  it("labels the agent from the config", () => {
    expect(html).toMatch(new RegExp(`data-agent="toolCycle"[^>]*role="img"[^>]*aria-label="${config.agent.label}"`));
  });

  it("renders the toolbar starting on cursor, with one tab stop and a name, title and aria-pressed per tool", () => {
    expect(html).toMatch(/<div[^>]*role="toolbar"[^>]*aria-label="Canvas tools"/);
    const buttons = html.match(/<button[^>]*data-tool="[^"]+"[^>]*>/g)!;
    expect(buttons).toHaveLength(config.toolbar!.tools.length);
    buttons.forEach((button, i) => {
      const { label } = TOOLS[config.toolbar!.tools[i]];
      expect(button).toContain(`aria-label="${label}"`);
      expect(button).toContain(`title="${label}"`);
      expect(button).toContain(`aria-pressed="${i === 0}"`);
      expect(button).toContain(`tabindex="${i === 0 ? 0 : -1}"`);
    });
    expect(buttons[0]).toContain('data-tool="cursor"');
  });

  it("renders the CTAs", () => {
    for (const cta of config.ctas) expect(html).toContain(cta.label);
  });
});

describe("Toolbar tools", () => {
  it("has a distinct label and an icon for every tool", () => {
    const labels = TOOL_KEYS.map((k) => TOOLS[k].label);
    expect(new Set(labels).size).toBe(TOOL_KEYS.length);
    for (const k of TOOL_KEYS) expect(TOOLS[k].icon).toBeTruthy();
  });
});
