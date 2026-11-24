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
 * The agents sit at the design's 136px (96px at 620px and below), pulled left by the design's negative margin. Some
 * placeholder agents draw past their box on the left (agents.ts `reach`), so the slot gets the agent's left reach as
 * `--reach-l`; the stylesheet uses it to nudge an agent in the first column right only as far as needed to keep its
 * drawing inside the viewport (main clips overflow-x), and leaves every other agent at the design's offset.
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
              style={{ "--reach-l": LANDING_AGENTS[item.agent.key].reach.left } as CSSProperties}
            />
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.body}>{item.body}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
