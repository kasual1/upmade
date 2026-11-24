import { useRef, type ReactNode } from "react";
import clsx from "clsx";
import BrandLogo from "../../../Brand/BrandLogo";
import MenuButton from "../../../Landing/MenuButton";
import { useHeroNavObserver } from "../../hooks/useHeroNavObserver";
import AgentSlot from "../../primitives/AgentSlot";
import Button from "../../primitives/Button";
import LinkTo from "../../primitives/LinkTo";
import SegmentedToggle from "../../primitives/SegmentedToggle";
import Toolbar from "../../primitives/Toolbar";
import type { HeroSection } from "../../types";
import styles from "./styles.module.css";

/**
 * The hero (design L398-425): the page's own header (logo, nav links, GitHub, and the menu button at 620px and
 * below), the page toggle, the server-rendered h1 and subtitle, the toolCycle agent, the editor toolbar and the CTAs.
 *
 * - Navbar contract (plan 3.6): the site navbar stays hidden while `header.top` is on screen (useHeroNavObserver);
 *   the legacy MenuButton opens the navbar's mobile sidebar meanwhile (`data-hero-menu`, css/navbar.css).
 * - The hero nav is named "Primary", so it does not share the name "Main" with the Docusaurus navbar's nav.
 * - Per plan §0 the toolbar is not synced to the agent yet: it starts on its first tool ("cursor") and a click only
 *   selects. `toolbar.syncWithAgent` is the hook point for M11.
 */
export default function Hero({ config }: { config: HeroSection }): ReactNode {
  const { id, nav, toggle, title, subtitle, agent, toolbar, ctas } = config;
  const headerRef = useRef<HTMLElement>(null);
  useHeroNavObserver(headerRef);

  return (
    <section aria-labelledby={`${id}-heading`} data-section="hero" data-section-id={id} className={styles.hero}>
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
      <div className={styles.copy}>
        {toggle && <SegmentedToggle items={toggle} />}
        <h1 id={`${id}-heading`} className={styles.title}>
          {title}
        </h1>
        <p className={styles.subtitle}>{subtitle}</p>
        <AgentSlot agent={agent.key} label={agent.label} className={styles.agent} />
        {toolbar && <Toolbar tools={toolbar.tools} className={styles.toolbar} />}
        <div className={styles.ctas}>
          {ctas.map((cta) => (
            <Button key={cta.label} cta={cta} />
          ))}
        </div>
      </div>
    </section>
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
