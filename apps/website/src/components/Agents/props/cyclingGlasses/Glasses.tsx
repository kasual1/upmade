import { useId } from "react";
import { INK } from "../../tokens";

/**
 * The paths of the landing page's glasses, in its coordinates. The props draw them shifted so that the right temple,
 * (51 33.5), is their origin: that is the point the hand holds them by and the point they turn about.
 */
const PIVOT = "translate(-51 -33.5)";
const LENS_L = "M15.8 31.4H31.1L31.4 34Q31.5 36.4 30.1 38.4Q28.2 41.9 23.6 42Q18.9 42 16.9 38.4Q15.3 35.4 15.8 31.4Z";
const LENS_R = "M48.2 31.4H32.9L32.6 34Q32.5 36.4 33.9 38.4Q35.8 41.9 40.4 42Q45.1 42 47.1 38.4Q48.7 35.4 48.2 31.4Z";

/**
 * Wraparound cycling glasses, drawn around the right temple (see PIVOT): two short arms, two lenses with a
 * rainbow mirror finish (the family's colours, reflected across a diagonal), the thick ink band over the top
 * and the nose bridge. The lens glint and the white shine are separate props (`Glint`, `Shine`), drawn above it.
 */
export default function Glasses() {
  const id = `glasses-rb-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <g transform={PIVOT}>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="16" y1="30" x2="34" y2="44" spreadMethod="reflect">
          <stop offset="0" stopColor="#FF6AB5" />
          <stop offset=".2" stopColor="#FF9F5A" />
          <stop offset=".4" stopColor="#FFD60A" />
          <stop offset=".6" stopColor="#4ADE80" />
          <stop offset=".8" stopColor="#6FC3FF" />
          <stop offset="1" stopColor="#B79CFF" />
        </linearGradient>
      </defs>
      <path d="M15.2 31.8Q12.6 32.4 11 34.6M48.8 31.8Q51.4 32.4 53 34.6" fill="none" stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
      <path d={LENS_L} fill={`url(#${id})`} stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
      <path d={LENS_R} fill={`url(#${id})`} stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
      <path d="M14.8 31.6Q32 29.4 49.2 31.6" fill="none" stroke={INK} strokeWidth={3.6} strokeLinecap="round" />
      <path d="M30.2 31.2Q32 33.2 33.8 31.2" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

/**
 * One frame of the glint that sweeps across the lenses: two slanted white strips, `x` units to the right of where
 * the original draws them, clipped to the lenses. The sweep is a row of these frames, each shown for a moment (a
 * prop's clip moves with it, so the strips cannot slide under a fixed clip within one prop).
 */
export function Glint({ x }: { x: number }) {
  const id = `glasses-clip-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <g transform={PIVOT}>
      <defs>
        <clipPath id={id}>
          <path d={LENS_L} />
          <path d={LENS_R} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <path d="M0 46L7 26H10.4L3.4 46ZM5.4 46L12.4 26H14L7 46Z" fill="#FFFFFF" opacity={0.75} transform={`translate(${x} 0)`} />
      </g>
    </g>
  );
}

/** The thin white shine along the top of each lens, above the glint. */
export function Shine() {
  return (
    <g transform={PIVOT}>
      <path d="M18.2 34.2Q22 33.4 28.8 33.6M35.2 33.6Q42 33.4 45.8 34.2" fill="none" stroke="#FFFFFF" strokeWidth={1.1} strokeLinecap="round" opacity={0.8} />
    </g>
  );
}
