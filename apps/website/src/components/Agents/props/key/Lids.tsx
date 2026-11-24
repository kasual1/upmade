import { useId } from "react";
import { COLOURS, type Colour } from "../../tokens";

/** Where the lids' lower edge (0 0) sits when the eyes are narrowed; their fill is lined up with the body's there. */
const EDGE = 32.2;

/**
 * Narrows the squircle agent's eyes: a band of the body's own colour laid over the tops of both eyes, its lower edge
 * at (0 0), so whatever of the eyes is above that edge disappears, as the landing page does by clipping the eyes.
 * Its gradient is the body's (light at the top of the outline, the base colour from 65% down), placed in the body's
 * coordinates for the lids at their narrowed spot, so the band cannot be told apart from the body there; while the
 * lids slide down to it and back up (about a quarter of a second each way) the shade is off by a few levels at most.
 */
export default function Lids({ colour }: { colour: Colour }) {
  const id = `key-lids-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [light, base] = COLOURS[colour];
  const [top, bottom] = [13.5, 49.5]; // the squircle outline's extent, which the body's gradient spans
  return (
    <g>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1={top - EDGE} x2="0" y2={bottom - EDGE}>
          <stop offset="0" stopColor={light} />
          <stop offset=".65" stopColor={base} />
        </linearGradient>
      </defs>
      {/* wide enough for both eyes (x 24.55 to 39.45) and their gaze, short enough to stay inside the outline */}
      <rect x={22} y={-6} width={20} height={6} fill={`url(#${id})`} />
    </g>
  );
}
