import { INK } from "../../tokens";

/**
 * One short straight piece of a connector's cord, `length` long along +x from (0 0): a white cord with an ink
 * outline, 3.6 wide in all. The format has no animated paths for props, so the animation lays a chain of these along
 * the original's curving cord, frame by frame; all `ink` pieces of a cord are drawn before its `core` pieces so the
 * joints do not show.
 */
export default function Cord({ part, length }: { part: "ink" | "core"; length: number }) {
  return part === "ink" ? (
    <path d={`M0 0H${length}`} fill="none" stroke={INK} strokeWidth={3.6} strokeLinecap="round" />
  ) : (
    <path d={`M0 0H${length}`} fill="none" stroke="#FFFFFF" strokeWidth={1.6} strokeLinecap="round" />
  );
}
