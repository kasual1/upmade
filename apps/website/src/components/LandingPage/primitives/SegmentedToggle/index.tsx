import type { ReactNode } from "react";
import clsx from "clsx";
import type { LinkRef } from "../../types";
import LinkTo from "../LinkTo";
import styles from "./styles.module.css";

export interface SegmentedToggleItem {
  label: string;
  link: LinkRef;
  /** the page this toggle is on (aria-current="page") */
  current?: boolean;
}

export interface SegmentedToggleProps {
  items: readonly SegmentedToggleItem[];
  /** the navigation's accessible name */
  label?: string;
  className?: string;
}

/** The hero's page switch (the design's .toggle): links between page versions, the current one raised. */
export default function SegmentedToggle({ items, label = "Page version", className }: SegmentedToggleProps): ReactNode {
  return (
    <nav className={clsx(styles.toggle, className)} aria-label={label}>
      {items.map((item) => (
        <LinkTo key={item.label} link={item.link} className={styles.item} aria-current={item.current ? "page" : undefined}>
          {item.label}
        </LinkTo>
      ))}
    </nav>
  );
}
