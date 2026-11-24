import { useId } from "react";
import { COLOURS, INK, type Colour } from "../../tokens";

/**
 * The wand with the hand holding it, drawn around the hand's centre. The wand points up and right (48 degrees) out of
 * the hand; the hand is drawn on top. It is a prop rather than the rig's hand because the original hand is full size
 * next to a body shrunk to 0.62 (the rig's hands would shrink with the body).
 */
export default function Wand({ colour }: { colour: Colour }) {
  const id = `wizard-hand-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [light, base] = COLOURS[colour];
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset=".65" stopColor={base} />
        </linearGradient>
      </defs>
      <g transform="rotate(48)">
        <rect x={-1} y={-13} width={2} height={12} rx={0.8} fill="#26262E" stroke={INK} strokeWidth={1.2} />
        <rect x={-1} y={-13} width={2} height={3} rx={0.8} fill="#FFFFFF" stroke={INK} strokeWidth={1.2} />
      </g>
      <circle r={4.5} fill={`url(#${id})`} stroke={INK} strokeWidth={2.4} />
    </g>
  );
}
