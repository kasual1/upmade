import clsx from "clsx";
import { WORDMARK_LETTERS } from "./paths";
import styles from "./Wordmark.module.css";

/**
 * The big outlined "upmade" above the footer, whose letters hop when hovered. Used at the end of the landing pages
 * and above the blog's footer. Each letter also carries the stable `upmade-wordmark-letter` class, which global CSS
 * can target (the hashed module class names change between builds).
 */
export default function Wordmark() {
  return (
    <section aria-label="Upmade" className={styles.wordmark}>
      <svg viewBox="-0.3 -0.3 50.89 13.64" width="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Upmade" className={styles.svg}>
        <g fill="none" stroke="#0a0a0a" strokeWidth="1.5" strokeLinejoin="round">
          {WORDMARK_LETTERS.map((letter) => (
            <g key={letter.x} className={clsx(styles.letter, "upmade-wordmark-letter")}>
              <rect x={letter.x} y="0" width={letter.width} height="13.04" fill="transparent" stroke="none" />
              <path vectorEffect="non-scaling-stroke" d={letter.d} />
            </g>
          ))}
        </g>
      </svg>
    </section>
  );
}
