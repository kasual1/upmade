import { useId } from "react";
import { COLOURS, INK } from "../../tokens";

/**
 * A hand of the juggler, drawn as a prop rather than with the rig's hands: the original draws the body at 0.66 but
 * its hands at full size (radius 3.2, a 1.75 outline), on top of the juggled objects. Drawn around (0 0) at that
 * size; the animation scales it by 1 / 0.66 to undo the agent's own scale. Blue gradient and an ink outline, like a
 * rig hand.
 */
export default function Hand() {
  const id = `juggler-hand-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [light, base] = COLOURS.blue;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset=".65" stopColor={base} />
        </linearGradient>
      </defs>
      <circle r={3.2} fill={`url(#${id})`} stroke={INK} strokeWidth={1.75} />
    </g>
  );
}
