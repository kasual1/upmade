import type { ReactNode } from "react";
import ScaledStage from "../../primitives/ScaledStage";
import type { MediaComponentProps } from "../registry";
import styles from "./styles.module.css";

/**
 * STUB (M3): a static frame of the DOM based canvas demo. M6b replaces it with the real demo: the canvas calculator
 * (Landing/Calculator.tsx + calculator-state.ts ported here, with shims left behind) and the slider that reveals
 * its DOM, in the art style, at a fixed virtual size inside a ScaledStage.
 */
export default function DomCanvas({ props }: MediaComponentProps<"domCanvas">): ReactNode {
  const split = Math.min(1, Math.max(0, props?.split ?? 0.5));
  return (
    <div className={styles.root} role="img" aria-label="A calculator on the canvas, with the DOM behind it half revealed">
      <ScaledStage width={560} height={385}>
        <div className={styles.canvas}>
          <span className={styles.badge}>Canvas</span>
        </div>
        <div className={styles.source} style={{ width: `${(1 - split) * 100}%` }}>
          <span className={`${styles.badge} ${styles.badgeDark}`}>DOM</span>
        </div>
      </ScaledStage>
    </div>
  );
}
