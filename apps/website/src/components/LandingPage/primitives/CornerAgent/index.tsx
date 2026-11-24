import type { CSSProperties, ReactNode } from "react";
import clsx from "clsx";
import type { AgentKey } from "../../agents";
import AgentSlot from "../AgentSlot";
import { CORNER_SIZES, DEFAULT_CORNER_SIZE, type CornerSizeKey } from "./sizes";
import styles from "./styles.module.css";

export { CORNER_SIZES, DEFAULT_CORNER_SIZE, type CornerSize, type CornerSizeKey } from "./sizes";

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
 * An agent sitting on a media frame's bottom corner, partly outside it (the design's juggler, framework sign and
 * cycling glasses). Absolutely positioned: place it in a `position: relative` parent (MediaFrame does), which must
 * leave room for it (MediaFrame reserves a gutter from the agent's reach).
 */
export default function CornerAgent({ agent, corner, size = DEFAULT_CORNER_SIZE, label, className }: CornerAgentProps): ReactNode {
  const s = CORNER_SIZES[size];
  const style = {
    "--corner-px": `${s.px}px`,
    "--corner-dx": `${s.dx}px`,
    "--corner-dy": `${s.dy}px`,
    "--corner-px-phone": `${s.phone.px}px`,
    "--corner-dx-phone": `${s.phone.dx}px`,
    "--corner-dy-phone": `${s.phone.dy}px`,
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
