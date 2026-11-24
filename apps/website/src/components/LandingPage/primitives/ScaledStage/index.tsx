import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

export interface ScaledStageProps {
  /** the virtual width the content is laid out at, in px */
  width: number;
  /** the virtual height, in px; the stage keeps the aspect ratio width:height (unless `fill`) */
  height: number;
  /**
   * how the virtual stage is fitted into the real one:
   * - "shrink" (default): `--k = min(1, real width / width)`: scaled down to fit the width, never up;
   * - "cover": `--k = max(real width / width, real height / height)`: scaled up or down so the stage covers the
   *   whole box (the overflow is clipped), for content that must fill its frame edge to edge (the star board).
   */
  fit?: "shrink" | "cover";
  /**
   * fill the positioned parent (`position: absolute; inset: 0`) instead of taking the width and an aspect-ratio
   * height; for a frame whose size is already set (a MediaFrame with an aspect ratio)
   */
  fill?: boolean;
  className?: string;
  /** class of the inner, fixed-size layer that holds the content */
  stageClassName?: string;
  children: ReactNode;
}

/** The scale factor for a stage of `w` x `h` real px holding a virtual `width` x `height` (see ScaledStageProps.fit). */
export function stageScale(fit: "shrink" | "cover", w: number, h: number, width: number, height: number): number {
  const k = fit === "cover" ? Math.max(w / width, h / height) : Math.min(1, w / width);
  return Number.isFinite(k) && k > 0 ? Math.round(k * 10000) / 10000 : 1;
}

/**
 * Lays its content out at a fixed virtual size (`width` x `height`, real fonts of 12px or more) and scales it
 * to fit, instead of shrinking text with font-size, so browsers that enforce a minimum font size (Android in-app
 * browsers, Chrome's setting, iOS text inflation) cannot push it out of its frame (plan §3.7).
 *
 * The stage's size comes from `aspect-ratio` (or from its parent with `fill`), never from the measurement, so there
 * is no layout feedback loop: a ResizeObserver only sets `--k` (see `fit`), and the inner layer is
 * `transform: scale(var(--k))`, centred. On the server and before the first measurement `--k` is 1 and the stage
 * clips the overflow. Content can read `--k` (it inherits), e.g. to keep a border's real width:
 * `calc(2px / var(--k))`.
 */
export default function ScaledStage({ width, height, fit = "shrink", fill = false, className, stageClassName, children }: ScaledStageProps): ReactNode {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      if (w === 0) return; // hidden (display: none): keep the last scale
      element.style.setProperty("--k", String(stageScale(fit, w, h, width, height)));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [width, height, fit]);

  const style = {
    "--stage-w": `${width}px`,
    "--stage-h": `${height}px`,
    ...(fill ? null : { aspectRatio: `${width} / ${height}` }),
  } as CSSProperties;

  return (
    <div ref={ref} className={clsx(styles.stage, fill && styles.fill, className)} style={style} data-scaled-stage="">
      <div className={clsx(styles.layer, stageClassName)}>{children}</div>
    </div>
  );
}
