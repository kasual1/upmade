import type { CSSProperties, ReactNode } from "react";
import clsx from "clsx";
import type { AgentKey } from "../../agents";
import AgentSlot from "../AgentSlot";
import { CORNER_SIZES, DEFAULT_CORNER_SIZE, cornerOffset, type CornerSizeKey } from "./sizes";
import styles from "./styles.module.css";

export { CORNER_OVERLAP, CORNER_SIZES, DEFAULT_CORNER_SIZE, cornerOffset, type CornerSize, type CornerSizeKey } from "./sizes";

export interface CornerAgentProps {
  agent: AgentKey;
  /** the frame corner it sits on: bottom left or bottom right */
  corner: "bl" | "br";
  size?: CornerSizeKey;
  /** a label makes it meaningful to screen readers (see AgentSlot); decorative without */
  label?: string;
  className?: string;
}

/**
 * An agent sitting on a media frame's bottom corner, its body overlapping the corner sideways and downwards by
 * CORNER_OVERLAP (the design's juggler, framework sign and cycling glasses). Absolutely positioned: place it in a `position: relative` parent (MediaFrame does), which must
 * leave room for it (MediaFrame reserves a gutter from the agent's reach).
 */
export default function CornerAgent({ agent, corner, size = DEFAULT_CORNER_SIZE, label, className }: CornerAgentProps): ReactNode {
  const s = CORNER_SIZES[size];
  const wide = cornerOffset(agent, corner, s.px);
  const phone = cornerOffset(agent, corner, s.phone.px);
  const style = {
    "--corner-px": `${s.px}px`,
    "--corner-dx": `${wide.dx}px`,
    "--corner-dy": `${wide.dy}px`,
    "--corner-px-phone": `${s.phone.px}px`,
    "--corner-dx-phone": `${phone.dx}px`,
    "--corner-dy-phone": `${phone.dy}px`,
  } as CSSProperties;
  return (
    <AgentSlot
      agent={agent}
      label={label}
      className={clsx(styles.corner, corner === "bl" ? styles.bl : styles.br, className)}
      style={style}
    />
  );
}
