import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import Cloud from "../Agents/props/shapeShift/Cloud";
import styles from "./CloudPop.module.css";

/** useLayoutEffect in the browser (so the first frame is set before the page paints), useEffect on the server */
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/*
 * After the landing pages' shape-shifting agent (Agents/animations/shapeShift.ts), quick: a puff of cloud grows over
 * the spot, overshoots and is gone, and out of it the agent grows from a tiny speck to its full size. Starts just
 * after the floating navbar begins to slide in (css/navbar.css, 0.2 s); the agent is full size after about 0.4 s.
 */
const CLOUD: Keyframe[] = [
  { transform: "scale(0)", offset: 0 },
  { transform: "scale(0.85)", offset: 0.15 },
  { transform: "scale(1.12)", offset: 0.35 },
  { transform: "scale(1)", offset: 0.7 },
  { transform: "scale(0)", offset: 1 },
];
const CLOUD_TIMING: KeyframeAnimationOptions = { delay: 60, duration: 300, fill: "both" };

const POP: Keyframe[] = [
  { transform: "scale(0.04)", offset: 0 },
  { transform: "scale(1)", offset: 1 },
];
/** a smooth ease-out: quick at first, settling gently into its full size */
const POP_TIMING: KeyframeAnimationOptions = { delay: 130, duration: 260, easing: "cubic-bezier(0.2, 0.8, 0.3, 1)", fill: "both" };

export interface CloudPopProps {
  /** each time this turns from false to true, the content pops out of a cloud */
  shown: boolean;
  /** sizes and places the box (BrandLogo's agent box) */
  className?: string;
  /** called as each pop starts (BrandLogo starts the agent's wave then) */
  onPop?: () => void;
  children: ReactNode;
}

/**
 * Wraps the logo's agent so it can appear in a puff of cloud: whenever `shown` turns true, the cloud puffs up over the
 * agent and the agent grows out of it. At rest (and with reduced motion) the agent simply stands there.
 */
export default function CloudPop({ shown, className, onPop, children }: CloudPopProps) {
  const [puffs, setPuffs] = useState(0);
  const wasShown = useRef(shown);
  const contentRef = useRef<HTMLSpanElement>(null);
  const cloudRef = useRef<SVGSVGElement>(null);

  useIsoLayoutEffect(() => {
    if (shown && !wasShown.current && !reducedMotion()) setPuffs((n) => n + 1);
    wasShown.current = shown;
  }, [shown]);

  useIsoLayoutEffect(() => {
    if (!puffs) return;
    onPop?.();
    const pop = contentRef.current?.animate(POP, POP_TIMING);
    const cloud = cloudRef.current?.animate(CLOUD, CLOUD_TIMING);
    let done = false;
    Promise.all([pop?.finished, cloud?.finished]).then(
      () => {
        if (!done) setPuffs(0);
      },
      () => {},
    );
    return () => {
      done = true;
      pop?.cancel();
      cloud?.cancel();
    };
  }, [puffs]);

  return (
    <span className={clsx(className, styles.box)}>
      <span ref={contentRef} className={styles.content}>
        {children}
      </span>
      {puffs > 0 && (
        <svg ref={cloudRef} className={styles.cloud} viewBox="0 0 64 64" aria-hidden="true">
          <g transform="translate(32 30)">
            <Cloud which={((puffs - 1) % 3) as 0 | 1 | 2} />
          </g>
        </svg>
      )}
    </span>
  );
}
