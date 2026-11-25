/**
 * The section types a landing page config can use, by `type`. A static map (no require.context): renders on the
 * server, works on any bundler. `satisfies` makes a missing or mistyped entry fail the typecheck, so a new section
 * type in types.ts cannot be forgotten here.
 */
import type { ComponentType } from "react";
import type { SectionConfig, SectionType } from "./types";
import Hero from "./sections/Hero";
import AgentHero from "./sections/AgentHero";
import FeatureGrid from "./sections/FeatureGrid";
import Showcase from "./sections/Showcase";
import Faq from "./sections/Faq";

export type SectionComponent<T extends SectionType> = ComponentType<{ config: Extract<SectionConfig, { type: T }> }>;

export const SECTIONS = {
  hero: Hero,
  agentHero: AgentHero,
  featureGrid: FeatureGrid,
  showcase: Showcase,
  faq: Faq,
} satisfies { [T in SectionType]: SectionComponent<T> };
