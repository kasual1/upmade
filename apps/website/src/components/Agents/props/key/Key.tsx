import { useId } from "react";
import { INK } from "../../tokens";

/**
 * The golden key of the "Open source" agent, gripped at (0 0) by its ring, with the shaft and teeth rising above.
 * Drawn as in the landing page (a 0.78 scale of the original outline, lifted 10.3 before scaling), in the
 * pre-shrink units of that agent: its animation shrinks the whole agent to 0.85.
 */
export default function Key() {
  const id = `key-gold-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2=".5" y2="1">
          <stop offset="0" stopColor="#FFE58A" />
          <stop offset=".8" stopColor="#F5B400" />
        </linearGradient>
      </defs>
      <g transform="scale(.78) translate(0 -10.3)">
        <path
          d="M3.2 -6.672L3.2 -12.6L6.6 -12.6L6.6 -17.8L3.2 -17.8L3.2 -20.6L8.8 -20.6L8.8 -25.6L-3.2 -25.6L-3.2 -6.672A7.4 7.4 0 1 0 3.2 -6.672Z"
          fill={`url(#${id})`}
          stroke={INK}
          strokeWidth={3.6}
          strokeLinejoin="round"
        />
        {/* the hole in the ring */}
        <circle r={2.4} fill={INK} />
      </g>
    </g>
  );
}
