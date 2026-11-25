import { useEffect, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import AgentSlot from "../../primitives/AgentSlot";
import { useInView } from "../../hooks/useInView";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { MediaComponentProps } from "../registry";
import { finalState, nextChangeAt, sessionAt, sessionScale, sessionTimes, type SessionState } from "./session";
import styles from "./styles.module.css";

export { finalState, nextChangeAt, sessionAt, sessionScale, sessionTimes, type SessionState } from "./session";

/** the design's session, when no command is configured */
const DEFAULT_COMMAND = "npx skills add kasual1/upmade";
const PATH = "~/my-app";
const QUESTION = "Install the upmade skill for your agent?";
const HOST = "upmade.io";

function Prompt(): ReactNode {
  return (
    <span className={styles.path} data-font="mono">
      {PATH}
    </span>
  );
}

function Check(): ReactNode {
  return (
    <svg viewBox="0 0 12 12" className={styles.check} aria-hidden="true">
      <path d="M2.6 6.4l2.3 2.2 4.5-5" />
    </svg>
  );
}

/** One state of the session, as the design's script renders it. `blink`: the final prompt's cursor blinks. */
function Session({ command, state, blink, ghost = false, className }: {
  command: string;
  state: SessionState;
  blink: boolean;
  /** the invisible copy that reserves the room: an empty box stands in for the agent */
  ghost?: boolean;
  className?: string;
}): ReactNode {
  return (
    <div className={clsx(styles.session, className)} data-font="mono">
      <div className={styles.line} data-font="mono">
        <Prompt />
        <span className={styles.cmd} data-font="mono">
          {command.slice(0, state.typed)}
          {state.typing && <span className={styles.cursor} />}
        </span>
      </div>
      {state.banner && (
        <div className={styles.banner}>
          <div className={styles.logo}>
            {ghost ? <span className={styles.agent} /> : <AgentSlot agent="squircle" className={styles.agent} />}
            <span>
              <b>upmade</b>.io
            </span>
          </div>
          <div className={styles.welcome} data-font="mono">
            Welcome to{" "}
            <span className={styles.strong} data-font="mono">
              {HOST}
            </span>
          </div>
        </div>
      )}
      {state.question && (
        <div className={styles.line} data-font="mono">
          <span className={styles.q} data-font="mono">
            ?
          </span>
          <span className={styles.ask} data-font="mono">
            {QUESTION}
          </span>
          {state.answered && (
            <>
              <span className={styles.muted} data-font="mono">
                ›
              </span>
              <span className={styles.answer} data-font="mono">
                Yes
              </span>
            </>
          )}
        </div>
      )}
      {state.added && (
        <div className={styles.line} data-font="mono">
          <span className={styles.ok}>
            <Check />
          </span>
          <span data-font="mono">
            Added the{" "}
            <span className={styles.skill} data-font="mono">
              upmade
            </span>{" "}
            skill to your agent
          </span>
        </div>
      )}
      {state.prompt && (
        <div className={styles.line} data-font="mono">
          <Prompt />
          <span className={clsx(styles.cursor, blink && styles.blink)} />
        </div>
      )}
    </div>
  );
}

/**
 * "Agents love Upmade": a terminal in the agents' art style replaying the agent skill's install session: the
 * prompt's path chip, the command typed with a block cursor, Upmade's banner (the pink agent and the wordmark), the
 * question with its answer, the green check and a fresh prompt whose cursor blinks; it holds, then starts over.
 * Ported from the design's script and Landing/Sections.tsx (SkillTerminal, useTerminalSession).
 *
 * - Clock: its own (session.ts). A round starts when the terminal is at least 30% on screen and the rounds loop
 *   while it stays there; leaving the screen stops the clock (the finished session shows, still), coming back starts
 *   a new round.
 * - Size: the session is laid out at its full size (14px text, at least 454px wide; white-space: pre) and scaled
 *   down as a whole by a transform to fit the window (plan §3.7). The scale is measured from the session's real
 *   width, so a minimum font size that enlarges the text shrinks the session instead of cutting its lines. The
 *   body's height is reserved for the finished session, so the replay never moves the page.
 * - Server and reduced motion: the finished session, still (no blinking with reduced motion).
 * - Screen readers: the terminal is decorative (aria-hidden); a visually hidden line carries the command.
 */
export default function SkillTerminal({ props }: MediaComponentProps<"skillTerminal">): ReactNode {
  const command = props?.command || DEFAULT_COMMAND;
  const bodyRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(bodyRef, { rootMargin: "0px", threshold: 0.3 });
  const [state, setState] = useState<SessionState>(() => finalState(command.length));
  /** after hydration: only then does "off screen" mean anything; the server output blinks */
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // fit the session to the body: the layer's size depends only on its content, the scale on the body's width
  useEffect(() => {
    const body = bodyRef.current;
    const fit = fitRef.current;
    const layer = layerRef.current;
    if (!body || !fit || !layer || typeof ResizeObserver === "undefined") return;
    let alive = true;
    const measure = () => {
      const width = fit.clientWidth;
      if (!alive || width === 0) return; // hidden: keep the last fit
      const k = sessionScale(width, layer.offsetWidth);
      fit.style.setProperty("--k", String(k));
      fit.style.height = `${Math.ceil(layer.offsetHeight * k)}px`;
    };
    const observer = new ResizeObserver(measure);
    observer.observe(fit);
    observer.observe(layer);
    document.fonts?.ready.then(measure, () => {});
    return () => {
      alive = false;
      observer.disconnect();
    };
  }, []);

  // the clock: rounds loop while on screen; one timer at a time, scheduled against the round's start
  useEffect(() => {
    const length = command.length;
    if (!inView || reduced) {
      setState(finalState(length));
      return;
    }
    const round = sessionTimes(length).round;
    let start = performance.now();
    let timer = 0;
    const step = () => {
      let elapsed = performance.now() - start;
      if (elapsed >= round) {
        start += round * Math.floor(elapsed / round);
        elapsed = performance.now() - start;
      }
      setState(sessionAt(length, elapsed));
      timer = window.setTimeout(step, Math.max(0, nextChangeAt(length, elapsed) - elapsed));
    };
    step();
    return () => window.clearTimeout(timer);
  }, [inView, reduced, command]);

  const full = finalState(command.length);
  return (
    <div className={styles.root} data-skill-terminal="">
      <div className={styles.window} aria-hidden="true">
        <div className={styles.bar}>
          <i className={styles.dotPink} />
          <i className={styles.dotYellow} />
          <i className={styles.dotGreen} />
        </div>
        <div ref={bodyRef} className={styles.body}>
          <div ref={fitRef} className={styles.fit}>
            <div ref={layerRef} className={styles.layer}>
              {/* the finished session, invisible, so the body is as tall (and the layer as wide) as it ever gets */}
              <Session command={command} state={full} blink={false} ghost className={styles.ghost} />
              <Session
                command={command}
                state={state}
                blink={!reduced && !(hydrated && !inView) /* no blinking off screen (after hydration) */}
                className={styles.live}
              />
            </div>
          </div>
        </div>
      </div>
      <p className={styles.srOnly}>
        Install the Upmade skill for your coding agent: <code data-font="mono">{command}</code>
      </p>
    </div>
  );
}
