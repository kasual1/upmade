import type { CSSProperties, ReactNode } from "react";
import clsx from "clsx";
import { LANDING_AGENTS, type AgentKey } from "../../agents";
import { PAGE_GUTTER } from "../../breakpoints";
import CornerAgent, { CORNER_SIZES, DEFAULT_CORNER_SIZE, type CornerSizeKey } from "../CornerAgent";
import styles from "./styles.module.css";

export interface MediaFrameCorner {
  key: AgentKey;
  corner: "bl" | "br";
  size?: CornerSizeKey;
  label?: string;
}

export interface MediaFrameProps {
  /** the frame's aspect ratio, e.g. "16 / 11"; leave out for a frame sized by its content */
  aspectRatio?: string;
  /** "panel": the art-style ink frame on the panel ground (DOM canvas, star board); "window": the same outline on
   *  the window gradient (code typer); "none": no frame styling */
  variant?: "panel" | "window" | "none";
  /** an agent on the frame's bottom corner */
  cornerAgent?: MediaFrameCorner;
  className?: string;
  frameClassName?: string;
  children: ReactNode;
}

/**
 * Room to keep free beside and below the frame for a corner agent: how far its drawing gets past the frame (the box
 * offset plus the agent's measured reach, agents.ts), less the page gutter it may use sideways.
 */
export function cornerGutter(corner: MediaFrameCorner): { side: number; bottom: number; sidePhone: number; bottomPhone: number } {
  const size = CORNER_SIZES[corner.size ?? DEFAULT_CORNER_SIZE];
  const reach = LANDING_AGENTS[corner.key].reach;
  const sideReach = corner.corner === "bl" ? reach.left : reach.right;
  const side = (px: number, dx: number) => Math.max(0, dx + Math.ceil(sideReach * px) - PAGE_GUTTER);
  const bottom = (px: number, dy: number) => dy + Math.ceil(reach.bottom * px);
  return {
    side: side(size.px, size.dx),
    bottom: bottom(size.px, size.dy),
    sidePhone: side(size.phone.px, size.phone.dx),
    bottomPhone: bottom(size.phone.px, size.phone.dy),
  };
}

/**
 * A showcase's media: a frame (aspect ratio, art-style outline, clipping its content) plus an optional corner agent
 * hanging off its bottom corner. The wrapper reserves a gutter on the agent's side and below, taken from the agent's
 * reach, so the agent is never clipped by `main { overflow-x: clip }` nor runs into the next section.
 */
export default function MediaFrame({ aspectRatio, variant = "panel", cornerAgent, className, frameClassName, children }: MediaFrameProps): ReactNode {
  let style: CSSProperties | undefined;
  if (cornerAgent) {
    const g = cornerGutter(cornerAgent);
    style = {
      "--gutter-side": `${g.side}px`,
      "--gutter-bottom": `${g.bottom}px`,
      "--gutter-side-phone": `${g.sidePhone}px`,
      "--gutter-bottom-phone": `${g.bottomPhone}px`,
    } as CSSProperties;
  }
  return (
    <div
      className={clsx(styles.media, cornerAgent && (cornerAgent.corner === "bl" ? styles.gutterLeft : styles.gutterRight), className)}
      style={style}
      data-media-frame=""
    >
      <div className={styles.anchor}>
        <div className={clsx(styles.frame, styles[variant], frameClassName)} style={aspectRatio ? { aspectRatio } : undefined}>
          {children}
        </div>
        {cornerAgent && (
          <CornerAgent agent={cornerAgent.key} corner={cornerAgent.corner} size={cornerAgent.size} label={cornerAgent.label} />
        )}
      </div>
    </div>
  );
}
