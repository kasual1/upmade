import type { ReactNode } from "react";
import ScaledStage from "../../primitives/ScaledStage";
import type { MediaComponentProps } from "../registry";
import styles from "./styles.module.css";

const STARS = Array.from({ length: 12 }, (_, i) => i);

/**
 * STUB (M6a replaces it): a static grid of GitHub star buttons. The real board drifts at a steady speed on its own
 * clock and is decorative (aria-hidden, links with tabIndex -1); `subscribe` ("glassesOn"/"glassesOff") is the hook
 * point for the final glasses agent to speed it up.
 */
export default function StarBoard(_: MediaComponentProps<"starBoard">): ReactNode {
  return (
    <div className={styles.root} role="img" aria-label="A board of GitHub star buttons">
      <ScaledStage width={560} height={385}>
        <div className={styles.grid} aria-hidden="true">
          {STARS.map((i) => (
            <span key={i} className={styles.star}>
              ★ Star
            </span>
          ))}
        </div>
      </ScaledStage>
    </div>
  );
}
