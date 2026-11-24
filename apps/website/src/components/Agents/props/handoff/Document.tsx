import { INK, STROKE } from "../../tokens";

/**
 * The shared document: a white sheet, 13 x 12, with its top-right corner folded over (a light grey flap). Drawn
 * around its centre (0 0), at the original's full size.
 */
export default function Document() {
  return (
    <g>
      <path d="M-6.5 -6H3L6.5 -2.5V6H-6.5Z" fill="#FFFFFF" stroke={INK} strokeWidth={STROKE.hand} strokeLinejoin="round" />
      <path d="M3 -6V-2.5H6.5Z" fill="#DCDCE2" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
    </g>
  );
}
