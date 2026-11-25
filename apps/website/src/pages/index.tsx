import type { ReactNode } from "react";
import LandingPage from "@site/src/components/LandingPage";
import { infinitePage } from "@site/src/content/landing/infinite";

/**
 * "/": the config-driven landing page. Its sections, copy and meta live in src/content/landing/infinite.ts; how to
 * add, reorder or hide a section is in src/components/LandingPage/README.md.
 */
export default function Home(): ReactNode {
  return <LandingPage config={infinitePage} />;
}
