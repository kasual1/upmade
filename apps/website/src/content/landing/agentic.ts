/**
 * The /agentic landing page ("Agentic"): its meta and its sections, in order, after the "Agentic landing page"
 * design. Edit this file to add, reorder, hide (`hidden: true`) or change a section; see
 * src/components/LandingPage/README.md. src/pages/agentic.tsx renders it.
 */
import { REPO_URL, SKILL_INSTALL_COMMAND } from "../../components/Brand/links";
import type { LandingPageConfig } from "../../components/LandingPage/types";
import { AGENTIC_FAQ_ITEMS } from "./agentic-faq";
import { AGENTIC_FEATURES } from "./agentic-features";

// The title and description /agentic had before the rebuild, kept as they are (as for "/", plan decision 4).
export const AGENTIC_TITLE = "Upmade - Agentic Canvas Library for React, Vue & Angular";
export const AGENTIC_DESCRIPTION =
  "Upmade helps you build agentic canvas experiences featuring dynamic component rendering to power generative UI. Fully open-source and easy to integrate into React, Vue & Angular.";

export const agenticPage = {
  // "agentic-page" stays for any rule that targets the agentic page; "landing-page" keeps the navbar contract
  htmlClassName: "landing-page agentic-page",
  footer: "landing",
  meta: { title: AGENTIC_TITLE, description: AGENTIC_DESCRIPTION },
  sections: [
    {
      type: "agentHero",
      id: "hero",
      title: "Agentic Canvas Development Kit",
      subtitle: "Easily build agentic canvas experiences with React, Vue and Angular.",
      nav: {
        links: [
          { label: "Blog", link: { kind: "route", to: "/blog" }, hideBelow: 620 },
          { label: "Documentation", link: { kind: "docs" }, hideBelow: 620 },
        ],
        github: { kind: "external", href: REPO_URL },
      },
      toggle: [
        { label: "Infinite", link: { kind: "route", to: "/" } },
        { label: "Agentic", link: { kind: "route", to: "/agentic" }, current: true },
      ],
      crew: {
        center: { key: "squircle", label: "The pink Upmade agent" },
        friends: [{ key: "circle" }, { key: "triangle" }],
        back: [{ key: "pill" }, { key: "bullet" }],
      },
      chat: {
        label: "Chat with the agent",
        placeholder: "Message the agent",
        agentName: "Agent",
        demo: [
          'Add a path that says "Welcome"',
          'Add a text that says: "This is upmade.io"',
          "Generate a card to star or share upmade on GitHub",
        ],
      },
      ctas: [
        { label: "Demo", link: { kind: "app" }, variant: "dark", newTab: true },
        { label: "Get started", link: { kind: "docs" }, variant: "light" },
      ],
    },
    { type: "featureGrid", id: "features", srHeading: "Features", items: AGENTIC_FEATURES },
    {
      type: "showcase",
      id: "genui",
      heading: "Build generative UI",
      body: "Give your agent a set of ready-made components to build with. It assembles real, interactive UI right on the canvas, frame by frame, so you can watch it take shape and step in at any point.",
      media: { key: "framesDemo" },
      cta: { label: "Full Demo", link: { kind: "docs", path: "examples/generative-ui" } },
      cornerAgent: { key: "bouquetReveal", corner: "bl", size: "s" },
    },
    {
      type: "showcase",
      id: "skill",
      reversed: true,
      heading: "Agents love Upmade",
      body: "Add the Upmade skill to your coding agent, so it knows how to build and extend your canvas right away.",
      media: { key: "skillTerminal", props: { command: SKILL_INSTALL_COMMAND } },
      cta: { label: "Quick Start", link: { kind: "docs" } },
      cornerAgent: { key: "lovestruck", corner: "br", size: "s" },
    },
    {
      type: "showcase",
      id: "customizable",
      heading: "Highly customizable",
      body: "Adjust Upmade's components to fit your product, down to their fonts, icons and labels. Start from the built-in light and dark themes or create your own, so the editor looks like part of your app.",
      media: { key: "themes" },
      cta: { label: "Themes", link: { kind: "docs", path: "customization/themes" } },
      cornerAgent: { key: "hatSwap", corner: "bl", size: "s" },
    },
    {
      type: "faq",
      id: "faq",
      heading: "Frequently Asked Questions",
      intro: "Answers to common questions about building agentic canvases with Upmade.",
      items: AGENTIC_FAQ_ITEMS,
      jsonLd: true,
    },
  ],
} as const satisfies LandingPageConfig;
