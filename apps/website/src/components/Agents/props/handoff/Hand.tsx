import { useId } from "react";
import { COLOURS, INK, STROKE, type Colour } from "../../tokens";

/**
 * A hand of one of the two collaborating agents, drawn as a prop of the full-size "stage" agent (see
 * animations/handoff.ts): the original draws the two agents at 0.7 but their hands at full size, radius 4.5, on top
 * of both bodies. Same look as a rig hand: the agent's colour gradient and an ink outline. Drawn around (0 0).
 */
export default function Hand({ colour }: { colour: Colour }) {
  const id = `handoff-hand-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
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
