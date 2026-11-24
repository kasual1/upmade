/**
 * The agents' look, in one place: ink, strokes, the family's colours and the body shapes. Every agent and prop
 * draws with these, so restyling the family means changing this file.
 */
import type { Vec } from "./types";

export const INK = "#0A0A0A";
export const STROKE = { body: 3.6, hand: 2.4, prop: 1.7, detail: 0.8 } as const;

/** Each colour is a soft top-to-bottom gradient: [light top, base]. */
export const COLOURS = {
  pink: ["#ff8bc5", "#FF6AB5"],
  violet: ["#c7b2ff", "#B79CFF"],
  blue: ["#8fd0ff", "#6FC3FF"],
  yellow: ["#ffdf40", "#FFD60A"],
  green: ["#72e59c", "#4ADE80"],
  orange: ["#ffb47e", "#FF9F5A"],
} as const;
export type Colour = keyof typeof COLOURS;

export interface ShapeSpec {
  /** the body outline */
  d: string;
  /** the point the body leans and squashes about */
  feet: Vec;
  /** the top of the eyes' pills */
  eyesY: number;
  /** where a hat sits: the middle of the top of the head */
  head: Vec;
  /** where the hands rest: about 1 past the body's outer edge (its outline plus half its stroke), so they overlap the
   *  outline (tests/agents.spec.ts checks this for every shape) */
  hands: { L: Vec; R: Vec };
}

const SQUIRCLE =
  "M52.60 31.50L52.56 37.13L52.45 39.32L52.26 40.96L52.00 42.30L51.66 43.44L51.24 44.44L50.73 45.31L50.14 46.08L49.47 46.76L48.69 47.35L47.81 47.87L46.81 48.31L45.67 48.68L44.36 48.97L42.82 49.21L40.95 49.37L38.45 49.47L32.00 49.50L25.55 49.47L23.05 49.37L21.18 49.21L19.64 48.97L18.33 48.68L17.19 48.31L16.19 47.87L15.31 47.35L14.53 46.76L13.86 46.08L13.27 45.31L12.76 44.44L12.34 43.44L12.00 42.30L11.74 40.96L11.55 39.32L11.44 37.13L11.40 31.50L11.44 25.87L11.55 23.68L11.74 22.04L12.00 20.70L12.34 19.56L12.76 18.56L13.27 17.69L13.86 16.92L14.53 16.24L15.31 15.65L16.19 15.13L17.19 14.69L18.33 14.32L19.64 14.03L21.18 13.79L23.05 13.63L25.55 13.53L32.00 13.50L38.45 13.53L40.95 13.63L42.82 13.79L44.36 14.03L45.67 14.32L46.81 14.69L47.81 15.13L48.69 15.65L49.47 16.24L50.14 16.92L50.73 17.69L51.24 18.56L51.66 19.56L52.00 20.70L52.26 22.04L52.45 23.68L52.56 25.87Z";
const TRIANGLE =
  "M25.82 16.10L26.43 15.23L27.17 14.46L28.00 13.81L28.92 13.29L29.91 12.91L30.94 12.68L32.00 12.60L33.06 12.68L34.09 12.91L35.08 13.29L36.00 13.81L36.83 14.46L37.57 15.23L38.18 16.10L39.68 18.61L41.19 21.12L42.69 23.63L44.20 26.14L45.70 28.65L47.21 31.16L48.71 33.68L50.22 36.19L51.73 38.70L52.21 39.62L52.55 40.60L52.74 41.62L52.79 42.66L52.68 43.69L52.43 44.70L52.03 45.65L51.50 46.54L50.84 47.34L50.07 48.03L49.21 48.61L48.27 49.05L47.28 49.36L46.25 49.53L45.21 49.56L41.48 49.56L37.75 49.56L34.02 49.56L30.30 49.56L26.57 49.56L22.84 49.56L19.11 49.56L17.83 49.53L16.80 49.36L15.81 49.05L14.87 48.61L14.01 48.03L13.24 47.34L12.58 46.54L12.05 45.65L11.65 44.70L11.40 43.69L11.29 42.66L11.34 41.62L11.53 40.60L11.87 39.62L12.35 38.70L13.86 36.19L15.37 33.68L16.87 31.16L18.38 28.65L19.88 26.14L21.39 23.63L22.89 21.12L24.40 18.61Z";

export const SHAPES = {
  squircle: { d: SQUIRCLE, feet: [32, 49.5], eyesY: 30.5, head: [32, 15.6], hands: { L: [9.2, 43], R: [54.8, 43] } },
  circle: {
    d: "M32 11.6A19 19 0 0 1 32 49.6A19 19 0 0 1 32 11.6Z",
    feet: [32, 49.6], eyesY: 30.1, head: [32, 13.6], hands: { L: [13.6, 42], R: [50.4, 42] },
  },
  bullet: {
    d: "M12.20 30.20A19.80 19.80 0 0 1 51.80 30.20L51.80 43.20A6.40 6.40 0 0 1 45.40 49.60L18.60 49.60A6.40 6.40 0 0 1 12.20 43.20Z",
    feet: [32, 49.6], eyesY: 31.3, head: [32, 12.4], hands: { L: [9.4, 44], R: [54.6, 44] },
  },
  pill: {
    d: "M24.70 19.40L39.30 19.40A15.10 15.10 0 0 1 39.30 49.60L24.70 49.60A15.10 15.10 0 0 1 24.70 19.40Z",
    feet: [32, 49.6], eyesY: 32.5, head: [32, 21.4], hands: { L: [9.7, 44], R: [54.3, 44] },
  },
  triangle: { d: TRIANGLE, feet: [32, 49.56], eyesY: 33.3, head: [32, 14.6], hands: { L: [9, 45], R: [55, 45] } },
} satisfies Record<string, ShapeSpec>;
export type ShapeName = keyof typeof SHAPES;
