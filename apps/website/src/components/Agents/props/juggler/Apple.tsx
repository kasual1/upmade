import { INK } from "../../tokens";

/**
 * A red apple with a stalk, a green leaf and a pale highlight, centred on (0 0). The original draws it from 64x64
 * artwork (centred on (46.5 39.6)) at 0.56, kept here as is.
 */
export default function Apple() {
  return (
    <g transform="scale(.56) translate(-46.5 -39.6)">
      <path
        d="M46.5 33.4C43.6 31.2 37.4 31.8 37.6 38.8C37.8 45 41.8 49.6 44.6 49.6C45.6 49.6 46 49 46.5 49S47.4 49.6 48.4 49.6C51.2 49.6 55.2 45 55.4 38.8C55.6 31.8 49.4 31.2 46.5 33.4Z"
        fill="#EF4444"
        stroke={INK}
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
      <path d="M46.5 33.2Q46.4 30 48.2 28.2" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" />
      <path d="M48.6 30.6Q51.6 27 55 28.8Q52.4 32.4 48.6 30.6Z" fill="#4ADE80" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M41 37.4Q41.4 35.4 43.2 34.8" fill="none" stroke="#FCA5A5" strokeWidth={1.6} strokeLinecap="round" />
    </g>
  );
}
