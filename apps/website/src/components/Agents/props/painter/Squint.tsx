import { INK, SHAPES } from "../../tokens";

/**
 * The circle agent's eyes narrowed to `sy` of their height (about their middle, y 33.2, where the rig's own blink
 * scales them). The rig's eyes can only do a quick 90 ms blink, so while the painter squints at its canvas (and for
 * its slower blink) the animation hides them and shows a few of these frames instead. Drawn where the rig's eyes are
 * (the origin is the agent's own (0 0)); the animation moves them with the gaze.
 */
export default function Squint({ sy }: { sy: number }) {
  const y = SHAPES.circle.eyesY, cy = y + 3.1;
  return (
    <g transform={`translate(0 ${cy}) scale(1 ${sy}) translate(0 ${-cy})`}>
      <rect x={24.55} y={y} width={4.3} height={6.2} rx={2.15} fill={INK} />
      <rect x={35.15} y={y} width={4.3} height={6.2} rx={2.15} fill={INK} />
      <circle cx={27.2} cy={y + 1.7} r={0.95} fill="#FFFFFF" />
      <circle cx={37.8} cy={y + 1.7} r={0.95} fill="#FFFFFF" />
    </g>
  );
}
