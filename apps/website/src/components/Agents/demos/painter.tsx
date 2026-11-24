import { useEffect, useState, type ReactNode } from "react";
import Agent from "../Agent";
import Beret from "../props/painter/Beret";
import Squint from "../props/painter/Squint";
import Brush from "../props/painter/Brush";
import Hand from "../props/painter/Hand";
import Easel from "../props/painter/Easel";
import { painter, painterStage, PAINTER_BOX, SQUINT_SY } from "../animations/painter";
import type { DemoProps } from "./types";

export const label = "Painter";
export const order = 60;

/** The painter's eyes while squinting or blinking, one prop per frame, named as in the animation. */
const painterItems = {
  ...Object.fromEntries(SQUINT_SY.map((sy, k) => [`squint${k}`, <Squint sy={sy} />])),
  beret: <Beret />,
};
/** The stage's props are full size in the original, so in the painter's 0.62 box they are drawn at 1/0.62. */
const full = (look: ReactNode) => <g transform={`scale(${1 / PAINTER_BOX.scale})`}>{look}</g>;
const stageItems = {
  brushGreen: full(<Brush paint="green" />),
  brushBlue: full(<Brush paint="blue" />),
  brushYellow: full(<Brush paint="yellow" />),
  hand: full(<Hand />),
  easel: full(<Easel />),
};

/**
 * The original draws the painter at 0.62 with its feet (32 49) at (17 51) of the 64x64 box, so both agents take 62%
 * of the box, shifted by (17 51) - 0.62 x (32 49) = (-2.84 20.62) units, i.e. -4.44% and 32.22% of the box
 * (PAINTER_BOX). The stage draws the full-size brush hand, brush and easel at 1/0.62 inside that same box, so both
 * agents come on and off screen together and stay in step; it lets the pointer through to the painter so the
 * painter still hops when hovered. Until both agents have drawn their first pose the box is hidden, so the
 * server-rendered page does not flash the stage's default body (a circle with eyes and hands) or the painter's hands.
 */
const { scale, x, y } = PAINTER_BOX;
const layer = {
  position: "absolute",
  left: `${(x / 64) * 100}%`,
  top: `${(y / 64) * 100}%`,
  width: `${scale * 100}%`,
  height: `${scale * 100}%`,
} as const;

export default function PainterDemo({ className }: DemoProps) {
  // the agents' effects (their first pose) run before this one, so the box is shown already posed
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <div className={className} style={{ position: "relative", visibility: ready ? undefined : "hidden" }}>
      <Agent
        shape="circle"
        colour="violet"
        animation={painter}
        items={painterItems}
        style={layer}
      />
      <Agent
        shape="circle"
        colour="violet"
        animation={painterStage}
        items={stageItems}
        reactive={false}
        style={{ ...layer, pointerEvents: "none" }}
      />
    </div>
  );
}
