import { describe, expect, it, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { SOCIAL_LINKS } from "../src/components/Brand/links";
import {
  externalLinkHtml,
  isExternalHref,
  toDocusaurusFooterItem,
  toLandingColumns,
  withDocsFramework,
  type FooterColumnLike,
} from "../src/components/LandingPage/chrome/LandingFooter/links";

// The footer columns as docusaurus.config.ts writes them (themeConfig.footer.links).
const COLUMNS: FooterColumnLike[] = [
  {
    title: "Documentation",
    items: [
      { label: "Getting Started", to: "/docs/react/getting-started/quick-start" },
      { label: "Examples", to: "/docs/react/examples/object-explorer" },
    ],
  },
  {
    title: "Frameworks",
    items: [
      { label: "Angular", to: "/docs/angular/getting-started/quick-start" },
      { label: "React", to: "/docs/react/getting-started/quick-start" },
      { label: "Vue", to: "/docs/vue/getting-started/quick-start" },
    ],
  },
  { title: "Community", items: SOCIAL_LINKS.map(({ label, href, rel }) => ({ label, href, rel })) },
];

// The landing footer reads the theme and site config and links through @docusaurus/*, which only resolves inside a
// Docusaurus build: plain stand-ins with the same output.
vi.mock("@docusaurus/Link", () => ({
  default: ({ to, children, ...rest }: { to: string; children?: ReactNode }) => createElement("a", { href: to, ...rest }, children),
}));
vi.mock("@docusaurus/useDocusaurusContext", () => ({
  default: () => ({ siteConfig: { customFields: { copyrightYear: 2031 } } }),
}));
vi.mock("@docusaurus/theme-common", () => ({
  useThemeConfig: () => ({ footer: { links: COLUMNS } }),
}));
vi.mock("../src/components/Brand/BrandLogo", () => ({
  default: () => createElement("a", { href: "/", "aria-label": "upmade.io home" }),
}));

import LandingFooter from "../src/components/LandingPage/chrome/LandingFooter";

describe("footer links (shared by both footers)", () => {
  it("renders external items exactly as the raw HTML the config used to hold", () => {
    for (const { label, href, rel } of SOCIAL_LINKS) {
      const before = `<a href="${href}" target="_blank" rel="${rel}" class="footer__link-item">${label}</a>`;
      expect(externalLinkHtml({ label, href, rel })).toBe(before);
      expect(toDocusaurusFooterItem({ label, href, rel })).toEqual({ html: before });
    }
  });

  it("keeps Mastodon's rel=me and defaults the rel of other external items", () => {
    const mastodon = SOCIAL_LINKS.find((l) => l.label === "Mastodon")!;
    expect(externalLinkHtml(mastodon)).toContain('rel="me noopener noreferrer"');
    expect(externalLinkHtml({ label: "A", href: "https://a.example" })).toContain('rel="noopener noreferrer"');
  });

  it("escapes labels and hrefs", () => {
    expect(externalLinkHtml({ label: "<b>&", href: 'https://a.example/?q="x"' })).toBe(
      '<a href="https://a.example/?q=&quot;x&quot;" target="_blank" rel="noopener noreferrer" class="footer__link-item">&lt;b&gt;&amp;</a>',
    );
  });

  it("leaves internal, html and className-less items alone and keeps className on converted ones", () => {
    const internal = { label: "Docs", to: "/docs/react/x" };
    const html = { html: "<b>x</b>" };
    expect(toDocusaurusFooterItem(internal)).toBe(internal);
    expect(toDocusaurusFooterItem(html)).toBe(html);
    expect(toDocusaurusFooterItem({ label: "A", href: "https://a.example", className: "c" })).toEqual({
      html: '<a href="https://a.example" target="_blank" rel="noopener noreferrer" class="footer__link-item">A</a>',
      className: "c",
    });
  });

  it("tells external hrefs from site paths", () => {
    expect(isExternalHref("https://x.com/upmade_io")).toBe(true);
    expect(isExternalHref("mailto:a@b.c")).toBe(true);
    expect(isExternalHref("//cdn.example/x")).toBe(true);
    expect(isExternalHref("/blog")).toBe(false);
  });

  it("builds the landing columns, moving only the Documentation links to the visitor's framework", () => {
    expect(withDocsFramework("/docs/react/examples/x", "vue")).toBe("/docs/vue/examples/x");
    const cols = toLandingColumns(COLUMNS, "angular");
    expect(cols.map((c) => c.title)).toEqual(["Documentation", "Frameworks", "Community"]);
    expect(cols[0].links).toEqual([
      { kind: "internal", label: "Getting Started", to: "/docs/angular/getting-started/quick-start" },
      { kind: "internal", label: "Examples", to: "/docs/angular/examples/object-explorer" },
    ]);
    expect(cols[1].links.map((l) => l.kind === "internal" && l.to)).toEqual([
      "/docs/angular/getting-started/quick-start",
      "/docs/react/getting-started/quick-start",
      "/docs/vue/getting-started/quick-start",
    ]);
    expect(cols[2].links).toHaveLength(SOCIAL_LINKS.length);
  });

  it("skips untitled columns, raw-HTML items and empty columns", () => {
    const cols = toLandingColumns([
      { title: null, items: [{ label: "A", to: "/a" }] },
      { title: "Raw", items: [{ html: "<a>x</a>" }] },
      { title: "Ok", items: [{ label: "B", href: "/b" }] },
    ]);
    expect(cols).toEqual([{ title: "Ok", links: [{ kind: "internal", label: "B", to: "/b" }] }]);
  });
});

describe("LandingFooter (server output)", () => {
  const html = renderToString(createElement(LandingFooter));

  it("is one contentinfo footer with the logo, the tagline and the meta line", () => {
    expect(html.match(/<footer\b/g)).toHaveLength(1);
    expect(html).toContain('aria-label="upmade.io home"');
    expect(html).toContain("Build infinite canvas experiences in minutes.");
    expect(html).toContain("Copyright © 2031 Upmade");
    expect(html).toContain("Open source under the MIT License");
  });

  it("renders a labelled nav with an h3 and a list per column", () => {
    for (const title of ["Documentation", "Frameworks", "Community"]) {
      expect(html).toMatch(new RegExp(`<nav[^>]*aria-label="${title}"[^>]*><h3[^>]*>${title}</h3><ul`));
    }
    expect(html.match(/<h3\b/g)).toHaveLength(3);
    expect(html.match(/<li>/g)).toHaveLength(11);
  });

  it("opens external links in a new tab with their rel and keeps internal links in the tab", () => {
    expect(html).toMatch(/<a href="https:\/\/mastodon\.social\/@upmade" target="_blank" rel="me noopener noreferrer"[^>]*>Mastodon<\/a>/);
    expect(html).toMatch(/<a href="https:\/\/x\.com\/upmade_io" target="_blank" rel="noopener noreferrer"[^>]*>X<\/a>/);
    expect(html).toMatch(/<a href="\/docs\/react\/getting-started\/quick-start" class="[^"]*">Getting Started<\/a>/);
    expect(html).not.toMatch(/href="\/docs[^"]*"[^>]*target=/);
  });
});
