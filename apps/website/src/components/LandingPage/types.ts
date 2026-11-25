/**
 * The config types of a landing page (plan §3.2). A page is a JSX-free data object (content/landing/*.ts) of these
 * types; adding, reordering or hiding a section means editing that object. Arrays are readonly so configs can be
 * written `as const satisfies LandingPageConfig`.
 */
import type { AgentKey } from "./agents";
import type { MediaKey, MediaPropsMap } from "./media/manifest";
import type { ToolKey } from "./primitives/Toolbar/tools";

export type { AgentKey } from "./agents";
export type { MediaKey, MediaPropsMap } from "./media/manifest";
export type { ToolKey } from "./primitives/Toolbar/tools";

export type LinkRef =
  | { kind: "docs"; path?: string } // → /docs/<preferred framework>/<path> (the quick start without a path)
  | { kind: "app"; path?: string } // the hosted app (useAppUrl)
  | { kind: "route"; to: string } // a page of this site, baseUrl-aware
  | { kind: "external"; href: string };

export interface Cta {
  label: string;
  link: LinkRef;
  variant?: "dark" | "light";
  newTab?: boolean;
}

/** An agent by key (LandingPage/agents.ts); without a label it is decorative (aria-hidden). */
export interface AgentRef {
  key: AgentKey;
  label?: string;
}

/** `id` is unique on the page; element ids derive from it: `${id}-heading`, and `${id}-q-${i}` / `${id}-a-${i}`. */
interface Base<T extends string> {
  type: T;
  id: string;
  hidden?: boolean;
}

export interface HeroSection extends Base<"hero"> {
  nav: { links: readonly { label: string; link: LinkRef; hideBelow?: 620 }[]; github: LinkRef };
  toggle?: readonly { label: string; link: LinkRef; current?: boolean }[];
  title: string;
  subtitle: string;
  agent: AgentRef & { key: "toolCycle" };
  toolbar?: { tools: readonly ToolKey[]; syncWithAgent: boolean };
  ctas: readonly Cta[];
}

/**
 * The agentic hero (the "Agentic" design): the same header, toggle, h1, subtitle and CTAs as `hero`, but a crew of
 * agents and a chat box instead of the toolCycle agent and toolbar. The chat drives a mocked canvas: the `demo`
 * prompts are typed into the box one after the other and run when sent (the agent's cursor draws, types and
 * generates objects); visitors can also type their own (the component understands a few commands: notes, frames,
 * arrows, text, "Welcome", the GitHub card, "clear").
 */
export interface AgentHeroSection extends Base<"agentHero"> {
  nav: HeroSection["nav"];
  toggle?: HeroSection["toggle"];
  title: string;
  subtitle: string;
  crew: {
    /** the agent in the middle; it morphs into the chat agent's cursor */
    center: AgentRef;
    /** the two friends just behind it, left and right */
    friends: readonly [AgentRef, AgentRef];
    /** the two smaller ones a row further back, left and right */
    back: readonly [AgentRef, AgentRef];
  };
  chat: {
    /** the chat box's accessible label */
    label: string;
    placeholder?: string;
    /** the name on the agent's cursor label */
    agentName: string;
    /** the scripted prompts, in order */
    demo: readonly string[];
  };
  ctas: readonly Cta[];
}

export interface FeatureGridSection extends Base<"featureGrid"> {
  srHeading: string;
  items: readonly { title: string; body: string; agent: AgentRef }[];
}

export type ShowcaseSection = {
  [K in MediaKey]: Base<"showcase"> & {
    heading: string;
    body: string;
    cta?: Cta;
    reversed?: boolean;
    media: { key: K; props?: MediaPropsMap[K] };
    cornerAgent?: AgentRef & { corner: "bl" | "br"; size?: "s" | "m" | "l" };
  };
}[MediaKey];

export interface FaqSection extends Base<"faq"> {
  heading: string;
  intro?: string;
  /** answers may contain `code` spans (backticks), nothing else */
  items: readonly { q: string; a: string }[];
  /** add FAQPage structured data for this section */
  jsonLd?: boolean;
}

export type SectionConfig = HeroSection | AgentHeroSection | FeatureGridSection | ShowcaseSection | FaqSection;
export type SectionType = SectionConfig["type"];

export interface LandingPageConfig {
  /** the <html> class; "landing-page" keeps the navbar.css contract (hidden navbar until the hero scrolls out) */
  htmlClassName: string;
  meta: { title: string; description: string; ogImage?: string };
  /** which footer theme/Footer renders on this page (read from LandingPageContext) */
  footer: "landing" | "docusaurus";
  sections: readonly SectionConfig[];
}
