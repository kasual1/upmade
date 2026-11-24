import { createContext, useContext, type ReactNode } from "react";
import type { LandingPageConfig } from "./types";

export interface LandingPageContextValue {
  config: LandingPageConfig;
  /** which footer this page wants (config.footer), for theme/Footer */
  footer: LandingPageConfig["footer"];
}

export const LandingPageContext = createContext<LandingPageContextValue | null>(null);

/** Makes the page's config available below it, including to the theme's Footer (rendered inside <Layout>). */
export function LandingPageProvider({ config, children }: { config: LandingPageConfig; children: ReactNode }): ReactNode {
  return <LandingPageContext.Provider value={{ config, footer: config.footer }}>{children}</LandingPageContext.Provider>;
}

/** The current landing page's config and footer choice, or `null` outside a landing page (docs, blog...). */
export function useLandingPage(): LandingPageContextValue | null {
  return useContext(LandingPageContext);
}
