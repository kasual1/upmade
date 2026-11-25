import { useCallback, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useSectionSignal } from "../../hooks/useSectionSignal";
import AgentSlot from "../../primitives/AgentSlot";
import Button from "../../primitives/Button";
import SegmentedToggle from "../../primitives/SegmentedToggle";
import Toolbar, { type ToolKey } from "../../primitives/Toolbar";
import { TOOL_START, TOSS_RATE, TOSS_TOOL, toolOfEvent } from "../../toolCycle";
import type { HeroSection } from "../../types";
import HeroTop from "./HeroTop";
import styles from "./styles.module.css";

/**
 * The hero (design L398-425): the page's own header (logo, nav links, GitHub, and the menu button at 620px and
 * below), the page toggle, the server-rendered h1 and subtitle, the toolCycle agent, the editor toolbar and the CTAs.
 *
 * - Navbar contract (plan 3.6): the site navbar stays hidden while `header.top` is on screen (useHeroNavObserver);
 *   the legacy MenuButton opens the navbar's mobile sidebar meanwhile (`data-hero-menu`, css/navbar.css).
 * - The hero nav is named "Primary", so it does not share the name "Main" with the Docusaurus navbar's nav.
 * - Toolbar ↔ agent (`toolbar.syncWithAgent`, plan §3.5; useToolSync): the agent's `tool:*` events select its tool
 *   in the toolbar (the pill slides), and a click on a tool restarts the agent at that tool's turn (TOOL_START, via
 *   AgentSlot's `start`). A click while the arrow is in the air lets the agent finish the catch at 4x until its next
 *   tool event, then jumps; the toolbar shows the clicked tool meanwhile. The design also puts a tool that is in hand
 *   away first (a 0.5 s blended "stow"); that needs pose blending in the agent rig, requested from the agents stream
 *   (plan §3.5), so for now the agent jumps straight to the new turn. With reduced motion the agent is still and
 *   emits nothing: "cursor" stays selected and a click only selects.
 */
export default function Hero({ config }: { config: HeroSection }): ReactNode {
  const { id, nav, toggle, title, subtitle, agent, toolbar, ctas } = config;
  const sync = useToolSync(toolbar?.syncWithAgent === true);

  return (
    <section aria-labelledby={`${id}-heading`} data-section="hero" data-section-id={id} className={styles.hero}>
      <HeroTop nav={nav} />
      <div className={styles.copy}>
        {toggle && <SegmentedToggle items={toggle} />}
        <h1 id={`${id}-heading`} className={styles.title}>
          {title}
        </h1>
        <p className={styles.subtitle}>{subtitle}</p>
        <AgentSlot
          agent={agent.key}
          label={agent.label}
          className={styles.agent}
          onEvent={sync?.onAgentEvent}
          start={sync?.start}
          rate={sync?.rate}
        />
        {toolbar && (
          <Toolbar tools={toolbar.tools} className={styles.toolbar} subscribe={sync?.subscribe} onChange={sync?.onToolClick} />
        )}
        <div className={styles.ctas}>
          {ctas.map((cta) => (
            <Button key={cta.label} cta={cta} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface ToolSync {
  onAgentEvent: (name: string) => void;
  subscribe: ReturnType<typeof useSectionSignal>["subscribe"];
  onToolClick: (tool: ToolKey) => void;
  /** where the agent's loop (re)starts */
  start: number | undefined;
  rate: number;
}

/**
 * The toolbar ↔ toolCycle agent pairing. The agent's events are handled imperatively (they come inside its frame, in
 * `flushSync`): the tool events go on to the toolbar through a section signal (its own state, so only the toolbar
 * renders); only a click's jump (`start`) and the arrow's quick finish (`rate`) are state here.
 */
function useToolSync(enabled: boolean): ToolSync | undefined {
  const signal = useSectionSignal();
  const reduced = useReducedMotion();
  /** the turn the agent is in (the loop starts on the cursor's) */
  const turnRef = useRef<string>("cursor");
  /** a tool clicked while the arrow is in the air: the agent goes there at its next tool event */
  const pendingRef = useRef<ToolKey | null>(null);
  const [jump, setJump] = useState<{ start: number; n: number } | null>(null);
  const [rate, setRate] = useState(1);

  const jumpTo = useCallback((tool: ToolKey) => {
    const start = TOOL_START[tool];
    if (start === undefined) return;
    turnRef.current = tool;
    // `start` restarts the loop only when it changes, so a jump to the same turn as the last jump differs by a
    // microsecond on every other jump; the event at `start` itself does not fire, the toolbar already shows the tool
    setJump((j) => {
      const n = (j?.n ?? 0) + 1;
      return { start: start + (n % 2) * 0.001, n };
    });
  }, []);

  const onAgentEvent = useCallback(
    (name: string) => {
      const tool = toolOfEvent(name);
      if (tool === null) return;
      const pending = pendingRef.current;
      if (pending !== null) {
        // the arrow is caught and put away: on to the clicked tool (the toolbar shows it already)
        pendingRef.current = null;
        setRate(1);
        if (pending !== tool) jumpTo(pending);
        else turnRef.current = tool;
        return;
      }
      turnRef.current = tool;
      signal.emit(name);
    },
    [signal, jumpTo],
  );

  const onToolClick = useCallback(
    (tool: ToolKey) => {
      if (reduced) return; // the agent is still: a click only selects
      if (pendingRef.current !== null) {
        if (tool === turnRef.current) {
          // back to the tool the agent is using after all (the arrow in the air): no jump, normal speed again
          pendingRef.current = null;
          setRate(1);
          return;
        }
        pendingRef.current = tool;
        return;
      }
      if (tool === turnRef.current) return;
      if (turnRef.current === TOSS_TOOL) {
        pendingRef.current = tool;
        setRate(TOSS_RATE);
        return;
      }
      jumpTo(tool);
    },
    [reduced, jumpTo],
  );

  if (!enabled) return undefined;
  return { onAgentEvent, subscribe: signal.subscribe, onToolClick, start: jump?.start, rate };
}
