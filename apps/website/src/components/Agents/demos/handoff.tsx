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
 * Three <Agent>s fill the box, one over another: the two bodies, then the stage (document and hands), which lets the
 * pointer through so the agents still hop when hovered. They share one frame, so both agents come out at the family's
 * size on its usual line, the pair centred and reaching past the box on both sides.
 *
 * An <svg> catches the pointer over the whole of its box, so the circle's box (on top) would hide the triangle from
 * the pointer. So the bodies' <svg>s let the pointer through and only
 * their drawn bodies take it (the same as the shape-shift demo).
 */
const BODY_CLASS = "handoff-body";
const body = { position: "absolute" as const, inset: 0, width: "100%", height: "100%", pointerEvents: "none" as const };

export default function HandoffDemo({ className }: DemoProps) {
  return (
    <div className={className} style={{ position: "relative" }}>
      <style>{`.${BODY_CLASS} [data-part="body"]{pointer-events:visiblePainted}`}</style>
      <Agent className={BODY_CLASS} shape="triangle" colour="green" animation={handoffTriangle} style={body} />
      <Agent className={BODY_CLASS} shape="circle" colour="blue" animation={handoffCircle} style={body} />
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
