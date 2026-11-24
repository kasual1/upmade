import { INK } from "../../tokens";

const WOOD = "#C08A4F";
const LEGS = "M40 34L36.5 58M54 34L57.5 58M47 34V57";

/**
 * The wooden easel with a blank canvas on it. Drawn in the original's own coordinates (its origin is the drawing's
 * (0 0), not a point of the easel), with the original's placement baked in: 6.2 to the left and 0.8 of its size
 * about (47 57), the foot of its middle leg.
 */
export default function Easel() {
  return (
    <g transform="translate(-6.2 0) translate(47 57) scale(.8) translate(-47 -57)">
      <path d={LEGS} stroke={INK} strokeWidth={4.4} strokeLinecap="round" />
      <path d={LEGS} stroke={WOOD} strokeWidth={2} strokeLinecap="round" />
      <rect x={35.5} y={13} width={23} height={25} rx={1.6} fill="#EADCC4" stroke={INK} strokeWidth={2.4} />
      <rect x={37.9} y={15.4} width={18.2} height={20.2} rx={0.6} fill="none" stroke={WOOD} strokeWidth={2.2} />
      <path d="M47 15.4V35.6" stroke={WOOD} strokeWidth={2.2} />
      <rect x={33.8} y={37.6} width={26.4} height={3.4} rx={1.4} fill={WOOD} stroke={INK} strokeWidth={2} />
    </g>
  );
}
