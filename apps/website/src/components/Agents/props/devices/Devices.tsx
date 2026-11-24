import { INK } from "../../tokens";

/**
 * The three devices the Cross-platform agent switches between, drawn as in the original (dark slate phone and tablet
 * with a camera bump and a home button, a light grey laptop with its keyboard base), each around the point the
 * original scales it about, so a `scale` track pops it in and out in place. Drawn 1/0.85 bigger than in the original,
 * because the rig shrinks its props with the body (by 0.85, see animations/devices.ts): on screen they come out at
 * the original's size.
 */
const OUTLINE = { stroke: INK, strokeWidth: 2.4 } as const;
/** Undoes the body's 0.85 shrink, which the rig applies to props too. */
export const UNSHRINK = `scale(${1 / 0.85})`;

/** A phone held upright, about (44.5 40.2) of the original. */
export function Phone() {
  return (
    <g transform={`${UNSHRINK} translate(-44.5 -40.2)`}>
      <rect x={38.5} y={30.5} width={12} height={19.5} rx={2.6} fill="#3B3B42" {...OUTLINE} />
      <rect x={40.1} y={32.1} width={4.2} height={4.2} rx={1.3} fill="#55555E" />
      <circle cx={41.35} cy={33.35} r={0.75} fill="#16161A" />
      <circle cx={43.05} cy={35.05} r={0.75} fill="#16161A" />
      <circle cx={44.5} cy={41.225} r={1.5} fill="#55555E" />
    </g>
  );
}

/** A tablet held sideways, about (46 42.2) of the original. */
export function Tablet() {
  return (
    <g transform={`${UNSHRINK} translate(-46 -42.2)`}>
      <rect x={35.5} y={34.5} width={21} height={15.5} rx={2.4} fill="#3B3B42" {...OUTLINE} />
      <rect x={37.2} y={36.2} width={4.2} height={4.2} rx={1.3} fill="#55555E" />
      <circle cx={38.45} cy={37.45} r={0.75} fill="#16161A" />
      <circle cx={40.15} cy={39.15} r={0.75} fill="#16161A" />
      <circle cx={46} cy={42.25} r={1.7} fill="#55555E" />
    </g>
  );
}

/** An open laptop (lid with a logo, keyboard base), about (45.2 42) of the original. */
export function Laptop() {
  return (
    <g transform={`${UNSHRINK} translate(-45.2 -42)`}>
      <rect x={34} y={32.5} width={22.5} height={15} rx={1.8} fill="#C9CBD3" {...OUTLINE} />
      <circle cx={45.25} cy={40} r={1.9} fill="#E6E7EC" />
      <rect x={32.5} y={47.5} width={25.5} height={3.6} rx={1.4} fill="#A9ABB5" {...OUTLINE} />
    </g>
  );
}
