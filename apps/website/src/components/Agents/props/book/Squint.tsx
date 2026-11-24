import { INK, SHAPES } from "../../tokens";

/**
 * The triangle agent's eyes narrowed to `sy` of their height (about their middle), for the squint while it peers at
 * the page and for its two blinks. The rig's eyes can only do their own fixed blink, so the animation hides them and
 * shows these instead, one frame per display frame of each narrowing and widening. Drawn where the rig's eyes are (the origin is the agent's own (0 0)); the
 * animation moves them with the gaze.
 */
export default function Squint({ sy }: { sy: number }) {
  const y = SHAPES.triangle.eyesY, cy = y + 3.1;
  return (
    <g transform={`translate(0 ${cy}) scale(1 ${sy}) translate(0 ${-cy})`}>
      <rect x={24.55} y={y} width={4.3} height={6.2} rx={2.15} fill={INK} />
      <rect x={35.15} y={y} width={4.3} height={6.2} rx={2.15} fill={INK} />
      <circle cx={27.2} cy={y + 1.7} r={0.95} fill="#FFFFFF" />
      <circle cx={37.8} cy={y + 1.7} r={0.95} fill="#FFFFFF" />
    </g>
  );
}
