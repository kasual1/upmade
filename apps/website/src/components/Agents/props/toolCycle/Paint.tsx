import { STROKE_POINTS } from "../../animations/toolCycle";

/**
 * The wavy blue line the agent paints at its bottom left, drawn up to `upTo` (0 to 1) of its length. The original
 * reveals it with a stroke dash; a dash offset cannot be a track, so the animation shows one of these frames at a
 * time while the brush draws it. Drawn in the agent's own coordinates.
 */
export default function Paint({ upTo }: { upTo: number }) {
  const pts = STROKE_POINTS;
  const len: number[] = [0];
  for (let k = 1; k < pts.length; k++) len.push(len[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
  const want = len[len.length - 1] * Math.max(0, Math.min(1, upTo));
  const out: string[] = [`${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`];
  for (let k = 1; k < pts.length; k++) {
    if (len[k] <= want) out.push(`${pts[k][0].toFixed(2)} ${pts[k][1].toFixed(2)}`);
    else {
      const r = (want - len[k - 1]) / (len[k] - len[k - 1]);
      if (r > 0) out.push(`${(pts[k - 1][0] + (pts[k][0] - pts[k - 1][0]) * r).toFixed(2)} ${(pts[k - 1][1] + (pts[k][1] - pts[k - 1][1]) * r).toFixed(2)}`);
      break;
    }
  }
  return <path d={`M${out.join("L")}`} fill="none" stroke="#4A7DFF" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />;
}
