import type { CSSProperties } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import { Agent, idle } from "../Agents";
import styles from "./BrandLogo.module.css";

export interface BrandLogoProps {
  /** the agent's width and height in px (38 in the landing header, 52 in the landing footer) */
  size?: number;
  /** the wordmark's font size in px; defaults to the design's pairing for the header (38 → 26) */
  textSize?: number;
  /** where the logo links to; the site's home by default */
  to?: string;
  className?: string;
}

/**
 * The "upmade.io" logo of the landing pages: the idle pink squircle agent next to the wordmark text, linking home.
 * The agent's eyes follow the pointer (the Agent's `followPointer`, which stays off with reduced motion), and it plays
 * its default random hop when hovered or clicked. The design's wink on a long hover needs the rig to close one eye
 * (both eyes are one group today): requested from the agents stream (plan §3.5).
 */
export default function BrandLogo({ size = 38, textSize, to = "/", className }: BrandLogoProps) {
  const style = {
    "--brand-agent-size": `${size}px`,
    "--brand-text-size": `${textSize ?? Math.round((size * 26) / 38)}px`,
  } as CSSProperties;
  return (
    <Link to={to} className={clsx(styles.brand, className)} style={style} aria-label="upmade.io home">
      <Agent shape="squircle" colour="pink" animation={idle} className={styles.agent} followPointer />
      <span className={styles.word}>
        <b>upmade</b>.io
      </span>
    </Link>
  );
}
