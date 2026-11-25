import type { ReactNode } from "react";
import type { MediaComponentProps } from "../registry";
import styles from "./styles.module.css";

/** STUB of the "Theme morph" media (themes); the full port replaces it. */
export default function Themes(_: MediaComponentProps<"themes">): ReactNode {
  return <div className={styles.stub} aria-hidden="true" data-media="themes" />;
}
