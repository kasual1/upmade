import { INK } from "../../tokens";

/**
 * One ring of the cursor's click ripple, drawn around (0 0): a plain ink circle of radius `r`, as on the landing page
 * (stroke 2, no fill). The animation grows a ripple by showing rings of increasing radius one after another, each
 * scaled only a little, so the stroke stays about 2 wide while the ripple widens (see animations/cursor.ts).
 */
export default function Ripple({ r }: { r: number }) {
  return <circle r={r} fill="none" stroke={INK} strokeWidth={2} />;
}
