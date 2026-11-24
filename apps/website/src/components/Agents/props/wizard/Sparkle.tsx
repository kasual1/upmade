import { INK } from "../../tokens";

/** A yellow four-pointed twinkle, drawn around (0 0) at the given size (the original uses .8, .7 and .55). */
export default function Sparkle({ size = 1 }: { size?: number }) {
  return (
    <path d="M0-4Q.6-.6 4 0Q.6 .6 0 4Q-.6 .6-4 0Q-.6-.6 0-4Z" transform={`scale(${size})`} fill="#FFD84D" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
  );
}
