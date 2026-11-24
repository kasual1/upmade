import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { useInView } from "../../hooks/useInView";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import ScaledStage from "../../primitives/ScaledStage";
import type { MediaComponentProps } from "../registry";
import {
  DRIFT_MS,
  LABEL_PX,
  PITCH,
  STAGE_H,
  STAGE_W,
  STAR_H,
  STAR_W,
  rampDuration,
  rampFor,
  rampRate,
  starPositions,
  type RampKind,
} from "./board";
import styles from "./styles.module.css";

/** the board's buttons, computed once per module (static geometry) */
const STARS = starPositions();

const STAR_PATH =
  "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z";

const BOARD_STYLE = {
  "--star-w": `${STAR_W}%`,
  "--star-h": `${STAR_H}%`,
  "--label-px": `${LABEL_PX}px`,
} as CSSProperties;

function setRate(animation: Animation, rate: number): void {
  if (Math.abs(animation.playbackRate - rate) < 0.01) return;
  if (typeof animation.updatePlaybackRate === "function") animation.updatePlaybackRate(rate);
  else animation.playbackRate = rate;
}

/**
 * The star board (the design's .perf-demo): a mock canvas crowded with GitHub star buttons in the agent family's art
 * style, tilted and drifting to the left. Decorative: hidden from assistive technology, and its links (to
 * `props.repoUrl`, for the mouse) are out of the tab order.
 *
 * - Laid out on a 560 x 385 ScaledStage ("cover"), so the labels are real 12.8px fonts scaled by a transform
 *   (plan §3.7); outlines are divided by the stage's `--k` to keep the design's real widths.
 * - The drift is one Web Animation (one PITCH per DRIFT_MS, looping seamlessly) created in an effect, so the server
 *   HTML is the static board. It plays only while the board is near the viewport, and never with reduced motion.
 * - Hook point (plan §0): `subscribe` delivers the glasses agent's "glassesOn"/"glassesOff"; each starts a ramp of
 *   the animation's playbackRate (board.ts `rampRate`). Nothing emits them yet, so the board drifts steadily.
 */
export default function StarBoard({ props, subscribe }: MediaComponentProps<"starBoard">): ReactNode {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const reducedMotion = useReducedMotion();
  const inView = useInView(rootRef);
  const repoUrl = props?.repoUrl;

  // the drift: created paused, started by the in-view effect below
  useEffect(() => {
    const track = trackRef.current;
    if (reducedMotion || !track || typeof track.animate !== "function") return;
    const animation = track.animate([{ transform: "translateX(0)" }, { transform: `translateX(-${PITCH}%)` }], {
      duration: DRIFT_MS,
      iterations: Infinity,
      easing: "linear",
    });
    animation.pause();
    animationRef.current = animation;
    return () => {
      animation.cancel();
      animationRef.current = null;
    };
  }, [reducedMotion]);

  useEffect(() => {
    const animation = animationRef.current;
    if (!animation) return;
    if (inView) animation.play();
    else animation.pause();
  }, [inView, reducedMotion]);

  // the hook point: speed ramps on the glasses agent's events (runs only if an event arrives)
  useEffect(() => {
    let frame = 0;
    const ramp = (kind: RampKind) => {
      const animation = animationRef.current;
      if (!animation) return;
      cancelAnimationFrame(frame);
      const from = animation.playbackRate;
      const start = performance.now();
      const step = (now: number) => {
        const t = (now - start) / 1000;
        setRate(animation, rampRate(kind, from, t));
        if (t < rampDuration(kind)) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };
    const unsubscribe = subscribe((name) => {
      const kind = rampFor(name);
      if (kind) ramp(kind);
    });
    return () => {
      unsubscribe();
      cancelAnimationFrame(frame);
    };
  }, [subscribe]);

  return (
    <div ref={rootRef} className={styles.root} aria-hidden="true" data-star-board="">
      <ScaledStage width={STAGE_W} height={STAGE_H} fit="cover" fill>
        <div className={styles.board} style={BOARD_STYLE}>
          <div ref={trackRef} className={styles.track}>
            {STARS.map(({ x, y }, i) => {
              const style = { left: `${x}%`, top: `${y}%` };
              const content = (
                <>
                  <svg viewBox="0 0 24 24" className={styles.icon}>
                    <path d={STAR_PATH} />
                  </svg>
                  Star
                </>
              );
              return repoUrl ? (
                <a key={i} className={styles.star} style={style} href={repoUrl} target="_blank" rel="noopener noreferrer" tabIndex={-1}>
                  {content}
                </a>
              ) : (
                <span key={i} className={styles.star} style={style}>
                  {content}
                </span>
              );
            })}
          </div>
        </div>
      </ScaledStage>
    </div>
  );
}
