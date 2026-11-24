import { useId } from "react";
import { COLOURS, INK, STROKE, type Colour } from "../tokens";

/** The radius of every agent's hand (the rig's own hands are drawn the same). */
export const HAND_RADIUS = 4.6;

/**
 * An agent's hand drawn as a prop: for animations whose hands do something the rig's two hands can't (a third hand
 * on a stage layer, a hand that holds a tool). Drawn exactly like the rig's hands (the colour's gradient, an ink
 * outline), so at prop scale 1 on an agent at the family's size it is the same size as every other hand: give a hand
 * prop the scale that undoes whatever its animation draws it at (see each animation). `size` is only for a hand
 * drawn inside something that is itself scaled up (the tool cycle's typewriter).
 */
export default function Hand({ colour, size = 1 }: { colour: Colour; size?: number }) {
  const id = `hand-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [light, base] = COLOURS[colour];
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset=".65" stopColor={base} />
        </linearGradient>
      </defs>
      <circle r={HAND_RADIUS * size} fill={`url(#${id})`} stroke={INK} strokeWidth={STROKE.hand * size} />
    </g>
  );
}
