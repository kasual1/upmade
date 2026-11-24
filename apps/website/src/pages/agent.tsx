import { useState, type ReactNode } from "react";
import Layout from "@theme/Layout";
import AgentPreview from "@site/src/components/Agents/AgentPreview";
import { Bouquet, COLOURS, Hat, HAT_KINDS, SHAPES, bouquetReveal, hatSwap, idle, type Colour, type ShapeName } from "@site/src/components/Agents";
import styles from "@site/src/components/Agents/preview.module.css";

const SHAPE_COLOURS: Array<[ShapeName, Colour]> = [["squircle", "pink"], ["circle", "blue"], ["triangle", "green"], ["bullet", "yellow"], ["pill", "violet"]];

/** The hat swap, with the page keeping track of which hat is worn and which is held (as a landing section would). */
function HatSwapDemo() {
  const [worn, setWorn] = useState(0);
  const [held, setHeld] = useState(0);
  return (
    <AgentPreview
      title="Hat swap"
      shape="squircle"
      colour="violet"
      animation={hatSwap}
      items={{ worn: <Hat kind={HAT_KINDS[worn]} />, held: <Hat kind={HAT_KINDS[held]} /> }}
      onEvent={(e) => {
        if (e === "swap") setHeld((worn + 1) % HAT_KINDS.length);
        if (e === "putOn") setWorn(held);
      }}
    >
      <span>
        Wearing: <span className={styles.slot}>{HAT_KINDS[worn]}</span>. The <code>swap</code> and <code>putOn</code> events drive the hats; a landing section would switch its theme
        on <code>putOn</code>.
      </span>
    </AgentPreview>
  );
}

export default function AgentPage(): ReactNode {
  return (
    <Layout title="Agents" description="The Upmade agent family and their animations.">
      <main className={styles.page}>
        <h1>Agents</h1>
        <p className={styles.lead}>
          Every agent is one rig (a body shape, eyes and two hands) playing a declarative animation: keyframe tracks for its parts and
          the props it handles, plus events the page can react to. Pause one and drag the scrubber to inspect any moment.
        </p>

        <h2>The family</h2>
        <div className={styles.grid}>
          {SHAPE_COLOURS.map(([shape, colour]) => (
            <AgentPreview key={shape} title={`${shape}, idle`} shape={shape} colour={colour} animation={idle}>
              <span>
                <i className={styles.swatch} style={{ background: COLOURS[colour][1] }} />
                {colour}
              </span>
            </AgentPreview>
          ))}
        </div>

        <h2>Animations</h2>
        <div className={styles.grid}>
          <HatSwapDemo />
          <AgentPreview title="Bouquet reveal" shape="circle" colour="blue" animation={bouquetReveal} items={{ bouquet: <Bouquet /> }}>
            <span>Pulls flowers from behind its back and holds them up with both hands.</span>
          </AgentPreview>
          <AgentPreview title="Idle (any shape)" shape="squircle" colour="pink" animation={idle}>
            <span>{Object.keys(SHAPES).length} shapes, {Object.keys(COLOURS).length} colours.</span>
          </AgentPreview>
        </div>
      </main>
    </Layout>
  );
}
