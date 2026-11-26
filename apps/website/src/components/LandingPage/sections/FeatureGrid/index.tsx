import type { CSSProperties, ReactNode } from "react";
import { LANDING_AGENTS } from "../../agents";
import AgentSlot from "../../primitives/AgentSlot";
import SectionIntro from "../../primitives/SectionIntro";
import SectionShell from "../../primitives/SectionShell";
import type { FeatureGridSection } from "../../types";
import styles from "./styles.module.css";

/**
 * The feature grid (the design's .features, L427-437): a visually hidden h2, then one <article> per feature with its
 * agent (decorative unless the config labels it), an h3 title and the copy. 3/2/1 columns at 960/620px.
 *
 * The agents sit at the design's 136px (96px at 620px and below). Each drawing starts somewhere else inside its box,
 * so the slot gets where its left edge is (agents.ts `bodyLeft`) as `--body-l`, and the stylesheet moves the box left
 * by that much: every agent's left edge lines up with its title's.
 */
export default function FeatureGrid({ config }: { config: FeatureGridSection }): ReactNode {
  const { id, srHeading, items } = config;
  return (
    <SectionShell id={id} type="featureGrid" space="xl" className={styles.section}>
      <SectionIntro id={id} heading={srHeading} visuallyHidden />
      <div className={styles.grid}>
        {items.map((item) => (
          <article key={item.title} className={styles.feature}>
            <AgentSlot
              agent={item.agent.key}
              label={item.agent.label}
              className={styles.agent}
              style={{ "--body-l": LANDING_AGENTS[item.agent.key].bodyLeft ?? 0 } as CSSProperties}
            />
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.body}>{item.body}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
