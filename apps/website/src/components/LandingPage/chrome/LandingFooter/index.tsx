import type { ReactNode } from "react";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useThemeConfig } from "@docusaurus/theme-common";
import { usePreferredFramework } from "../../../../utils/frameworkPreference";
import BrandLogo from "../../../Brand/BrandLogo";
import { toLandingColumns, type FooterColumnLike, type LandingFooterLink } from "./links";
import styles from "./styles.module.css";

export interface LandingFooterProps {
  /** the line under the logo */
  tagline?: string;
  /** the right-hand text of the meta line */
  license?: string;
}

const DEFAULT_TAGLINE = "Build infinite canvas experiences in minutes.";

function FooterLink({ link }: { link: LandingFooterLink }): ReactNode {
  if (link.kind === "internal") {
    return (
      <Link to={link.to} className={styles.link}>
        {link.label}
      </Link>
    );
  }
  return (
    <a href={link.href} target="_blank" rel={link.rel} className={styles.link}>
      {link.label}
    </a>
  );
}

/**
 * The landing pages' footer from the design (.foot, L517-524): the logo with the pink agent and a tagline, the link
 * columns of themeConfig.footer.links (the one source, shared with the Docusaurus footer) and the meta line. Rendered
 * by the swizzled theme/Footer, instead of the Docusaurus footer, on pages whose config says `footer: "landing"`.
 */
export default function LandingFooter({ tagline = DEFAULT_TAGLINE }: LandingFooterProps): ReactNode {
  const { footer } = useThemeConfig();
  const { siteConfig } = useDocusaurusContext();
  // The Documentation links follow the visitor's framework after mount (React on the server and at hydration).
  const framework = usePreferredFramework();
  const columns = toLandingColumns((footer?.links ?? []) as readonly FooterColumnLike[], framework);
  // Fixed at build time in docusaurus.config.ts, so the server and the client agree on it.
  const year = siteConfig.customFields?.copyrightYear;

  return (
    <footer className={styles.foot}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <BrandLogo size={52} textSize={30} className={styles.logo} />
          <p className={styles.tagline}>{tagline}</p>
        </div>
        {columns.length > 0 && (
          <div className={styles.cols}>
            {columns.map((column) => (
              <nav key={column.title} className={styles.col} aria-label={column.title}>
                <h3 className={styles.heading}>{column.title}</h3>
                <ul className={styles.list}>
                  {column.links.map((link) => (
                    <li key={`${link.label} ${link.kind === "internal" ? link.to : link.href}`}>
                      <FooterLink link={link} />
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        )}
      </div>
      <div className={styles.meta}>
        <span>{typeof year === "number" || typeof year === "string" ? `Copyright © ${year} Upmade` : "Copyright © Upmade"}</span>
      </div>
    </footer>
  );
}
