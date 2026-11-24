import type { ReactNode } from "react";
import clsx from "clsx";
import { ArrowIcon } from "../../../Brand/Icon";
import type { Cta } from "../../types";
import LinkTo from "../LinkTo";
import styles from "./styles.module.css";

export interface ButtonProps {
  cta: Cta;
  /** "l": the hero's buttons (17px); "m": the showcases' smaller ones (16px) */
  size?: "l" | "m";
  className?: string;
}

/** A call to action (the design's .btn): a link styled as a button, ink ("dark") or chip grey ("light"), with an arrow. */
export default function Button({ cta, size = "l", className }: ButtonProps): ReactNode {
  const { label, link, variant = "dark", newTab } = cta;
  return (
    <LinkTo link={link} newTab={newTab} className={clsx(styles.btn, styles[variant], styles[size], className)}>
      {label}
      <ArrowIcon />
    </LinkTo>
  );
}
