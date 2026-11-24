import { INK } from "../../tokens";

/**
 * The wizard's indigo hat with two yellow stars, as the landing page draws it on the body (which it shrinks to 0.62;
 * the rig does the same, so this is in the body's own units). Drawn around the squircle's head spot (32 15.6).
 */
const STAR = "M0-4Q.6-.6 4 0Q.6 .6 0 4Q-.6 .6-4 0Q-.6-.6 0-4Z";

export default function Hat() {
  return (
    <g transform="translate(-32 -15.6)">
      <path d="M19 14.5C24 6 30 -4 37 -15.5C38.6 -17 40.4 -16 39.6 -14C38 -6 42 4 46.5 14.5Z" fill="#4C3BCF" stroke={INK} strokeWidth={3.2} strokeLinejoin="round" />
      <ellipse cx={32.5} cy={15} rx={20.5} ry={4.2} fill="#4C3BCF" stroke={INK} strokeWidth={3.2} />
      <path d={STAR} transform="translate(33.5 2) scale(.9)" fill="#FFD84D" />
      <path d={STAR} transform="translate(39 -7) scale(.6)" fill="#FFD84D" />
    </g>
  );
}
