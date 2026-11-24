import type { CSSProperties, ReactNode } from "react";
import clsx from "clsx";
import { LANDING_AGENTS, type AgentKey } from "../../agents";
import CornerAgent, { CORNER_SIZES, DEFAULT_CORNER_SIZE, cornerOffset, type CornerSizeKey } from "../CornerAgent";
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
  /**
   * the least room to keep beside (on the corner agent's side) and below the frame, whatever the agent's reach: a
   * design's fixed padding, e.g. the code window's `0 28px 34px 0` (`0 14px 28px 0` at 620px and below)
   */
  minGutter?: Partial<FrameGutter>;
  className?: string;
  frameClassName?: string;
  children: ReactNode;
}

/** Room around a frame, in px: beside it on the corner agent's side and below it, wide and at 620px and below. */
export interface FrameGutter {
  side: number;
  bottom: number;
  sidePhone: number;
  bottomPhone: number;
}

/**
 * The room below a frame that the layouts around it always leave free: the stacked showcase's gap between media and
 * copy (36px); side by side, the section padding below is larger. A corner agent may hang this far down for free.
 * Keep in step with the stacked `gap: 36px` in sections/Showcase/styles.module.css.
 */
export const FREE_BELOW = 36;

/**
 * How far a corner agent's drawing gets past the frame: sideways on its corner's side and down, i.e. the box offset
 * (`dx`, `dy`, see CornerAgent's cornerOffset) plus the agent's measured reach (agents.ts), wide and at 620px and below.
 */
export function cornerOverhang(corner: MediaFrameCorner): FrameGutter {
  const size = CORNER_SIZES[corner.size ?? DEFAULT_CORNER_SIZE];
  const reach = LANDING_AGENTS[corner.key].reach;
  const sideReach = corner.corner === "bl" ? reach.left : reach.right;
  const at = (px: number) => {
    const { dx, dy } = cornerOffset(corner.key, corner.corner, px);
    return { side: Math.max(0, dx + Math.ceil(sideReach * px)), bottom: Math.max(0, dy + Math.ceil(reach.bottom * px)) };
  };
  const wide = at(size.px), phone = at(size.phone.px);
  return { side: wide.side, bottom: wide.bottom, sidePhone: phone.side, bottomPhone: phone.bottom };
}

/**
 * The room MediaFrame keeps below the frame for its corner agent: what the agent hangs past FREE_BELOW, but at least
 * `min.bottom`. (Sideways the room depends on the viewport, so the CSS works it out from `cornerOverhang`; see
 * styles.module.css.)
 */
export function cornerGutterBottom(corner: MediaFrameCorner, min?: Partial<FrameGutter>): { bottom: number; bottomPhone: number } {
  const o = cornerOverhang(corner);
  return {
    bottom: Math.max(min?.bottom ?? 0, o.bottom - FREE_BELOW),
    bottomPhone: Math.max(min?.bottomPhone ?? 0, o.bottomPhone - FREE_BELOW),
  };
}

/**
 * A showcase's media: a frame (aspect ratio, art-style outline, clipping its content) plus an optional corner agent
 * hanging off its bottom corner.
 *
 * The wrapper reserves room for the agent, taken from its reach, so it is never clipped by `main { overflow-x: clip }`
 * at the viewport's edge nor runs into what follows: sideways only what the agent hangs past the room already free
 * beside the content column (the page gutter, or the margin of a centred column on wide screens; the frame is
 * assumed to sit on the column's edge on its agent's side, as in a showcase), so on wide screens the frame keeps its
 * full design width; below, only what it hangs past FREE_BELOW.
 */
export default function MediaFrame({ aspectRatio, variant = "panel", cornerAgent, minGutter, className, frameClassName, children }: MediaFrameProps): ReactNode {
  let style: CSSProperties | undefined;
  if (cornerAgent) {
    const o = cornerOverhang(cornerAgent);
    const b = cornerGutterBottom(cornerAgent, minGutter);
    style = {
      "--overhang": `${o.side}px`,
      "--overhang-phone": `${o.sidePhone}px`,
      "--gutter-min": `${minGutter?.side ?? 0}px`,
      "--gutter-min-phone": `${minGutter?.sidePhone ?? 0}px`,
      "--gutter-bottom": `${b.bottom}px`,
      "--gutter-bottom-phone": `${b.bottomPhone}px`,
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
