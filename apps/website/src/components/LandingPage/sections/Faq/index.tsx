import type { ReactNode } from "react";
import SectionIntro from "../../primitives/SectionIntro";
import SectionShell from "../../primitives/SectionShell";
import type { FaqSection } from "../../types";
import styles from "./styles.module.css";

/** Answers may hold `code` spans; render them as <code>, the rest as text. */
function renderAnswer(text: string): ReactNode[] {
  return text.split(/(`[^`]*`)/g).map((part, i) =>
    part.startsWith("`") && part.endsWith("`") && part.length > 1 ? (
      <code key={i} data-font="mono">
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    ),
  );
}

/**
 * STUB (M3; M5 owns it): the FAQ's structure, server-rendered: the h2 and intro, then each question as an h3 with
 * its answer, all shown (ids `${id}-q-${i}` / `${id}-a-${i}`). M5 turns it into the accordion (h3 > button with
 * aria-expanded/aria-controls, one open at a time, answers kept in the HTML) with the design's cards. The FAQPage
 * JSON-LD is added by LandingPage from the config.
 */
export default function Faq({ config }: { config: FaqSection }): ReactNode {
  const { id, heading, intro, items } = config;
  return (
    <SectionShell id={id} type="faq" width="narrow" innerClassName={styles.inner}>
      <SectionIntro id={id} heading={heading} body={intro} align="center" />
      <div className={styles.list}>
        {items.map((item, i) => (
          <div key={item.q} className={styles.item}>
            <h3 id={`${id}-q-${i}`} className={styles.question}>
              {item.q}
            </h3>
            <div id={`${id}-a-${i}`} role="region" aria-labelledby={`${id}-q-${i}`} className={styles.answer}>
              <p>{renderAnswer(item.a)}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
