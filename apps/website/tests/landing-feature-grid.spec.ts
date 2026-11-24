// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import FeatureGrid from "../src/components/LandingPage/sections/FeatureGrid";
import { LANDING_AGENTS } from "../src/components/LandingPage/agents";
import type { FeatureGridSection } from "../src/components/LandingPage/types";
import { FEATURES } from "../src/content/landing/features";

// SectionIntro pulls in Button → LinkTo → @docusaurus/* (not resolvable under vitest); the grid only uses its
// visually hidden h2, so stand in for it with that
vi.mock("../src/components/LandingPage/primitives/SectionIntro", async () => {
  const { createElement: h } = await import("react");
  return {
    default: ({ id, heading }: { id: string; heading: string }) => h("h2", { id: `${id}-heading` }, heading),
  };
});

const config: FeatureGridSection = { type: "featureGrid", id: "features", srHeading: "Features", items: FEATURES };

function render(cfg: FeatureGridSection = config): Document {
  const html = renderToString(createElement(FeatureGrid, { config: cfg }));
  return new DOMParser().parseFromString(html, "text/html");
}

describe("FeatureGrid (server output)", () => {
  it("is a section labelled by its visually hidden h2", () => {
    const doc = render();
    const section = doc.querySelector("section")!;
    expect(section.getAttribute("aria-labelledby")).toBe("features-heading");
    expect(section.getAttribute("data-section")).toBe("featureGrid");
    const h2 = doc.getElementById("features-heading")!;
    expect(h2.tagName).toBe("H2");
    expect(h2.textContent).toBe("Features");
    expect(doc.querySelectorAll("h2")).toHaveLength(1);
  });

  it("renders one article per feature with its agent, an h3 title and the copy, in config order", () => {
    const articles = [...render().querySelectorAll("article")];
    expect(articles).toHaveLength(FEATURES.length);
    articles.forEach((article, i) => {
      const feature = FEATURES[i];
      const slot = article.querySelector("[data-agent-slot]")!;
      expect(slot.getAttribute("data-agent")).toBe(feature.agent.key);
      expect(article.querySelector("h3")!.textContent).toBe(feature.title);
      expect(article.querySelector("p")!.textContent).toBe(feature.body);
      // the agent comes first, as in the design
      expect(article.firstElementChild).toBe(slot);
    });
  });

  it("keeps the agents decorative unless labelled", () => {
    const doc = render();
    for (const slot of doc.querySelectorAll("[data-agent-slot]")) {
      expect(slot.getAttribute("aria-hidden")).toBe("true");
      expect(slot.hasAttribute("role")).toBe(false);
    }
    const labelled = render({ ...config, items: [{ ...FEATURES[0], agent: { key: "key", label: "A golden key" } }] });
    const slot = labelled.querySelector("[data-agent-slot]")!;
    expect(slot.getAttribute("role")).toBe("img");
    expect(slot.getAttribute("aria-label")).toBe("A golden key");
  });

  it("passes each agent's left reach to the stylesheet", () => {
    for (const slot of render().querySelectorAll<HTMLElement>("[data-agent-slot]")) {
      const key = slot.getAttribute("data-agent") as keyof typeof LANDING_AGENTS;
      expect(slot.style.getPropertyValue("--reach-l")).toBe(String(LANDING_AGENTS[key].reach.left));
    }
  });

  it("does not server-render composite agents visibly (no misaligned rig before hydration)", () => {
    const doc = render();
    for (const slot of doc.querySelectorAll("[data-agent-slot]")) {
      const key = slot.getAttribute("data-agent") as keyof typeof LANDING_AGENTS;
      const entry = LANDING_AGENTS[key];
      if (!("composite" in entry) || !entry.composite) continue;
      const layer = slot.lastElementChild!;
      const clientOnly = "clientOnly" in entry && entry.clientOnly;
      if (clientOnly) expect(layer.childElementCount).toBe(0);
      else {
        expect(layer.className).toMatch(/pending/);
        expect(slot.querySelector("noscript")).not.toBeNull();
      }
    }
  });
});
