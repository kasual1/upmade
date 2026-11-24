import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import clsx from "clsx";
import { LANDING_AGENTS, reachPadding, type AgentEventName, type AgentKey } from "../../agents";
import styles from "./styles.module.css";

export interface AgentSlotProps<K extends AgentKey = AgentKey> {
  /** which agent (see LandingPage/agents.ts) */
  agent: K;
  /**
   * makes the agent meaningful to screen readers with this label (`true` uses the agent's own label from
   * agents.ts); without it the agent is decorative and hidden from assistive technology
   */
  label?: string | true;
  /** sets the slot's size: the agent's box. The demo fills it */
  className?: string;
  style?: CSSProperties;
  /**
   * reserves room around the box for how far the drawing reaches past it (agents.ts `reach`), so a parent that
   * clips, or a neighbour, does not cut it off: the agent's size in px, and whether the room is padding (the
   * default: the slot grows) or margin
   */
  reach?: { size: number; as?: "padding" | "margin" };
  /**
   * Hook point, not wired yet: the agent's events (agents.ts `AGENT_EVENTS`) will be delivered here once the final
   * agents forward them (plan §0, M11). Today's /agent demos do not, so this is never called.
   */
  onEvent?: (name: AgentEventName<K>) => void;
}

/** Shows the composite agents' layers when scripts are off (they are only positioned for show after mounting). */
const NOSCRIPT_REVEAL = `.${styles.pending}{visibility:visible!important}`;

/**
 * Renders a landing agent by key: the existing /agent demo, as it is, in a `position: relative` box marked with
 * `data-agent-slot` and `data-agent`.
 *
 * - The demos take only `className`, so the slot gives the demo a class that makes it fill the slot, and the caller
 *   sizes the slot.
 * - Composite agents (several stacked <Agent>s, and devices) are hidden until mounted, so the server-rendered layers
 *   never flash misaligned; a <noscript> rule shows them when scripts are off.
 * - Decorative unless labelled: `aria-hidden` on the slot, or, with a label, `role="img"` with that label and the
 *   demo itself hidden from assistive technology (the demos set labels of their own, which would otherwise win or
 *   be read twice; the toolCycle demo's changes with every tool).
 */
export default function AgentSlot<K extends AgentKey>({ agent, label, className, style, reach }: AgentSlotProps<K>): ReactNode {
  const entry = LANDING_AGENTS[agent];
  const composite = "composite" in entry && entry.composite === true;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const pending = composite && !mounted;
  const name = label === true ? entry.label : label;
  const { Component } = entry;
  return (
    <div
      className={clsx(styles.slot, className)}
      style={reach ? { ...reachPadding(agent, reach.size, reach.as), ...style } : style}
      data-agent-slot=""
      data-agent={agent}
      {...(name ? { role: "img", "aria-label": name } : { "aria-hidden": true })}
    >
      {pending && (
        <noscript>
          <style>{NOSCRIPT_REVEAL}</style>
        </noscript>
      )}
      <div className={clsx(styles.layer, pending && styles.pending)} aria-hidden={name ? true : undefined}>
        <Component className={styles.demo} />
      </div>
    </div>
  );
}
