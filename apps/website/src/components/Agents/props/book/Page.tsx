import { INK } from "../../tokens";

/**
 * One frame of a page being turned: the white page rising out of the book, squeezed sideways about the spine by
 * `sx` (1 lying on the right, 0 edge-on, -1 turned over onto the left). The original animates that horizontal
 * squeeze; props only have a uniform scale, so the animation shows a run of these frames one after another.
 * Same origin as `Book`: (0 0) is the middle of the spine at y 52.
 */
export default function Page({ sx }: { sx: number }) {
  return (
    <g transform={`scale(${sx} 1) translate(-32 -55)`}>
      <path d="M32 42.0Q39.5 39.4 46.6 41.2V53.4H32Z" fill="#FFFFFF" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
    </g>
  );
}
