import { INK } from "../../tokens";
import Hand from "./Hand";

/**
 * The tools the hero agent of infinite.html cycles through, drawn exactly as the original page draws them (ink
 * outlines, flat fills). Each is drawn around the point the animation places it at: for the tools held in the right
 * hand, the hand's centre, as in the original; the parts that move inside a tool (the brush's tilt, the eraser's
 * toss, the typewriter's carriage, the juggled shapes) are separate props, placed by the animation.
 */
const line = { stroke: INK, strokeLinejoin: "round" as const };

/** The paintbrush, bristles up, as it sits in the hand's grip (the original's `.tilt` group; the hand is drawn on top). */
export function Brush() {
  return (
    <g>
      <rect x={-1.7} y={-15.5} width={3.4} height={22} rx={1.7} fill="#C08A4F" stroke={INK} strokeWidth={2.2} />
      <rect x={-2.6} y={-19.6} width={5.2} height={5.4} rx={1} fill="#D4D4D8" stroke={INK} strokeWidth={2.2} />
      <path d="M-2.7 -19.6C-3.2 -23.6 -1.6 -27.6 0 -30.4C1.6 -27.6 3.2 -23.6 2.7 -19.6Z" fill="#4A7DFF" {...line} strokeWidth={2.2} />
      <path d="M-.6 -21.5C-.9 -23.8 -.3 -25.8 .4 -27.3" fill="none" stroke="#FFFFFF" strokeWidth={0.9} strokeLinecap="round" opacity={0.7} />
    </g>
  );
}

/** The eraser (blue sleeve, pink rubber), drawn around its own middle; the hand holds it from behind. */
export function Eraser() {
  return (
    <g>
      <rect x={-4} y={-6.8} width={8} height={13.6} rx={2} fill="#FFC2D6" {...line} strokeWidth={2} />
      <path d="M-4 -.6H4V-4.8A2 2 0 0 0 2 -6.8H-2A2 2 0 0 0 -4 -4.8Z" fill="#6FC3FF" {...line} strokeWidth={2} />
    </g>
  );
}

/** A plain black line arrow pointing up (the toolbar's arrow tool), drawn around its middle. */
export function Arrow() {
  return <path d="M0 11V-10.6M-5.6 -5L0 -10.6L5.6 -5" fill="none" stroke={INK} strokeWidth={3.8} strokeLinecap="round" strokeLinejoin="round" />;
}

/** One of the three juggled shapes (the friends' colours), at the 1.55 the original draws them at. */
export function Shape({ kind }: { kind: "triangle" | "square" | "circle" }) {
  return (
    <g transform="scale(1.55)">
      {kind === "triangle" && <path d="M0 -4.6L4.4 3.2H-4.4Z" fill="#4ADE80" {...line} strokeWidth={2} />}
      {kind === "square" && <rect x={-3.3} y={-3.3} width={6.6} height={6.6} rx={1.1} fill="#FFD60A" {...line} strokeWidth={2} />}
      {kind === "circle" && <circle r={3.4} fill="#6FC3FF" stroke={INK} strokeWidth={2} />}
    </g>
  );
}

/**
 * The typewriter's body, seen from behind (it faces the agent): the yellow base and its two grooves, drawn around the
 * middle of its top edge (the original's `translate(-10 5)` group).
 */
export function TypewriterBase() {
  return (
    <g>
      <path d="M-11.5 -.6H11.5L13.4 6.4H-13.4Z" fill="#FFD60A" {...line} strokeWidth={2.2} />
      <path d="M-6 2.4H6M-6.6 4.2H6.6" stroke={INK} strokeWidth={1} strokeLinecap="round" opacity={0.55} />
    </g>
  );
}

/** The carriage: the blank back of the sheet, the roller and its two knobs. It slides sideways as the agent types. */
export function TypewriterCarriage() {
  return (
    <g>
      <rect x={-7} y={-11} width={14} height={9.5} rx={0.8} fill="#FFFFFF" {...line} strokeWidth={1.6} />
      <rect x={-11.5} y={-3.6} width={23} height={3.8} rx={1.9} fill="#D4D4D8" {...line} strokeWidth={1.8} />
      <circle cx={-12.6} cy={-1.7} r={1.5} fill={INK} />
      <circle cx={12.6} cy={-1.7} r={1.5} fill={INK} />
    </g>
  );
}

/** The photo (a sky, a sun and a green hill), held up in the right hand, which is drawn on top. */
export function Photo() {
  return (
    <g>
      <rect x={-8.5} y={-22} width={17} height={19.5} rx={1.3} fill="#FFFFFF" {...line} strokeWidth={2} />
      <rect x={-6.5} y={-20} width={13} height={11.5} rx={0.6} fill="#8FD0FF" {...line} strokeWidth={1.2} />
      <circle cx={3} cy={-16.4} r={1.8} fill="#FFD60A" stroke={INK} strokeWidth={0.9} />
      <path d="M-6.5 -10.6Q-2.6 -15 1 -11.6Q3.6 -14.2 6.5 -11.2V-8.5H-6.5Z" fill="#4ADE80" {...line} strokeWidth={1} />
      <Hand />
    </g>
  );
}
