import { useEffect, useState } from "react";
import Agent from "../Agent";
import Beret from "../props/painter/Beret";
import Brush from "../props/painter/Brush";
import Hand from "../props/painter/Hand";
import Easel from "../props/painter/Easel";
import { painter, painterStage } from "../animations/painter";
import type { DemoProps } from "./types";

export const label = "Painter";
export const order = 60;

const painterItems = { beret: <Beret /> };
const stageItems = {
  brushGreen: <Brush paint="green" />,
  brushBlue: <Brush paint="blue" />,
  brushYellow: <Brush paint="yellow" />,
  hand: <Hand />,
  easel: <Easel />,
};

/**
 * Both agents fill the demo's box, one on top of the other: the painter (drawn at 0.62 by its own body scale) and
 * the stage with the full-size brush hand, brush and easel. Sharing the box, they come on and off screen together
 * and stay in step; the stage lets the pointer through to the painter so the painter still hops when hovered. The
 * stage clips to its box like the original's svg (all it draws fits inside), which also makes Chrome anti-alias the
 * easel's edges the same as the original's. Until both agents have drawn their first pose the box is hidden, so the
 * server-rendered page does not flash the stage's default body (a circle with eyes and hands) or the painter's hands.
 */
const layer = {
  position: "absolute",
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
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
        style={{ ...layer, pointerEvents: "none", overflow: "hidden" }}
      />
    </div>
  );
}
