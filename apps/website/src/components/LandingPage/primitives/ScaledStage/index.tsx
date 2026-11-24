import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

export interface ScaledStageProps {
  /** the virtual width the content is laid out at, in px */
  width: number;
  /** the virtual height, in px; the stage keeps the aspect ratio width:height */
  height: number;
  className?: string;
  /** class of the inner, fixed-size layer that holds the content */
  stageClassName?: string;
  children: ReactNode;
}

/**
 * Lays its content out at a fixed virtual size (`width` x `height`, real fonts of 12px or more) and scales it down
 * to fit, instead of shrinking text with font-size, so browsers that enforce a minimum font size (Android in-app
 * browsers, Chrome's setting, iOS text inflation) cannot push it out of its frame (plan §3.7).
 *
 * The stage's height comes from `aspect-ratio`, never from the measurement, so there is no layout feedback loop: a
 * ResizeObserver only sets `--k = min(1, stage width / width)`, and the inner layer is `transform: scale(var(--k))`,
 * centred. On the server and before the first measurement `--k` is 1 and the stage clips the overflow.
 */
export default function ScaledStage({ width, height, className, stageClassName, children }: ScaledStageProps): ReactNode {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      const k = Math.min(1, entry.contentRect.width / width);
      element.style.setProperty("--k", String(Math.round(k * 10000) / 10000));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [width]);

  const style = {
    "--stage-w": `${width}px`,
    "--stage-h": `${height}px`,
    aspectRatio: `${width} / ${height}`,
  } as CSSProperties;

  return (
    <div ref={ref} className={clsx(styles.stage, className)} style={style} data-scaled-stage="">
      <div className={clsx(styles.layer, stageClassName)}>{children}</div>
    </div>
  );
}
