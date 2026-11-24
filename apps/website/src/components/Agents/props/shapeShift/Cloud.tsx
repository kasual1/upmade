import { useId } from "react";
import { INK } from "../../tokens";

/** [cx, cy, r] of a puff's circles (the white fill; the ink outline is the same circle 1.8 bigger) */
type Puff = readonly (readonly [number, number, number])[];
/** [x, y, size] of the yellow twinkles around it */
type Twinkles = readonly (readonly [number, number, number])[];

/**
 * The three poofs of the original, one per change of shape (circle to triangle, triangle to square, square to
 * circle), copied from its markup: a white cloud of overlapping circles with an ink rim, and three twinkles.
 */
const CLOUDS: ReadonlyArray<{ puff: Puff; twinkles: Twinkles }> = [
  {
    puff: [[32, 29, 10], [21, 33, 7.5], [43, 33, 8], [25, 22, 7], [39, 21, 7.5], [31, 39, 7.5], [13.5, 30, 4.5]],
    twinkles: [[12, 17, 1], [53, 15, 0.8], [50, 47, 0.65]],
  },
  {
    puff: [[30, 30, 9.5], [41, 27, 9], [20, 28, 7], [34, 39, 8], [22, 38, 6], [31, 20, 6.5], [50, 35, 5]],
    twinkles: [[15, 14, 0.85], [52, 17, 0.95], [13, 45, 0.6]],
  },
  {
    puff: [[33, 31, 10.5], [22, 25, 8], [44, 24, 7], [21, 37, 7], [44, 38, 7.5], [33, 20, 5.5], [54, 29, 3.8]],
    twinkles: [[10, 27, 0.8], [48, 11, 0.9], [40, 51, 0.6]],
  },
];

/** a four-pointed twinkle around (0 0) */
const TWINKLE = "M0-4Q.6-.6 4 0Q.6 .6 0 4Q-.6 .6-4 0Q-.6-.6 0-4Z";

/** The rim: every circle is first drawn in ink this much bigger, then in white on top, so only the outer edge shows. */
const RIM = 1.8;

/**
 * A puff of cloud, drawn around (0 0) = the point (32 30) of the original's 64x64 drawing, which it scales and
 * tilts about. `which` picks one of the three poofs (0, 1, 2).
 */
export default function Cloud({ which }: { which: 0 | 1 | 2 }) {
  const id = `cloud-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const { puff, twinkles } = CLOUDS[which];
  return (
    <g transform="translate(-32 -30)">
      <defs>
        {/* in the drawing's own space, as in the original: white down to y 33, greying slightly towards y 47 */}
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="13" x2="0" y2="47">
          <stop offset=".6" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#EDEDF1" />
        </linearGradient>
      </defs>
      <g fill={INK}>
        {puff.map(([cx, cy, r], n) => <circle key={n} cx={cx} cy={cy} r={r + RIM} />)}
      </g>
      <g fill={`url(#${id})`}>
        {puff.map(([cx, cy, r], n) => <circle key={n} cx={cx} cy={cy} r={r} />)}
      </g>
      {twinkles.map(([x, y, size], n) => (
        <path key={n} d={TWINKLE} transform={`translate(${x} ${y}) scale(${size})`} fill="#FFD84D" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
      ))}
    </g>
  );
}
