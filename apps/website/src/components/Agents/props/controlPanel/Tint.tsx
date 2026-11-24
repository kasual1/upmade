import { useId } from "react";
import { COLOURS, INK, SHAPES, STROKE, type Colour } from "../../tokens";

/**
 * A coat of a new colour over the body, for the original's 256 ms colour cross-fades: the body outline `d` filled
 * with `colour`'s gradient (as the rig fills the body), with the outline stroke and the (open, ahead-looking) eyes
 * drawn again on top, since a prop lies over them. Drawn in the body's own space; the animation fades it in with an
 * opacity track, then the demo switches the agent to that colour and the coat goes. Over the body's own identical
 * stroke and eyes, fading those in changes nothing, so only the fill visibly cross-fades.
 */
export default function Tint({ d, colour }: { d: string; colour: Colour }) {
  const id = `cp-tint-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [light, base] = COLOURS[colour];
  const y = SHAPES.squircle.eyesY;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset=".65" stopColor={base} />
        </linearGradient>
      </defs>
      <path d={d} fill={`url(#${id})`} stroke={INK} strokeWidth={STROKE.body} strokeLinejoin="round" />
      <rect x={24.55} y={y} width={4.3} height={6.2} rx={2.15} fill={INK} />
      <rect x={35.15} y={y} width={4.3} height={6.2} rx={2.15} fill={INK} />
      <circle cx={27.2} cy={y + 1.7} r={1} fill="#FFFFFF" />
      <circle cx={37.8} cy={y + 1.7} r={1} fill="#FFFFFF" />
    </g>
  );
}
