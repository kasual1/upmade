import { useId } from "react";
import { COLOURS, INK, STROKE, type Colour } from "../../tokens";

/**
 * The "Customizing" agent's (one) hand, drawn as a prop rather than with the rig's hands: the original grows its
 * body from 0.8 to 0.98 but keeps the hand at full size, and the rig would scale its own hands with the body.
 * Same look as a rig hand, radius 4.5 as in the original, in a colour of the family (the demo draws a pink one and
 * an orange copy over it, which the animation fades in and out with the body's colour).
 */
export default function Hand({ colour }: { colour: Colour }) {
  const id = `cp-hand-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [light, base] = COLOURS[colour];
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset=".65" stopColor={base} />
        </linearGradient>
      </defs>
      <circle r={4.5} fill={`url(#${id})`} stroke={INK} strokeWidth={STROKE.hand} />
    </g>
  );
}
