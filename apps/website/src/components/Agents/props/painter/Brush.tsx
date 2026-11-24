import { INK } from "../../tokens";

/** The three paints the brush tip cycles through, two seconds each. */
export const PAINTS = { green: "#22C55E", blue: "#3B82F6", yellow: "#F5B400" } as const;
export type Paint = keyof typeof PAINTS;

/**
 * A paintbrush gripped at (0 0) (the middle of the hand), pointing up: a wooden handle, a steel ferrule and a tip
 * loaded with `paint`. The animation tilts it 40 deg towards the canvas.
 */
export default function Brush({ paint }: { paint: Paint }) {
  return (
    <g>
      <rect x={-1.1} y={-6.6} width={2.2} height={8} rx={0.8} fill="#C08A4F" stroke={INK} strokeWidth={1.1} />
      <rect x={-1.3} y={-8.2} width={2.6} height={2} fill="#B8BCC6" stroke={INK} strokeWidth={1} />
      <path d="M-1.3 -8.2Q-1.5 -9.8 0 -10.2Q1.5 -9.8 1.3 -8.2Z" fill={PAINTS[paint]} stroke={INK} strokeWidth={1} />
    </g>
  );
}
