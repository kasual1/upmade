import type { ReactNode } from "react";
import LandingPage from "@site/src/components/LandingPage";
import { agenticPage } from "@site/src/content/landing/agentic";

/**
 * "/agentic": the config-driven agentic landing page. Its sections, copy and meta live in
 * src/content/landing/agentic.ts; how to add, reorder or hide a section is in src/components/LandingPage/README.md.
 */
export default function Agentic(): ReactNode {
  return <LandingPage config={agenticPage} />;
}
