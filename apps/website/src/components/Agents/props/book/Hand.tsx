import { useId } from "react";
import { COLOURS, INK } from "../../tokens";

/**
 * A hand of the "Speed-reading" agent, drawn as a prop rather than with the rig's hands: the original draws its
 * body at 0.78 but its hands (and book) at full size, and the rig would shrink its own hands with the body.
 * Same look as a rig hand: the orange gradient and an ink outline, radius 4.5 as in the original.
 */
export default function Hand() {
  const id = `book-hand-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [light, base] = COLOURS.orange;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset=".65" stopColor={base} />
        </linearGradient>
      </defs>
      <circle r={4.5} fill={`url(#${id})`} stroke={INK} strokeWidth={2.4} />
    </g>
  );
}
