import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { observeInView } from "../../hooks/useInView";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import ScaledStage from "../../primitives/ScaledStage";
import type { MediaComponentProps } from "../registry";
import { createThemeClock } from "./clock";
import { STAGE_H, STAGE_W, THEMES, themeVars } from "./themes";
import styles from "./styles.module.css";

/** the first theme, server-rendered (and all there is with reduced motion) */
const FIRST_THEME = themeVars(THEMES[0]) as CSSProperties;

function applyTheme(element: HTMLElement, index: number): void {
  for (const [name, value] of Object.entries(themeVars(THEMES[index]))) element.style.setProperty(name, value);
}

/**
 * "Highly customizable" (the design's .themes-demo): Upmade's workspace manager, more menu and chat box drawn as
 * outlined controls with gradient fills, morphing from one theme into the next. Decorative: hidden from assistive
 * technology.
 *
 * - Laid out on a 605 x 415.94 ScaledStage (the design's `.themes-fit`), so the prompt is a real 16.9px font
 *   scaled by a transform, and a minimum font size cannot push it out of its box (plan §3.7). "cover" on a 16:11
 *   stage in a 16:11 frame scales it to the frame's width, up or down, like the design's `--tk`.
 * - A theme is a set of registered --theme-* custom properties (themes.ts, styles.module.css `@property`), set on
 *   the root imperatively; the root transitions them, so colours, gradients, outlines, corners and shadows all
 *   morph, with no React state or per-frame work.
 * - The clock (clock.ts): each "putOn" of the hat-swapping corner agent (through `subscribe`) wears the theme of its
 *   new hat; when none arrives for 1.5 agent loops while the media is on screen, a fallback clock moves on by itself.
 *   Reduced motion: the first theme, static (the agent stands still in its top hat).
 */
export default function Themes({ subscribe }: MediaComponentProps<"themes">): ReactNode {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (reducedMotion) {
      applyTheme(root, 0);
      return;
    }
    const clock = createThemeClock((index) => applyTheme(root, index));
    const unsubscribe = subscribe((name) => {
      if (name === "putOn") clock.putOn();
    });
    const unobserve =
      typeof IntersectionObserver === "undefined"
        ? (clock.setActive(true), () => {})
        : observeInView(root, (visible) => clock.setActive(visible), { rootMargin: "0px" });
    return () => {
      unobserve();
      unsubscribe();
      clock.dispose();
    };
  }, [reducedMotion, subscribe]);

  return (
    <div ref={rootRef} className={styles.root} style={FIRST_THEME} aria-hidden="true" data-media="themes">
      <ScaledStage width={STAGE_W} height={STAGE_H} fit="cover" fill stageClassName={styles.stage}>
        <div className={`${styles.control} ${styles.workspaces}`}>
          <span className={styles.button}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <span className={styles.divider} />
          <span className={styles.button}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </div>
        <div className={`${styles.control} ${styles.more}`}>
          <span className={styles.button}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.75" />
              <circle cx="12" cy="12" r="1.75" />
              <circle cx="12" cy="19" r="1.75" />
            </svg>
          </span>
        </div>
        <div className={`${styles.control} ${styles.chat}`}>
          <div className={styles.field}>
            <span className={styles.prompt}>Describe what to build…</span>
            <span className={styles.send}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M6 11l6-6 6 6" />
              </svg>
            </span>
          </div>
        </div>
      </ScaledStage>
    </div>
  );
}
