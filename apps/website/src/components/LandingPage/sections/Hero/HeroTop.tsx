import { useRef, type ReactNode } from "react";
import clsx from "clsx";
import BrandLogo from "../../../Brand/BrandLogo";
import MenuButton from "../../../Landing/MenuButton";
import { useHeroNavObserver } from "../../hooks/useHeroNavObserver";
import LinkTo from "../../primitives/LinkTo";
import type { HeroSection } from "../../types";
import styles from "./styles.module.css";

/**
 * A hero's own header (design L398-402), shared by the `hero` and `agentHero` sections: the logo, the nav links, the
 * GitHub link and, at 620px and below, the menu button. The site navbar stays hidden while it is on screen
 * (useHeroNavObserver, plan 3.6). Its nav is named "Primary", so it does not share "Main" with the Docusaurus navbar.
 */
export default function HeroTop({ nav }: { nav: HeroSection["nav"] }): ReactNode {
  const headerRef = useRef<HTMLElement>(null);
  useHeroNavObserver(headerRef);
  return (
    <header ref={headerRef} className={styles.top}>
      <BrandLogo size={38} />
      <nav className={styles.nav} aria-label="Primary">
        {nav.links.map((item) => (
          <LinkTo key={item.label} link={item.link} className={clsx(styles.navLink, item.hideBelow === 620 && styles.hidePhone)}>
            {item.label}
          </LinkTo>
        ))}
        <LinkTo link={nav.github} aria-label="GitHub" title="GitHub" className={styles.navIcon}>
          <GitHubMark />
        </LinkTo>
        <span className={styles.menu}>
          <MenuButton />
        </span>
      </nav>
    </header>
  );
}

/** The design's GitHub mark, inline and painted with currentColor so it follows the link colour. */
function GitHubMark(): ReactNode {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.7 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"
      />
    </svg>
  );
}
