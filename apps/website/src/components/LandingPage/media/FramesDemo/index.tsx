import type { ReactNode } from "react";
import type { MediaComponentProps } from "../registry";
import styles from "./styles.module.css";

/** STUB of the "Generative UI" media (framesDemo); the full port replaces it. */
export default function FramesDemo(_: MediaComponentProps<"framesDemo">): ReactNode {
  return <div className={styles.stub} aria-hidden="true" data-media="framesDemo" />;
}
