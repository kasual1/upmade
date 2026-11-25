import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

// The swizzled theme/Footer decides which footer a page gets. Its @docusaurus/* and @theme-original/* imports only
// resolve inside a Docusaurus build, so they (and the two footers) are stand-ins marked by a data attribute.
let pathname = "/";
vi.mock("@docusaurus/router", () => ({ useLocation: () => ({ pathname }) }));
vi.mock("@docusaurus/useBaseUrl", () => ({ default: (p: string) => p }));
vi.mock("@theme-original/Footer", () => ({ default: () => createElement("footer", { "data-footer": "docusaurus" }) }));
vi.mock("@site/src/components/Brand/Wordmark", () => ({ default: () => createElement("span", { "data-wordmark": "" }) }));
vi.mock("@site/src/components/LandingPage/chrome/LandingFooter", () => ({
  default: () => createElement("footer", { "data-footer": "landing" }),
}));
vi.mock("@site/src/components/LandingPage/context", async () => await import("../src/components/LandingPage/context"));

import FooterWrapper from "../src/theme/Footer";
import { LandingPageProvider } from "../src/components/LandingPage/context";
import type { LandingPageConfig } from "../src/components/LandingPage/types";

const page = (footer: LandingPageConfig["footer"]): LandingPageConfig => ({
  htmlClassName: "landing-page",
  meta: { title: "t", description: "d" },
  footer,
  sections: [],
});

function render(path: string, footer?: LandingPageConfig["footer"]): string {
  pathname = path;
  const el = createElement(FooterWrapper);
  return renderToString(footer ? createElement(LandingPageProvider, { config: page(footer), children: el }) : el);
}

const footers = (html: string) => [...html.matchAll(/data-footer="(\w+)"/g)].map((m) => m[1]);

describe("theme/Footer: exactly one footer per page type", () => {
  it("landing pages with footer: landing get only the landing footer", () => {
    expect(footers(render("/", "landing"))).toEqual(["landing"]);
    expect(render("/", "landing")).not.toContain("data-wordmark");
  });

  it("landing pages with footer: docusaurus keep the Docusaurus footer", () => {
    expect(footers(render("/", "docusaurus"))).toEqual(["docusaurus"]);
  });

  it("the blog gets the landing footer (no wordmark), other pages the Docusaurus footer, and docs none", () => {
    for (const path of ["/blog/", "/blog/2026/11/01/agentic-canvas/", "/blog/archive/"]) {
      expect(footers(render(path)), path).toEqual(["landing"]);
      expect(render(path)).not.toContain("data-wordmark");
    }
    // a page outside the landing kit and the blog (no landing config): the Docusaurus footer
    expect(footers(render("/license/"))).toEqual(["docusaurus"]);
    expect(render("/docs/react/getting-started/quick-start")).toBe("");
  });
});
