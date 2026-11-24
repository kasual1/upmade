import type { ReactNode } from "react";
import type { MediaComponentProps } from "../registry";
import styles from "./styles.module.css";

/**
 * STUB (M3): the code window showing the first framework's snippet, fully typed and static. M6c replaces it with
 * the typer (CodeWindow and the highlighter ported from Landing/Sections.tsx), cycling React → Vue → Angular on the
 * frame sign's documented turns (6170 / 6824 / 9348 ms) on its own clock; `subscribe` ("flip") is the hook point
 * for the final sign.
 */
export default function CodeTyper({ props }: MediaComponentProps<"codeTyper">): ReactNode {
  const framework = props?.frameworks[0];
  return (
    <div className={styles.window}>
      <div className={styles.bar} aria-hidden="true">
        <i className={styles.dotPink} />
        <i className={styles.dotYellow} />
        <i className={styles.dotGreen} />
        {framework && (
          <span className={styles.file} data-font="mono">
            {framework.file}
          </span>
        )}
      </div>
      {framework && (
        <pre className={styles.code} data-font="mono" aria-label={`${framework.name} example: ${framework.file}`}>
          {framework.code}
        </pre>
      )}
    </div>
  );
}
