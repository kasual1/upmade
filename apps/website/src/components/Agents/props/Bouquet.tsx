import { INK } from "../tokens";

const WHITE = "#FFFFFF", PINK = "#FF8BC5", LIGHT_PINK = "#FFC4DF", YELLOW = "#FFD60A", GREEN = "#4ADE80";

function Flower({ x, y, petal, centre, r, dist, n, rot }: { x: number; y: number; petal: string; centre: string; r: number; dist: number; n: number; rot: number }) {
  return (
    <>
      <g fill={petal} stroke={INK} strokeWidth={0.7}>
        {Array.from({ length: n }, (_, k) => {
          const a = rot + (2 * Math.PI * k) / n;
          return <circle key={k} cx={x + dist * Math.cos(a)} cy={y + dist * Math.sin(a)} r={r} />;
        })}
      </g>
      <circle cx={x} cy={y} r={r * 0.72} fill={centre} stroke={INK} strokeWidth={0.7} />
    </>
  );
}

function Stem({ d }: { d: string }) {
  return (
    <>
      <path d={d} fill="none" stroke={INK} strokeWidth={1.7} strokeLinecap="round" />
      <path d={d} fill="none" stroke={GREEN} strokeWidth={0.6} strokeLinecap="round" />
    </>
  );
}

function Leaf({ x, y, angle, length, width }: { x: number; y: number; angle: number; length: number; width: number }) {
  const a = (angle * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx;
  const mx = x + (dx * length) / 2, my = y + (dy * length) / 2, tx = x + dx * length, ty = y + dy * length;
  return (
    <path
      d={`M${x} ${y}Q${mx + nx * width} ${my + ny * width} ${tx} ${ty}Q${mx - nx * width} ${my - ny * width} ${x} ${y}Z`}
      fill={GREEN}
      stroke={INK}
      strokeWidth={0.7}
      strokeLinejoin="round"
    />
  );
}

/** A small bunch of the shop's flowers, gripped at (0 0) with the blooms above. */
export default function Bouquet() {
  return (
    <g>
      <Stem d="M0 3L-2.6 -7.6" />
      <Stem d="M0 3V-10" />
      <Stem d="M0 3L2.8 -7.2" />
      <Leaf x={-0.4} y={-2} angle={215} length={4.6} width={1.6} />
      <Leaf x={0.4} y={-2.4} angle={-35} length={4.6} width={1.6} />
      <Flower x={-3.4} y={-8.2} petal={WHITE} centre={YELLOW} r={1.25} dist={1.55} n={6} rot={0.3} />
      <Flower x={3.4} y={-7.8} petal={LIGHT_PINK} centre={WHITE} r={1.25} dist={1.55} n={5} rot={1} />
      <Flower x={0} y={-11.2} petal={PINK} centre={WHITE} r={1.35} dist={1.7} n={5} rot={-Math.PI / 2} />
    </g>
  );
}
