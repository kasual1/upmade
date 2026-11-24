import { useId } from "react";
import { COLOURS, INK, STROKE } from "../../tokens";

/**
 * The painter's brush hand, drawn as a prop of the "stage" agent (see animations/painter.ts): the original draws the
 * painter at 0.62 but this hand at full size, radius 4.5 (the demo scales it up to make up for the shared 0.62 box). Same look as a rig hand: the violet gradient and
 * an ink outline. Drawn around (0 0).
 */
export default function Hand() {
  const id = `painter-hand-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [light, base] = COLOURS.violet;
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
