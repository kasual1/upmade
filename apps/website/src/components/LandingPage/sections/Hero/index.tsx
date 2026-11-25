import type { ReactNode } from "react";
import AgentSlot from "../../primitives/AgentSlot";
import Button from "../../primitives/Button";
import SegmentedToggle from "../../primitives/SegmentedToggle";
import Toolbar from "../../primitives/Toolbar";
import type { HeroSection } from "../../types";
import HeroTop from "./HeroTop";
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

  return (
    <section aria-labelledby={`${id}-heading`} data-section="hero" data-section-id={id} className={styles.hero}>
      <HeroTop nav={nav} />
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
