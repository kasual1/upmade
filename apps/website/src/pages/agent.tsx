import { useState, type ReactNode } from "react";
import Layout from "@theme/Layout";
import { Agent, Bouquet, Hat, HAT_KINDS, bouquetReveal, hatSwap, idle, type AgentProps, type Colour, type ShapeName } from "@site/src/components/Agents";
import styles from "@site/src/components/Agents/preview.module.css";

const FAMILY: Array<[ShapeName, Colour]> = [["squircle", "pink"], ["circle", "blue"], ["triangle", "green"], ["bullet", "yellow"], ["pill", "violet"]];

function Item({ label, ...agent }: AgentProps & { label: string }) {
  return (
    <figure className={styles.item}>
      <Agent {...agent} className={styles.agent} />
      <figcaption className={styles.label}>{label}</figcaption>
    </figure>
  );
}

/** The page keeps track of which hat is worn and which is held, driven by the animation's events. */
function HatSwap() {
  const [worn, setWorn] = useState(0);
  const [held, setHeld] = useState(0);
  return (
    <Item
      label="Hat swap"
      shape="squircle"
      colour="violet"
      animation={hatSwap}
      items={{ worn: <Hat kind={HAT_KINDS[worn]} />, held: <Hat kind={HAT_KINDS[held]} /> }}
      onEvent={(e) => {
        if (e === "swap") setHeld((worn + 1) % HAT_KINDS.length);
        if (e === "putOn") setWorn(held);
      }}
    />
  );
}

export default function AgentPage(): ReactNode {
  return (
    <Layout title="Agents" description="The Upmade agent family and their animations.">
      <main className={styles.page}>
        <h1>Agents</h1>
        <div className={styles.grid}>
          {FAMILY.map(([shape, colour]) => (
            <Item key={shape} label={shape} shape={shape} colour={colour} animation={idle} />
          ))}
          <HatSwap />
          <Item label="Bouquet" shape="circle" colour="blue" animation={bouquetReveal} items={{ bouquet: <Bouquet /> }} />
        </div>
      </main>
    </Layout>
  );
}
