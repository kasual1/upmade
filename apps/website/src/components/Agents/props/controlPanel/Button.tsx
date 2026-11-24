import { INK } from "../../tokens";

/**
 * The big red button on the control panel, with a little white glint. Drawn as in the original, around
 * (0 0) = (32 50.2) of the 64x64 space (its middle); its lower half sits behind the panel's top edge, so it sinks
 * into the desk when it is pressed (the animation moves it down 2.4).
 */
export default function Button() {
  return (
    <g transform="translate(-32 -50.2)">
      <rect x={26.5} y={46.2} width={11} height={8} rx={2.6} fill="#FF5C5C" stroke={INK} strokeWidth={2.2} />
      <rect x={28.6} y={47.7} width={3.4} height={1.4} rx={0.7} fill="#FFFFFF" opacity={0.75} />
    </g>
  );
}
