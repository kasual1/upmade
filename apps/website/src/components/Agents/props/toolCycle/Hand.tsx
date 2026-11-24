import { useId } from "react";
import { COLOURS, INK } from "../../tokens";

/**
 * The tool-cycle agent's hands, drawn around (0 0): the original hero agent draws its own hands, a little bigger than
 * the rig's (radius 5, a 2.6 outline), and the small hand that types on the typewriter (radius 3.4, a 2.2 outline).
 * Both are filled with the pink family gradient, like the body.
 */
export default function Hand({ small = false }: { small?: boolean }) {
  const id = `tool-cycle-hand-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [light, base] = COLOURS.pink;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset=".65" stopColor={base} />
        </linearGradient>
      </defs>
      <circle r={small ? 3.4 : 5} fill={`url(#${id})`} stroke={INK} strokeWidth={small ? 2.2 : 2.6} />
    </g>
  );
}
