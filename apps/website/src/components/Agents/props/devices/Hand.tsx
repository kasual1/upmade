import { useId } from "react";
import { COLOURS, INK, type Colour } from "../../tokens";
import { UNSHRINK } from "./Devices";

/**
 * The Cross-platform agent's one hand, drawn as a prop rather than with the rig's hands: in the original the body is
 * shrunk to 0.85 but the hand is not (radius 4.5, outline 2.4), and the rig would shrink its own hands with the body.
 * So it is drawn here 1/0.85 bigger, to come out at the original's size once the rig has shrunk it. Same look as a rig
 * hand: the agent's colour gradient and an ink outline.
 */
export default function Hand({ colour }: { colour: Colour }) {
  const id = `devices-hand-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [light, base] = COLOURS[colour];
  return (
    <g transform={UNSHRINK}>
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
