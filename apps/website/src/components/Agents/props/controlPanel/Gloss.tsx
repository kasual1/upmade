import { useId } from "react";
import { INK, SHAPES, STROKE } from "../../tokens";
import { SQUARE } from "../../animations/controlPanel";

/**
 * One frame of the shine that sweeps across the body after its new paint job: two white diagonal stripes (.55
 * opaque) at `x` along the sweep, clipped to the (square) body. The rig cannot clip a prop to the body, and a
 * clip inside a prop would travel with the prop, so the sweep is a flipbook of these frames, each clipped where it
 * stands. It is drawn in the body's own space (it moves and scales with it). In the original the shine lies under
 * the body's outline and eyes, so each frame draws the outline and the (open, ahead-looking) eyes again on top.
 */
export default function Gloss({ x }: { x: number }) {
  const id = `cp-gloss-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const y = SHAPES.squircle.eyesY;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <path d={SQUARE} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <path transform={`translate(${x} 0)`} d="M14 8h9l-12 50h-9zM27 8h4l-12 50h-4z" fill="#FFFFFF" opacity={0.55} />
      </g>
      <path d={SQUARE} fill="none" stroke={INK} strokeWidth={STROKE.body} strokeLinejoin="round" />
      <rect x={24.55} y={y} width={4.3} height={6.2} rx={2.15} fill={INK} />
      <rect x={35.15} y={y} width={4.3} height={6.2} rx={2.15} fill={INK} />
      <circle cx={27.2} cy={y + 1.7} r={1} fill="#FFFFFF" />
      <circle cx={37.8} cy={y + 1.7} r={1} fill="#FFFFFF" />
    </g>
  );
}
