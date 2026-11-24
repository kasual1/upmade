import { INK } from "../../tokens";

/**
 * A pocket calculator (the one on the page's canvas): a white case 10.4 x 13.2, a light blue display and two rows
 * of keys, the right-hand ones pink. Centred on (0 0), at the original's size.
 */
export default function Calculator() {
  const keys = [-2.4, 0, 2.4].flatMap((x, n) =>
    [0.4, 3].map((y) => <circle key={`${x} ${y}`} cx={x} cy={y} r={0.95} fill={n === 2 ? "#FF6AB5" : "#FFFFFF"} stroke={INK} strokeWidth={0.6} />),
  );
  return (
    <g>
      <rect x={-5.2} y={-6.6} width={10.4} height={13.2} rx={2.2} fill="#FFFFFF" stroke={INK} strokeWidth={2} />
      <rect x={-3.2} y={-4.6} width={6.4} height={2.8} rx={0.8} fill="#CDEBFF" stroke={INK} strokeWidth={0.9} />
      {keys}
    </g>
  );
}
