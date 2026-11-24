import { useId } from "react";
import { INK, STROKE } from "../tokens";

export type HatKind = "topHat" | "cap" | "beanie" | "beret" | "party";
export const HAT_KINDS: HatKind[] = ["topHat", "cap", "beanie", "beret", "party"];

/** A hat drawn around (0 0), the middle of its base, rising upwards (as worn on an agent's head). */
export default function Hat({ kind }: { kind: HatKind }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const g = (name: string) => `url(#hat-${name}-${id})`;
  const grad = (name: string, a: string, b: string) => (
    <linearGradient id={`hat-${name}-${id}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={a} />
      <stop offset=".65" stopColor={b} />
    </linearGradient>
  );
  const line = { stroke: INK, strokeWidth: STROKE.prop, strokeLinejoin: "round" as const };
  return (
    <g>
      <defs>
        {grad("black", "#3a3a40", "#1f1f23")}
        {grad("pink", "#ff8bc5", "#FF6AB5")}
        {grad("cream", "#fffaf0", "#f0dfc2")}
        {grad("terra", "#e2765d", "#c8553d")}
        {grad("blue", "#8fd0ff", "#6FC3FF")}
      </defs>
      {kind === "topHat" && (
        <>
          <rect x={-12.5} y={-1.8} width={25} height={3.4} rx={1.7} fill={INK} />
          <rect x={-8.5} y={-14} width={17} height={12.8} rx={1.8} fill={g("black")} {...line} strokeWidth={1.6} />
          <rect x={-8.5} y={-5.6} width={17} height={2.6} fill="#FFFFFF" stroke={INK} strokeWidth={1} />
        </>
      )}
      {kind === "cap" && (
        <>
          <path d="M7 -.6L18.4 .6Q20.2 1.6 18.4 2.6L7 2Z" fill="#FF6AB5" {...line} strokeWidth={1.6} />
          <path d="M-11.6 1C-12 -13 12 -13 11.6 1Z" fill={g("pink")} {...line} />
          <path d="M0 -10.6V.6" stroke="#d94f98" strokeWidth={0.9} />
          <circle cy={-10.6} r={1.4} fill="#FF6AB5" stroke={INK} strokeWidth={1.1} />
        </>
      )}
      {kind === "beanie" && (
        <>
          <path d="M-12.6 -2C-12.6 -16.4 12.6 -16.4 12.6 -2Z" fill={g("cream")} {...line} />
          <rect x={-14} y={-4.2} width={28} height={6} rx={3} fill={g("terra")} {...line} />
          {[-12, -9, -6, -3, 0, 3, 6, 9, 12].map((x) => (
            <path key={x} d={`M${x} -3.2V.4`} stroke="#8f3524" strokeWidth={0.7} strokeLinecap="round" />
          ))}
          <circle cy={-15.6} r={3.3} fill={g("cream")} {...line} />
        </>
      )}
      {kind === "beret" && (
        <>
          <path d="M-13.4 -.6Q-15 -10.6 0 -11Q14.6 -10.6 13.4 -.6Q0 2.6 -13.4 -.6Z" fill={g("black")} {...line} />
          <path d="M1 -10.8Q1.4 -13.2 3 -13.8" fill="none" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
          <path d="M-8.6 -7.4Q-4 -9.2 1.6 -9.2" fill="none" stroke="#5a5a62" strokeWidth={1} strokeLinecap="round" />
        </>
      )}
      {kind === "party" && (
        <>
          <path d="M-9.6 .8L0 -19.6L9.6 .8Q0 3.4 -9.6 .8Z" fill={g("blue")} {...line} />
          <circle cx={-2.6} cy={-5} r={1.2} fill="#FFFFFF" />
          <circle cx={3.4} cy={-2.4} r={1.2} fill="#FF8BC5" />
          <circle cx={1} cy={-11} r={1.1} fill="#FFFFFF" />
          <circle cx={-4.6} cy={-0.8} r={1.1} fill="#FFD60A" />
          <circle cy={-19.8} r={2.8} fill="#FFFFFF" stroke={INK} strokeWidth={1.5} />
        </>
      )}
    </g>
  );
}
