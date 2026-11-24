import { useId } from "react";
import { COLOURS, INK, type Colour } from "../../tokens";

/**
 * The hand that handles the glasses, drawn as a prop rather than with the rig's hands: the original's hand is a
 * little bigger than the rig's (radius 4.9 with a 2.6 outline, before the agent's 0.92 shrink). Same look as a rig
 * hand: the agent's colour gradient and an ink outline.
 */
export default function Hand({ colour }: { colour: Colour }) {
  const id = `glasses-hand-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [light, base] = COLOURS[colour];
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset=".65" stopColor={base} />
        </linearGradient>
      </defs>
      <circle r={4.9} fill={`url(#${id})`} stroke={INK} strokeWidth={2.6} />
    </g>
  );
}
