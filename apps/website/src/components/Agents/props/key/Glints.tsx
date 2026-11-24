import { INK } from "../../tokens";

/**
 * The squircle agent's two eye glints (where the rig draws them, on the pupils' upper left), in white, or in ink
 * and a touch bigger to hide the rig's own. The key agent's glints drift inside its pupils on their own path (not
 * quite with the gaze), which the rig's fixed glints cannot do: an ink pair covers the rig's glints and a white
 * pair is moved instead.
 */
export default function Glints({ cover = false }: { cover?: boolean }) {
  const fill = cover ? INK : "#FFFFFF", r = cover ? 1.15 : 1;
  return (
    <g fill={fill}>
      <circle cx={27.2} cy={32.2} r={r} />
      <circle cx={37.8} cy={32.2} r={r} />
    </g>
  );
}
