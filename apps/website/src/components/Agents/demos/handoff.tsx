import Agent from "../Agent";
import Document from "../props/handoff/Document";
import Hand from "../props/handoff/Hand";
import { handoff, handoffCircle, handoffTriangle } from "../animations/handoff";
import type { DemoProps } from "./types";

export const label = "Realtime collaboration";
export const order = 80;

const stageItems = {
  doc: <Document />,
  triangleHand: <Hand colour="green" />,
  circleHand: <Hand colour="blue" />,
};

/**
 * The original draws both agents at 0.7, feet (32 49) at (16.2 50) and (47.8 50) of the 64x64 box, the whole drawing
 * 3 up: each agent takes 70% of the box, its top-left at (16.2 - 0.7 x 32, 47 - 0.7 x 49) = (-6.2 12.7) and
 * (25.4 12.7) units. The stage (document and hands) covers the whole box on top of both, and lets the pointer through
 * so the agents still hop when hovered.
 *
 * The bodies are moved into place with a transform rather than left/top: at 110 px those offsets are fractions of a
 * pixel (-10.66 px, 43.66 px, 21.83 px) and the browser snaps a positioned <svg>'s box to whole pixels, which put the
 * bodies about a third of a pixel off the hands and the document. A translate (in % of the agent's own size) isn't
 * snapped.
 */
const SCALE = 0.7;
const place = (feetX: number) => ({
  position: "absolute" as const,
  left: 0,
  top: 0,
  width: `${SCALE * 100}%`,
  height: `${SCALE * 100}%`,
  transform: `translate(${((feetX - SCALE * 32) / (SCALE * 64)) * 100}%, ${((50 - 3 - SCALE * 49) / (SCALE * 64)) * 100}%)`,
});

export default function HandoffDemo({ className }: DemoProps) {
  return (
    <div className={className} style={{ position: "relative" }}>
      <Agent shape="triangle" colour="green" animation={handoffTriangle} style={place(16.2)} />
      <Agent shape="circle" colour="blue" animation={handoffCircle} style={place(47.8)} />
      <Agent
        shape="circle"
        colour="blue"
        animation={handoff}
        items={stageItems}
        reactive={false}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      />
    </div>
  );
}
