import { useEffect, type ReactNode } from "react";
import Layout from "@theme/Layout";
import Head from "@docusaurus/Head";
import { HtmlClassNameProvider } from "@docusaurus/theme-common";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { LandingPageProvider } from "./context";
import SectionRenderer from "./SectionRenderer";
import { buildFaqJsonLd, buildSoftwareAppJsonLd, jsonLdText } from "./seo";
import type { FaqSection, LandingPageConfig } from "./types";
import { validateLandingConfig } from "./validate";
import styles from "./LandingPage.module.css";

/**
 * A config-driven landing page (plan §3): the <html> class, the page context (read by theme/Footer), the site
 * Layout, the <Head> built from `config.meta` plus structured data, and `<main data-lp-page>` with the sections.
 */
export default function LandingPage({ config }: { config: LandingPageConfig }): ReactNode {
  const { title, description, ogImage } = config.meta;
  const pageUrl = useBaseUrl("/", { absolute: true });
  const ogImageUrl = useBaseUrl(ogImage ?? "", { absolute: true });
  const faq = config.sections.find((s): s is FaqSection => s.type === "faq" && !s.hidden && s.jsonLd === true);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const errors = validateLandingConfig(config);
    if (errors.length) console.warn(`Landing page config has problems:\n- ${errors.join("\n- ")}`);
  }, [config]);

  return (
    <HtmlClassNameProvider className={config.htmlClassName}>
      <LandingPageProvider config={config}>
        <Layout description={description}>
          <Head>
            {/* Set directly so the site-wide title is not appended to the page title. */}
            <title>{title}</title>
            <meta property="og:title" content={title} />
            <meta name="twitter:title" content={title} />
            {ogImage && <meta property="og:image" content={ogImageUrl} />}
            {ogImage && <meta name="twitter:image" content={ogImageUrl} />}
            <script type="application/ld+json">{jsonLdText(buildSoftwareAppJsonLd({ url: pageUrl, description }))}</script>
            {faq && <script type="application/ld+json">{jsonLdText(buildFaqJsonLd(faq))}</script>}
          </Head>
          <main className={styles.main} data-lp-page="">
            <SectionRenderer sections={config.sections} />
          </main>
        </Layout>
      </LandingPageProvider>
    </HtmlClassNameProvider>
  );
}
