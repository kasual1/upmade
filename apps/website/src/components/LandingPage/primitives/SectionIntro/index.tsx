import type { ReactNode } from "react";
import clsx from "clsx";
import type { Cta } from "../../types";
import Button from "../Button";
import styles from "./styles.module.css";

export interface SectionIntroProps {
  /** the section's config id: the heading gets id `${id}-heading` */
  id: string;
  heading: string;
  body?: string;
  cta?: Cta;
  /** "start": showcase copy (left aligned); "center": the FAQ intro */
  align?: "start" | "center";
  /** keep the heading for assistive technology only */
  visuallyHidden?: boolean;
  className?: string;
  children?: ReactNode;
}

/** A section's h2 with its copy and optional button (the design's .showcase-copy and .faq-intro). */
export default function SectionIntro({ id, heading, body, cta, align = "start", visuallyHidden, className, children }: SectionIntroProps): ReactNode {
  if (visuallyHidden) {
    return (
      <h2 id={`${id}-heading`} className={styles.srOnly}>
        {heading}
      </h2>
    );
  }
  return (
    <div className={clsx(styles.intro, styles[align], className)}>
      <h2 id={`${id}-heading`} className={styles.heading}>
        {heading}
      </h2>
      {body && <p className={styles.body}>{body}</p>}
      {cta && <Button cta={{ variant: "light", ...cta }} size="m" className={styles.cta} />}
      {children}
    </div>
  );
}
