import { useEffect, useState, type CSSProperties } from "react";
import Agent from "../Agent";
import Cloud from "../props/shapeShift/Cloud";
import { shapeShift, shapeShiftCircle, shapeShiftSquare, shapeShiftTriangle } from "../animations/shapeShift";
import type { DemoProps } from "./types";

export const label = "Shape-shifting";
export const order = 90;

const clouds = { cloudA: <Cloud which={0} />, cloudB: <Cloud which={1} />, cloudC: <Cloud which={2} /> };

/** every layer covers the whole box: the original draws all four in the same 64x64 space */
const layer: CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%" };
/** the agents lie on top of one another, so their boxes let the pointer through; only what they paint catches it
 *  (see the style below), so whichever agent is showing hops when hovered */
const agentLayer: CSSProperties = { ...layer, pointerEvents: "none" };
const AGENT_CLASS = "shape-shift-agent";

/**
 * The circle, the triangle and the square on the same spot, in the original's order, with the clouds' stage on top.
 * The stage clips to its box (its rig hands are parked below it) and lets the pointer through. Until the agents have
 * drawn their first pose (all but the circle shrunk away), the box is hidden, so the server-rendered page does not
 * show all three at once.
 */
export default function ShapeShiftDemo({ className }: DemoProps) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <div className={className} style={{ position: "relative", visibility: ready ? undefined : "hidden" }}>
      <style>{`.${AGENT_CLASS} [data-part="body"]{pointer-events:visiblePainted}`}</style>
      <Agent className={AGENT_CLASS} shape="circle" colour="blue" animation={shapeShiftCircle} followPointer style={agentLayer} />
      <Agent className={AGENT_CLASS} shape="triangle" colour="green" animation={shapeShiftTriangle} followPointer style={agentLayer} />
      <Agent className={AGENT_CLASS} shape="squircle" colour="pink" animation={shapeShiftSquare} followPointer style={agentLayer} />
      <Agent
        shape="circle"
        animation={shapeShift}
        items={clouds}
        reactive={false}
        style={{ ...layer, overflow: "hidden", pointerEvents: "none" }}
      />
    </div>
  );
}
