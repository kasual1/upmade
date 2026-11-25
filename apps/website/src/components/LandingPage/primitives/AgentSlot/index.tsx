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
   * the agent's animation events (agents.ts `AGENT_EVENTS`), for a section to pair the agent with its media (plan
   * §3.5). Only the demos that forward them call it (toolCycle, frameworkSign, cyclingGlasses, hatSwap,
   * bouquetReveal, lovestruck). It runs inside the agent's frame, in `flushSync` after the demo's own state update:
   * react imperatively (a section signal), not with React state where it can be avoided
   */
  onEvent?: (name: AgentEventName<K>) => void;
  /** where the agent's loop starts, in ms; changing it restarts the loop there (e.g. a jump to a tool's turn) */
  start?: number;
  /** the agent's playback speed (1 by default); changing it does not restart the loop */
  rate?: number;
}

/** Shows the composite agents' layers when scripts are off (they are only positioned for show after mounting). */
const NOSCRIPT_REVEAL = `.${styles.pending}{visibility:visible!important}`;

/**
 * Renders a landing agent by key: the existing /agent demo, as it is, in a `position: relative` box marked with
 * `data-agent-slot` and `data-agent`.
 *
 * - The slot gives the demo a class that makes it fill the slot, and the caller sizes the slot. `onEvent`, `start`
 *   and `rate` go to the demo as they are (the demos that pair with a section forward them to their <Agent>).
 * - Composite agents (several stacked <Agent>s, and devices) are hidden until mounted, so the server-rendered layers
 *   never flash misaligned; a <noscript> rule shows them when scripts are off.
 * - `clientOnly` agents (agents.ts) render nothing inside the box until mounted, because their server HTML cannot
 *   hydrate; the box keeps its size, so nothing shifts.
 * - Decorative unless labelled: `aria-hidden` on the slot, or, with a label, `role="img"` with that label and the
 *   demo itself hidden from assistive technology (the demos set labels of their own, which would otherwise win or
 *   be read twice; the toolCycle demo's changes with every tool).
 */
export default function AgentSlot<K extends AgentKey>({ agent, label, className, style, reach, onEvent, start, rate }: AgentSlotProps<K>): ReactNode {
  const entry = LANDING_AGENTS[agent];
  const composite = "composite" in entry && entry.composite === true;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const clientOnly = "clientOnly" in entry && entry.clientOnly === true;
  // client-only demos are left out of the server HTML (see agents.ts), so there is nothing to reveal without scripts
  const pending = composite && !mounted && !clientOnly;
  const showDemo = mounted || !clientOnly;
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
      {/* as raw HTML: with scripts on, a <noscript>'s content is text to the browser, so a React <style> child
          would not match it on hydration */}
      {pending && <noscript dangerouslySetInnerHTML={{ __html: `<style>${NOSCRIPT_REVEAL}</style>` }} />}
      <div className={clsx(styles.layer, pending && styles.pending)} aria-hidden={name ? true : undefined}>
        {showDemo && (
          <Component
            className={styles.demo}
            // the demos type events as plain strings; the slot narrows them to the agent's known events
            onEvent={onEvent as ((name: string) => void) | undefined}
            start={start}
            rate={rate}
          />
        )}
      </div>
    </div>
  );
}
