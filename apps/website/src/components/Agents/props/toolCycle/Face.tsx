import { INK } from "../../tokens";

/*
 * The hero agent's faces that the rig cannot draw by itself: the tongue and the smile. The smile is in the agent's own
 * coordinates (the origin is the agent's (0 0)); the animation moves both with the gaze.
 */

/** The tip of the tongue, poking out at the top right of the mouth while it paints; drawn around its base. */
export function Tongue() {
  return (
    <g>
      <path d="M-2.1 .4V-3A2.1 2.1 0 0 1 2.1 -3V.4Z" fill="#FF5C7A" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
      <path d="M0 -.2V-2.6" stroke="#C2304D" strokeWidth={0.8} strokeLinecap="round" />
    </g>
  );
}

/** The adorable smile for the photo (no mouth): happy arcs for eyes and blushing cheeks. */
export function Smile() {
  return (
    <g>
      <ellipse cx={22.6} cy={38.6} rx={2.4} ry={1.35} fill="#FF3D7F" opacity={0.38} />
      <ellipse cx={41.4} cy={38.6} rx={2.4} ry={1.35} fill="#FF3D7F" opacity={0.38} />
      <path d="M24.3 35.2Q26.7 31.6 29.1 35.2M34.9 35.2Q37.3 31.6 39.7 35.2" fill="none" stroke={INK} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}
