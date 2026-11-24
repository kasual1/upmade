import { useId } from "react";
import { INK } from "../../tokens";

/**
 * The "Customizing" agent's control panel: a grey desk the agent stands behind, its top edge at y 49.5, flaring
 * out to the floor at y 62. Drawn as in the original, but around (0 0) = (32 56) of the 64x64 space, the middle of
 * the desk, so the little squash the rig gives it (see animations/controlPanel.ts) is spread evenly about it.
 */
export default function Panel() {
  const id = `cp-panel-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <g transform="translate(-32 -56)">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E4E4E7" />
          <stop offset="1" stopColor="#C4C4CC" />
        </linearGradient>
      </defs>
      <path
        d="M23 49.5H41A2.4 2.4 0 0 1 43.3 51.3L44.6 59.3A2.3 2.3 0 0 1 42.3 62H21.7A2.3 2.3 0 0 1 19.4 59.3L20.7 51.3A2.4 2.4 0 0 1 23 49.5Z"
        fill={`url(#${id})`}
        stroke={INK}
        strokeWidth={3}
        strokeLinejoin="round"
      />
    </g>
  );
}
