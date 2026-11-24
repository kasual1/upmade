import Agent from "../Agent";
import Beret from "../props/painter/Beret";
import Squint from "../props/painter/Squint";
import Brush from "../props/painter/Brush";
import Hand from "../props/painter/Hand";
import Easel from "../props/painter/Easel";
import { painter, painterStage, SQUINT_SY } from "../animations/painter";
import type { DemoProps } from "./types";

export const label = "Painter";
export const order = 60;

/** The painter's eyes while squinting or blinking, one prop per frame, named as in the animation. */
const painterItems = {
  ...Object.fromEntries(SQUINT_SY.map((sy, k) => [`squint${k}`, <Squint sy={sy} />])),
  beret: <Beret />,
};
const stageItems = {
  brushGreen: <Brush paint="green" />,
  brushBlue: <Brush paint="blue" />,
  brushYellow: <Brush paint="yellow" />,
  hand: <Hand />,
  easel: <Easel />,
};

/**
 * The original draws the painter at 0.62 with its feet (32 49) at (17 51) of the 64x64 box, so its agent takes 62%
 * of the box, shifted by (17 51) - 0.62 x (32 49) = (-2.84 20.62) units, i.e. -4.44% and 32.22% of the box. The
 * stage (brush hand, brush, easel) covers the whole box on top, and lets the pointer through to the painter so it
 * still hops when hovered.
 */
const SCALE = 0.62;
const left = ((17 - SCALE * 32) / 64) * 100;
const top = ((51 - SCALE * 49) / 64) * 100;

export default function PainterDemo({ className }: DemoProps) {
  return (
    <div className={className} style={{ position: "relative" }}>
      <Agent
        shape="circle"
        colour="violet"
        animation={painter}
        items={painterItems}
        style={{ position: "absolute", left: `${left}%`, top: `${top}%`, width: `${SCALE * 100}%`, height: `${SCALE * 100}%` }}
      />
      <Agent
        shape="circle"
        colour="violet"
        animation={painterStage}
        items={stageItems}
        reactive={false}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      />
    </div>
  );
}
