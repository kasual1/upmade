import { INK } from "../../tokens";

/**
 * The three things the wizard conjures, in turn, in the same spot: a blue vase, a red apple and a white rabbit. Each
 * is drawn around the point it grows from (46.5 40 in the original's drawing, the middle of the object).
 */

export function Vase() {
  return (
    <g transform="translate(-46.5 -40)">
      <path d="M43.5 29.5H49.5V31.6C49.5 32.6 50.2 33 51.2 33.6C54.6 35.5 55.6 39 54.8 42.6C54 46.6 51 49.6 47.6 49.6H45.4C42 49.6 39 46.6 38.2 42.6C37.4 39 38.4 35.5 41.8 33.6C42.8 33 43.5 32.6 43.5 31.6Z" fill="#60A5FA" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
      <path d="M39.6 40.4H53.4" stroke="#DBEAFE" strokeWidth={1.8} strokeLinecap="round" />
      <path d="M42.6 29.5H50.4" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
    </g>
  );
}

export function Apple() {
  return (
    <g transform="translate(-46.5 -40)">
      <path d="M46.5 33.4C43.6 31.2 37.4 31.8 37.6 38.8C37.8 45 41.8 49.6 44.6 49.6C45.6 49.6 46 49 46.5 49S47.4 49.6 48.4 49.6C51.2 49.6 55.2 45 55.4 38.8C55.6 31.8 49.4 31.2 46.5 33.4Z" fill="#EF4444" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
      <path d="M46.5 33.2Q46.4 30 48.2 28.2" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" />
      <path d="M48.6 30.6Q51.6 27 55 28.8Q52.4 32.4 48.6 30.6Z" fill="#4ADE80" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M41 37.4Q41.4 35.4 43.2 34.8" fill="none" stroke="#FCA5A5" strokeWidth={1.6} strokeLinecap="round" />
    </g>
  );
}

/** The rabbit: an ink silhouette (ears, body, head) with the white rabbit inset in it, so it reads as outlined. */
export function Rabbit() {
  const ears = [[43.8, -10], [49.2, 10]] as const;
  return (
    <g transform="translate(-46.5 -40)">
      <g fill={INK}>
        {ears.map(([x, r]) => <ellipse key={x} cx={x} cy={28.6} rx={3.1} ry={6.6} transform={`rotate(${r} ${x} 28.6)`} />)}
        <ellipse cx={46.5} cy={45.2} rx={8.6} ry={6.4} />
        <ellipse cx={46.5} cy={37} rx={6.6} ry={6} />
      </g>
      <g fill="#FFFFFF">
        {ears.map(([x, r]) => <ellipse key={x} cx={x} cy={28.6} rx={1.9} ry={5.4} transform={`rotate(${r} ${x} 28.6)`} />)}
        <ellipse cx={46.5} cy={45.2} rx={7.4} ry={5.2} />
        <ellipse cx={46.5} cy={37} rx={5.4} ry={4.8} />
      </g>
      {ears.map(([x, r]) => <ellipse key={x} cx={x} cy={29.2} rx={0.8} ry={3.4} fill="#FBB6CE" transform={`rotate(${r} ${x} 28.6)`} />)}
      <circle cx={44.6} cy={36.6} r={0.95} fill={INK} />
      <circle cx={48.4} cy={36.6} r={0.95} fill={INK} />
      <path d="M45.8 38.6H47.2L46.5 39.4Z" fill="#F472B6" stroke="#F472B6" strokeWidth={0.6} strokeLinejoin="round" />
    </g>
  );
}
