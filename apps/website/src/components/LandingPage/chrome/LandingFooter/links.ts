// The footer link data, shared by both footers: the landing footer (LandingFooter) and the Docusaurus footer's
// Links swizzle (src/theme/Footer/Links). The one source is themeConfig.footer.links in docusaurus.config.ts. Pure
// (no @docusaurus/* or @site/* imports), so tests/landing-footer.spec.ts can import it directly.

/** A footer link item as docusaurus.config.ts writes it. `rel` is a custom field (Docusaurus allows unknown keys). */
export interface FooterLinkItemLike {
  label?: string;
  to?: string;
  href?: string;
  html?: string;
  rel?: unknown;
  className?: string;
  [key: string]: unknown;
}

export interface FooterColumnLike {
  title: string | null;
  items: readonly FooterLinkItemLike[];
}

/** A link of the landing footer: internal (`to`, a site route) or external (`href`, opened in a new tab). */
export type LandingFooterLink =
  | { kind: "internal"; label: string; to: string }
  | { kind: "external"; label: string; href: string; rel: string };

export interface LandingFooterColumn {
  title: string;
  links: LandingFooterLink[];
}

/** The rel of an external footer link that does not set its own. */
export const DEFAULT_EXTERNAL_REL = "noopener noreferrer";

const EXTERNAL = /^([a-z][a-z\d+.-]*:|\/\/)/i;

/** Whether a footer href leaves the site (has a scheme or is protocol relative). */
export function isExternalHref(href: string): boolean {
  return EXTERNAL.test(href);
}

function relOf(item: FooterLinkItemLike): string {
  return typeof item.rel === "string" && item.rel.trim() ? item.rel : DEFAULT_EXTERNAL_REL;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * The Docusaurus footer's markup for an external `{label, href, rel?}` item: a new-tab link with the item's rel and
 * no external-link icon. This is exactly the raw HTML the config used to hold, so the sitewide footer is unchanged.
 */
export function externalLinkHtml(item: { label: string; href: string; rel?: unknown }): string {
  return (
    `<a href="${escapeHtml(item.href)}" target="_blank" rel="${escapeHtml(relOf(item))}" class="footer__link-item">` +
    `${escapeHtml(item.label)}</a>`
  );
}

/**
 * The item as the Docusaurus footer renders it: external `href` items become the raw-HTML link of externalLinkHtml
 * (keeping `className`); everything else is returned as it is.
 */
export function toDocusaurusFooterItem<T extends FooterLinkItemLike>(item: T): T | { html: string; className?: string } {
  if (item.html || !item.href || !item.label || !isExternalHref(item.href)) return item;
  const html = externalLinkHtml({ label: item.label, href: item.href, rel: item.rel });
  return item.className ? { html, className: item.className } : { html };
}

/** A docs path moved to another framework (/docs/react/x → /docs/vue/x); other paths are returned unchanged. */
export function withDocsFramework(path: string, framework: string): string {
  return path.replace(/\/docs\/(angular|react|vue)\//, `/docs/${framework}/`);
}

/**
 * The landing footer's columns from themeConfig.footer.links: titled columns with label + to/href items. Raw-HTML
 * items, untitled columns and empty columns are left out (the landing footer has no place for them). Links of the
 * "Documentation" column follow the visitor's framework, as in the Docusaurus footer.
 */
export function toLandingColumns(columns: readonly FooterColumnLike[], framework = "react"): LandingFooterColumn[] {
  const out: LandingFooterColumn[] = [];
  for (const column of columns) {
    if (!column.title) continue;
    const links: LandingFooterLink[] = [];
    for (const item of column.items) {
      if (item.html || !item.label) continue;
      if (item.to) {
        const to = column.title === "Documentation" ? withDocsFramework(item.to, framework) : item.to;
        links.push({ kind: "internal", label: item.label, to });
      } else if (item.href) {
        links.push(
          isExternalHref(item.href)
            ? { kind: "external", label: item.label, href: item.href, rel: relOf(item) }
            : { kind: "internal", label: item.label, to: item.href },
        );
      }
    }
    if (links.length) out.push({ title: column.title, links });
  }
  return out;
}
