import type { ReactNode } from "react";
import AgentSlot from "../../primitives/AgentSlot";
import Button from "../../primitives/Button";
import SegmentedToggle from "../../primitives/SegmentedToggle";
import type { AgentHeroSection } from "../../types";
import HeroTop from "../Hero/HeroTop";
import heroStyles from "../Hero/styles.module.css";
import styles from "./styles.module.css";

/**
 * The agentic hero (the "Agentic" design). STUB: header, toggle, h1, subtitle, the crew and CTAs; the chat box and
 * the mocked canvas come next.
 */
export default function AgentHero({ config }: { config: AgentHeroSection }): ReactNode {
  const { id, nav, toggle, title, subtitle, crew, chat, ctas } = config;
  return (
    <section aria-labelledby={`${id}-heading`} data-section="agentHero" data-section-id={id} className={heroStyles.hero}>
      <HeroTop nav={nav} />
      <div className={heroStyles.copy}>
        {toggle && <SegmentedToggle items={toggle} />}
        <h1 id={`${id}-heading`} className={heroStyles.title}>
          {title}
        </h1>
        <p className={heroStyles.subtitle}>{subtitle}</p>
        <div className={styles.crew}>
          {[crew.back[0], crew.friends[0], crew.center, crew.friends[1], crew.back[1]].map((a, i) => (
            <AgentSlot key={i} agent={a.key} label={a.label} className={styles.member} />
          ))}
        </div>
        <form className={styles.chat} aria-label={chat.label} onSubmit={(e) => e.preventDefault()}>
          <input aria-label={chat.label} placeholder={chat.placeholder} />
        </form>
        <div className={heroStyles.ctas}>
          {ctas.map((cta) => (
            <Button key={cta.label} cta={cta} />
          ))}
        </div>
      </div>
    </section>
  );
}
