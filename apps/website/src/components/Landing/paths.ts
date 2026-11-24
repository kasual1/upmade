// Path data extracted from the Page4.dc.html design.
// The brand's paths (the mark and the wordmark letters) moved to Brand/paths.ts and are re-exported here, so existing
// imports keep working. Only the old hero's hand-drawn "Hello!" is still defined here.
export {
  UPMADE_LOGO_PATH,
  UPMADE_LOGO_STROKE_WIDTH,
  UPMADE_LOGO_VIEWBOX,
  WORDMARK_LETTERS,
} from "../Brand/paths";

// Drawn in order within --hallo-draw-duration (1140ms): the H's two stems and crossbar, then "ello".
export const HELLO_STROKES: ReadonlyArray<{ d: string; offset: string; duration: string }> = [
  { d: "M24 18 C23 42 21 66 19 88", offset: "0ms", duration: "120ms" },
  { d: "M58 16 C57 40 55 64 53 88", offset: "150ms", duration: "120ms" },
  { d: "M23 55 C33 54 44 52 56 51", offset: "300ms", duration: "90ms" },
  {
    d: `M68 76 C77 73.5 88.9 69.3 88 60 C87.5 54.9 80.9 51.8 76 53 C68.2 55 64.6 64 65 72 C65.5 81.1 72.9 90.5 82 90 C92.9 89.4 98.1 79.1 104 70
        C113.7 55 118.2 41.8 120 24 C120.4 20.1 119.3 12.7 116 14 C103.1 19.2 99.3 89.6 116 90 C123.2 90.2 133.7 78.2 140 68
        C149 53.5 153.9 41 155 24 C155.3 20.1 154.3 12.7 151 14 C138.1 19.2 135.3 89.6 152 90 C159.7 90.2 171.4 77 177 65.5
        C179.7 59.9 184.8 56 191 56 C200.1 56 207 65.9 207 75 C207 84.1 200.1 94 191 94 C181.9 94 175 84.1 175 75
        C175 71.4 175.4 68.7 177 65.5 C179.7 59.9 184.8 56 191 56 C197.8 56 202.5 58.1 209 60 C214 61.4 218.1 59.6 223 58`,
    offset: "420ms",
    duration: "720ms",
  },
];

export const HELLO_EXCLAMATION = "M240 32 C239 45 237 59 236 72";
export const HELLO_DOT = "M235 88 L235 90";
