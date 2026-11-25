import type { ReactNode } from "react";
import type { MediaComponentProps } from "../registry";
import styles from "./styles.module.css";

/** STUB of the "Skill install session" media (skillTerminal); the full port replaces it. */
export default function SkillTerminal(_: MediaComponentProps<"skillTerminal">): ReactNode {
  return <div className={styles.stub} aria-hidden="true" data-media="skillTerminal" />;
}
