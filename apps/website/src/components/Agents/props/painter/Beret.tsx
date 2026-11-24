import { INK } from "../../tokens";

/**
 * The painter's black beret with its little stalk, worn tilted to the left. Drawn around (0 0), the circle agent's
 * head spot (32 13.6), in the agent's own space: the original markup at its own coordinates, moved by the head spot,
 * with the original's tilt (2.4 to the left, -12 deg about (32 12)) baked in.
 */
export default function Beret() {
  return (
    <g transform="translate(-32 -13.6) translate(-2.4 0) rotate(-12 32 12)">
      <path d="M33 5.2v-3" stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
      <path
        d="M15.5 14.5C16 7 25 4.4 33 4.6C42 4.8 49.5 8.5 49 13.6C48.6 16.8 41 17.4 32 16.8C23 16.4 15.3 17.4 15.5 14.5Z"
        fill="#26262E"
        stroke={INK}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <path d="M21 9.6Q27 6.6 34 6.8" fill="none" stroke="#4A4A55" strokeWidth={1.6} strokeLinecap="round" />
    </g>
  );
}
