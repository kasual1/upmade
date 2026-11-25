import type { ReactNode } from "react";
import BrandLogo from "../Brand/BrandLogo";
import { REPO_URL } from "../Brand/links";
import LinkTo from "../LandingPage/primitives/LinkTo";
import styles from "./BlogHeader.module.css";

/**
 * The blog's header, as the landing pages' (sections/Hero/HeroTop): the logo with the pink agent, the nav links and
 * GitHub. It replaces the Docusaurus navbar on blog pages (theme/Navbar), so there is no mobile menu: on phones the
 * two links stay, set smaller.
 */
export default function BlogHeader(): ReactNode {
  return (
    <header className={styles.top}>
      <BrandLogo size={38} />
      <nav className={styles.nav} aria-label="Primary">
        <LinkTo link={{ kind: "route", to: "/blog" }} className={styles.link}>
          Blog
        </LinkTo>
        <LinkTo link={{ kind: "docs" }} className={styles.link}>
          {/* "Docs" on the smallest phones, so the header fits; only one of the two is ever displayed */}
          <span className={styles.long}>Documentation</span>
          <span className={styles.short}>Docs</span>
        </LinkTo>
        <a href={REPO_URL} aria-label="GitHub" title="GitHub" className={styles.icon} target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" width={24} height={24} aria-hidden="true" focusable="false">
            <path
              fill="currentColor"
              d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.7 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"
            />
          </svg>
        </a>
      </nav>
    </header>
  );
}
