import { INK } from "../../tokens";

/**
 * One ring of the cursor's click ripple, drawn around (0 0): a plain ink circle of radius `r`, as on the landing page
 * (stroke 2, no fill). The animation grows a ripple by showing rings of increasing radius one after another, each
 * scaled only a little, so the stroke stays about 2 wide while the ripple widens (see animations/cursor.ts).
 * `dot` is the ripple's very start: while the original's circle is smaller than its own stroke (r < 1) it shows as
 * an ink disc of radius r + 1, which is this disc of radius 1, scaled.
 */
export default function Ripple({ r, dot = false }: { r: number; dot?: boolean }) {
  return dot ? <circle r={1} fill={INK} /> : <circle r={r} fill="none" stroke={INK} strokeWidth={2} />;
}
