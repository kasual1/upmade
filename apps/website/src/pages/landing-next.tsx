import type { ReactNode } from "react";
import Head from "@docusaurus/Head";
import LandingPage from "@site/src/components/LandingPage";
import { infinitePage } from "@site/src/content/landing/infinite";

/**
 * Temporary preview of the rebuilt "/" (the config-driven LandingPage), until the cutover (M9) deletes it. Kept out
 * of search engines (noindex here) and out of the sitemap (sitemap.ignorePatterns in docusaurus.config.ts).
 */
export default function LandingNext(): ReactNode {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <LandingPage config={infinitePage} />
    </>
  );
}
