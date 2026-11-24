/**
 * Structured data (JSON-LD) of the landing pages, built from the config (plan §3.10). Pure, so the unit tests and
 * the post-build checks can use it; LandingPage.tsx puts the results in <Head>.
 */
import { NPM_URL, REPO_URL } from "../Brand/links";
import type { FaqSection } from "./types";

/** Plain text for structured data: answers may contain `code` spans; the backticks go, the code stays. */
export function stripBackticks(text: string): string {
  return text.replace(/`([^`]*)`/g, "$1").replace(/`/g, "");
}

/** FAQPage structured data: one Question per item, with its accepted answer. */
export function buildFaqJsonLd(faq: Pick<FaqSection, "items">) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items.map((item) => ({
      "@type": "Question",
      name: stripBackticks(item.q),
      acceptedAnswer: { "@type": "Answer", text: stripBackticks(item.a) },
    })),
  };
}

export interface SoftwareAppOptions {
  /** the page's absolute URL */
  url: string;
  description: string;
  name?: string;
}

/** SoftwareApplication structured data for the library (the repository and npm package from Brand/links.ts). */
export function buildSoftwareAppJsonLd({ url, description, name = "Upmade" }: SoftwareAppOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    license: "https://opensource.org/licenses/MIT",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    sameAs: [REPO_URL, NPM_URL],
  };
}

/** JSON for an inline <script type="application/ld+json">, with `<` escaped so the text cannot close the tag. */
export function jsonLdText(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
