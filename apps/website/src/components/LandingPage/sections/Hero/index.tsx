import { useRef, type ReactNode } from "react";
import clsx from "clsx";
import BrandLogo from "../../../Brand/BrandLogo";
import { GitHubIcon } from "../../../Brand/Icon";
import { useHeroNavObserver } from "../../hooks/useHeroNavObserver";
import AgentSlot from "../../primitives/AgentSlot";
import Button from "../../primitives/Button";
import LinkTo from "../../primitives/LinkTo";
import SegmentedToggle from "../../primitives/SegmentedToggle";
import Toolbar from "../../primitives/Toolbar";
import type { HeroSection } from "../../types";
import styles from "./styles.module.css";

/**
 * STUB (M3; M7 owns it): the hero's structure, rendered on the server from the config: header (logo, nav, GitHub),
 * page toggle, the h1 and subtitle, the toolCycle agent, the toolbar and the CTAs. The header drives the navbar
 * contract (useHeroNavObserver), so the site navbar appears once it scrolls out. M7 adds the design's styling, the
 * MenuButton below 620px, and the toolbar's jump to a tool's turn.
 */
export default function Hero({ config }: { config: HeroSection }): ReactNode {
  const { id, nav, toggle, title, subtitle, agent, toolbar, ctas } = config;
  const headerRef = useRef<HTMLElement>(null);
  useHeroNavObserver(headerRef);

  return (
    <section aria-labelledby={`${id}-heading`} data-section="hero" data-section-id={id} className={styles.hero}>
      <header ref={headerRef} className={styles.top}>
        <BrandLogo size={38} />
        <nav className={styles.nav} aria-label="Main">
          {nav.links.map((item) => (
            <LinkTo key={item.label} link={item.link} className={clsx(styles.navLink, item.hideBelow === 620 && styles.hidePhone)}>
              {item.label}
            </LinkTo>
          ))}
          <LinkTo link={nav.github} aria-label="GitHub" className={styles.navLink}>
            <GitHubIcon size={24} />
          </LinkTo>
        </nav>
      </header>
      <div className={styles.copy}>
        {toggle && <SegmentedToggle items={toggle} />}
        <h1 id={`${id}-heading`} className={styles.title}>
          {title}
        </h1>
        <p className={styles.subtitle}>{subtitle}</p>
        <AgentSlot agent={agent.key} label={agent.label} className={styles.agent} />
        {toolbar && <Toolbar tools={toolbar.tools} />}
        <div className={styles.ctas}>
          {ctas.map((cta) => (
            <Button key={cta.label} cta={cta} />
          ))}
        </div>
      </div>
    </section>
  );
}
