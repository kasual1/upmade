import { useState, type ReactNode } from "react";
import Agent, { type AgentProps } from "./Agent";
import styles from "./preview.module.css";

/** One animation in the preview page: the agent, a play/pause button and a scrubber over its loop. */
export default function AgentPreview({ title, children, ...agent }: AgentProps & { title: string; children?: ReactNode }) {
  const [scrub, setScrub] = useState<number | undefined>(undefined);
  const duration = agent.animation?.duration ?? 1000;
  return (
    <figure className={styles.card}>
      <div className={styles.stage}>
        <Agent {...agent} time={scrub} className={styles.agent} />
      </div>
      <figcaption className={styles.caption}>
        <strong>{title}</strong>
        {children}
        <div className={styles.controls}>
          <button type="button" className={styles.button} onClick={() => setScrub(scrub === undefined ? 0 : undefined)}>
            {scrub === undefined ? "Pause" : "Play"}
          </button>
          <input
            type="range"
            min={0}
            max={duration}
            step={10}
            value={scrub ?? 0}
            onChange={(e) => setScrub(Number(e.target.value))}
            aria-label={`${title}: time in the loop`}
            className={styles.range}
          />
          <output className={styles.time}>{scrub === undefined ? "playing" : `${scrub} ms`}</output>
        </div>
      </figcaption>
    </figure>
  );
}
