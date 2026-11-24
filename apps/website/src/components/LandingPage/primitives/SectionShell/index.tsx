import type { ReactNode } from "react";
import clsx from "clsx";
import type { SectionType } from "../../types";
import styles from "./styles.module.css";

export interface SectionShellProps {
  /** the section's config id; the section is labelled by the element with id `${id}-heading` */
  id: string;
  type: SectionType;
  /** the inner column's max width: "content" 1180px (default), "wide" 1400px, "narrow" 820px, "none" full width */
  width?: "content" | "wide" | "narrow" | "none";
  /** the section's vertical padding: "l" (showcases, FAQ), "xl" (features), "none" (the hero sets its own) */
  space?: "l" | "xl" | "none";
  /** the hairline divider on top (all sections but the hero) */
  divider?: boolean;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
}

/** The outer frame of every landing section: `<section aria-labelledby>`, side gutters, padding and a centred column. */
export default function SectionShell({
  id,
  type,
  width = "content",
  space = "l",
  divider = true,
  className,
  innerClassName,
  children,
}: SectionShellProps): ReactNode {
  return (
    <section
      aria-labelledby={`${id}-heading`}
      data-section={type}
      data-section-id={id}
      className={clsx(styles.shell, styles[`space-${space}`], divider && styles.divider, className)}
    >
      <div className={clsx(styles.inner, styles[`width-${width}`], innerClassName)}>{children}</div>
    </section>
  );
}
