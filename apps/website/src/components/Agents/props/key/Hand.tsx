import { useId } from "react";
import { COLOURS, INK, type Colour } from "../../tokens";

/**
 * The hand holding the key, drawn as a prop rather than with the rig's hands: the original hand is bigger than the
 * rig's (radius 5.294 before the agent's 0.85 shrink, 4.5 after) and it shrinks with the key as it goes behind the
 * body, which needs a scale track the rig's hands do not have. Same look as a rig hand: the agent's colour gradient
 * and an ink outline.
 */
export default function Hand({ colour }: { colour: Colour }) {
  const id = `key-hand-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [light, base] = COLOURS[colour];
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset=".65" stopColor={base} />
        </linearGradient>
      </defs>
      <circle r={5.294} fill={`url(#${id})`} stroke={INK} strokeWidth={2.824} />
    </g>
  );
}
