import { useId } from "react";
import { COLOURS, INK, type Colour } from "../../tokens";

/**
 * A hand of the WebMCP agent, drawn as a prop rather than with the rig's hands: in the original the agent's body is
 * shrunk to 0.8 but its hands are not (radius 4.2, outline 2.4), and the rig would shrink its own hands with the
 * body. The animation scales this prop back up by 1/0.8, so it is drawn here at the original's size. Same look as a
 * rig hand: the agent's colour gradient and an ink outline.
 */
export default function Hand({ colour }: { colour: Colour }) {
  const id = `plug-hand-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [light, base] = COLOURS[colour];
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset=".65" stopColor={base} />
        </linearGradient>
      </defs>
      <circle r={4.2} fill={`url(#${id})`} stroke={INK} strokeWidth={2.4} />
    </g>
  );
}
