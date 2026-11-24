/**
 * The "/" landing page ("Infinite"): its meta and its sections, in order. This is the file to edit to add, reorder,
 * hide (`hidden: true`) or change a section; see src/components/LandingPage/README.md. TypeScript checks the shape
 * (`satisfies LandingPageConfig`) and tests/landing-config.spec.ts runs validateLandingConfig on it (unique ids, one
 * hero, registered agent and media keys, docs pages that exist for every framework).
 *
 * Previewed at /landing-next/ until the cutover (M9), when src/pages/index.tsx renders it.
 */
import { REPO_URL } from "../../components/Brand/links";
import type { LandingPageConfig } from "../../components/LandingPage/types";
import { FAQ_ITEMS } from "./faq";
import { FEATURES } from "./features";
import { CODE_FRAMEWORKS } from "./frameworks";

// The title and description "/" has today (src/pages/index.tsx TITLE/DESCRIPTION), kept as they are (plan decision 4).
export const TITLE = "Upmade - Infinite Canvas Library for React, Vue & Angular";
export const DESCRIPTION =
  "Upmade helps you build infinite canvas experiences featuring real-time collaboration and high-performance drawing tools. Fully open-source and easy to integrate into React, Vue & Angular.";

export const infinitePage = {
  htmlClassName: "landing-page",
  footer: "landing",
  // no ogImage yet: the social card is not part of this effort, so the site's default image stays
  meta: { title: TITLE, description: DESCRIPTION },
  sections: [
    {
      type: "hero",
      id: "hero",
      title: "Infinite Canvas Development Kit",
      subtitle: "Easily build agentic canvas experiences with React, Vue and Angular.",
      agent: { key: "toolCycle", label: "The Upmade agent using canvas tools" },
      toolbar: { tools: ["cursor", "pen", "eraser", "arrow", "shapeRectangle", "type", "image"], syncWithAgent: true },
      nav: {
        links: [
          { label: "Blog", link: { kind: "route", to: "/blog" }, hideBelow: 620 },
          { label: "Documentation", link: { kind: "docs" }, hideBelow: 620 },
        ],
        github: { kind: "external", href: REPO_URL },
      },
      toggle: [
        { label: "Infinite", link: { kind: "route", to: "/" }, current: true },
        { label: "Agentic", link: { kind: "route", to: "/agentic" } },
      ],
      ctas: [
        { label: "Demo", link: { kind: "app" }, variant: "dark", newTab: true },
        { label: "Get started", link: { kind: "docs" }, variant: "light" },
      ],
    },
    { type: "featureGrid", id: "features", srHeading: "Features", items: FEATURES },
    {
      type: "showcase",
      id: "dom-canvas",
      heading: "DOM based canvas",
      body: "Unlike a classic HTML canvas, Upmade renders real DOM nodes. Place full HTML elements like forms, videos or entire web apps on the board, and your users can interact with them just like anywhere else on the page.",
      media: { key: "domCanvas" },
      cta: { label: "Dynamic Objects", link: { kind: "docs", path: "advanced/dynamic-objects" } },
      cornerAgent: { key: "juggler", corner: "bl", size: "l" },
    },
    {
      type: "showcase",
      id: "get-started",
      reversed: true,
      heading: "Easy to get started",
      body: "Upmade comes with detailed documentation and extensive examples to ensure a quick and effortless integration into your app.",
      media: { key: "codeTyper", props: { frameworks: CODE_FRAMEWORKS } },
      cta: { label: "Quick Start", link: { kind: "docs" } },
      cornerAgent: { key: "frameworkSign", corner: "br", size: "m" },
    },
    {
      type: "showcase",
      id: "performance",
      heading: "Optimized for performance",
      body: "Upmade is designed from the ground up to handle hundreds of objects. It only renders what is currently in the viewport, so the board stays fast as your canvas grows.",
      media: { key: "starBoard", props: { repoUrl: REPO_URL } },
      cta: { label: "Full Demo", link: { kind: "docs", path: "examples/performance-showcase" } },
      cornerAgent: { key: "cyclingGlasses", corner: "bl", size: "s" },
    },
    {
      type: "faq",
      id: "faq",
      heading: "Frequently Asked Questions",
      intro: "Answers to common questions about adopting Upmade in production projects.",
      items: FAQ_ITEMS,
      jsonLd: true,
    },
  ],
} as const satisfies LandingPageConfig;
