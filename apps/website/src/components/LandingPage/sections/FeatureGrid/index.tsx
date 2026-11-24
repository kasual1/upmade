import type { ReactNode } from "react";
import AgentSlot from "../../primitives/AgentSlot";
import SectionIntro from "../../primitives/SectionIntro";
import SectionShell from "../../primitives/SectionShell";
import type { FeatureGridSection } from "../../types";
import styles from "./styles.module.css";

/**
 * STUB (M3; M4 owns it): the feature grid's structure, server-rendered from the config: a visually hidden h2, then
 * one article per feature with its agent, an h3 title and the copy. M4 adds the design's styling and checks the
 * agents at every width.
 */
export default function FeatureGrid({ config }: { config: FeatureGridSection }): ReactNode {
  const { id, srHeading, items } = config;
  return (
    <SectionShell id={id} type="featureGrid" space="xl">
      <SectionIntro id={id} heading={srHeading} visuallyHidden />
      <div className={styles.grid}>
        {items.map((item) => (
          <article key={item.title} className={styles.feature}>
            <AgentSlot agent={item.agent.key} label={item.agent.label} className={styles.agent} />
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.body}>{item.body}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
