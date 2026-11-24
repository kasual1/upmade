import { INK, SHAPES } from "../../tokens";

/**
 * The circle agent's eyes, drawn around (0 0), their middle, and closed to `open` (1 open, .08 a slit) the way the
 * landing page closes them: the whole pair, highlights included, squashed vertically about the middle. Same pills
 * and highlights as the rig's own eyes (Agent.tsx), so swapping between the two does not show. The cursor animation
 * uses a run of these, one per openness, for the slow closes and the slits the rig's 90 ms blink cannot draw.
 */
export default function Eyes({ open }: { open: number }) {
  const y = SHAPES.circle.eyesY, cy = y + 3.1;
  return (
    <g transform={`scale(1 ${open}) translate(-32 ${-cy})`}>
      <rect x={24.55} y={y} width={4.3} height={6.2} rx={2.15} fill={INK} />
      <rect x={35.15} y={y} width={4.3} height={6.2} rx={2.15} fill={INK} />
      <circle cx={27.2} cy={y + 1.7} r={1} fill="#FFFFFF" />
      <circle cx={37.8} cy={y + 1.7} r={1} fill="#FFFFFF" />
    </g>
  );
}
