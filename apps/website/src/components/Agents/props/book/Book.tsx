import { INK } from "../../tokens";

/**
 * The open indigo book the "Speed-reading" agent holds in its lap: two covers meeting at a spine strip, with a pale
 * line across each half. Drawn exactly as in the landing page, around (0 0) = the middle of the spine at y 52 of
 * the agent's box (the original sits 3 units up: its paths are in y + 3).
 */
export default function Book() {
  return (
    <g transform="translate(-32 -55)">
      <path d="M32 45.0Q24.5 42.7 15.6 44.2V58.0Q24.5 56.5 32 58.8Z" fill="#4338CA" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
      <path d="M32 45.0Q39.5 42.7 48.4 44.2V58.0Q39.5 56.5 32 58.8Z" fill="#4338CA" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
      <path d="M18.6 47.0Q24.5 45.6 29.4 47.2M34.6 47.2Q39.5 45.6 45.4 47.0" fill="none" stroke="#6366F1" strokeWidth={1.4} strokeLinecap="round" />
      <rect x={30.4} y={44.4} width={3.2} height={15} rx={1.2} fill="#312E81" stroke={INK} strokeWidth={1.6} />
    </g>
  );
}
