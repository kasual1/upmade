import { INK } from "../../tokens";

/** How tall the squircle agent's eyes are; they start at y 30.5. */
const H = 6.2;

/**
 * A copy of the squircle agent's open eyes (ink pills with their glints), drawn over the rig's own. Slid up by s,
 * the copy and the rig's eyes together make pills s taller, which is how the key agent's eyes stretch (upwards,
 * about their lower ends) just before the reveal; the glints go up with the copy.
 */
export default function TallEyes() {
  return (
    <g>
      <rect x={24.55} y={30.5} width={4.3} height={H} rx={2.15} fill={INK} />
      <rect x={35.15} y={30.5} width={4.3} height={H} rx={2.15} fill={INK} />
      <circle cx={27.2} cy={32.2} r={1} fill="#FFFFFF" />
      <circle cx={37.8} cy={32.2} r={1} fill="#FFFFFF" />
    </g>
  );
}
