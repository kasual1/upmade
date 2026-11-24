import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
// SectionIntro's Button links through @docusaurus/*, which only resolves inside a Docusaurus build; the FAQ has no CTA.
vi.mock("../src/components/LandingPage/primitives/Button", () => ({
  default: () => null,
}));

import Faq from "../src/components/LandingPage/sections/Faq";
import type { FaqSection } from "../src/components/LandingPage/types";

const config: FaqSection = {
  type: "faq",
  id: "faq",
  heading: "Questions",
  intro: "Intro",
  items: [
    { q: "One?", a: "Use `isWatermarkVisible` to hide it." },
    { q: "Two?", a: "Plain <answer>." },
  ],
};

describe("Faq (server output)", () => {
  const html = renderToString(createElement(Faq, { config }));

  it("renders every question as h3 > button, closed, controlling its answer", () => {
    for (const i of [0, 1]) {
      expect(html).toMatch(new RegExp(`<h3[^>]*><button[^>]*id="faq-q-${i}"`));
      const button = html.match(
        new RegExp(`<button[^>]*id="faq-q-${i}"[^>]*>`),
      )![0];
      expect(button).toContain('type="button"');
      expect(button).toContain('aria-expanded="false"');
      expect(button).toContain(`aria-controls="faq-a-${i}"`);
    }
  });

  it("renders every answer in the HTML as an inert region labelled by its button", () => {
    for (const i of [0, 1]) {
      const region = html.match(
        new RegExp(`<div[^>]*id="faq-a-${i}"[^>]*>`),
      )![0];
      expect(region).toContain('role="region"');
      expect(region).toContain(`aria-labelledby="faq-q-${i}"`);
      expect(region).toMatch(/\binert=""/);
    }
    expect(html).toContain("Plain &lt;answer&gt;.");
  });

  it("renders code spans as mono <code> and nothing else as markup", () => {
    expect(html).toMatch(
      /<code[^>]*data-font="mono"[^>]*>isWatermarkVisible<\/code>/,
    );
    expect(html).not.toContain("`");
  });

  it("labels the section with its h2", () => {
    expect(html).toContain('aria-labelledby="faq-heading"');
    expect(html).toMatch(/<h2[^>]*id="faq-heading"/);
  });
});
