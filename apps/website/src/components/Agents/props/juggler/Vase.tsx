import { INK } from "../../tokens";

/**
 * A blue vase with a light band round its belly, centred on (0 0). The original draws it from 64x64 artwork
 * (centred on (46.5 39.6)) at 0.56, kept here as is; about 9.6 wide and 11.4 tall.
 */
export default function Vase() {
  return (
    <g transform="scale(.56) translate(-46.5 -39.6)">
      <path
        d="M43.5 29.5H49.5V31.6C49.5 32.6 50.2 33 51.2 33.6C54.6 35.5 55.6 39 54.8 42.6C54 46.6 51 49.6 47.6 49.6H45.4C42 49.6 39 46.6 38.2 42.6C37.4 39 38.4 35.5 41.8 33.6C42.8 33 43.5 32.6 43.5 31.6Z"
        fill="#60A5FA"
        stroke={INK}
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
      <path d="M39.6 40.4H53.4" stroke="#DBEAFE" strokeWidth={1.8} strokeLinecap="round" />
      <path d="M42.6 29.5H50.4" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
    </g>
  );
}
