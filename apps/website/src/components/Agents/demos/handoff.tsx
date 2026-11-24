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
 * The original draws both agents at 0.7, so each body is an <Agent> 70% of the box at its top-left corner; the
 * animations' constant body.shift and body.lift move each into its place (feet at (16.2 50) and (47.8 50), 3 up). The
 * stage (document and hands) covers the whole box on top of both, and lets the pointer through so the agents still hop
 * when hovered.
 *
 * Both bodies' <svg> boxes sit at that corner, and an <svg> catches the pointer over the whole of its box, so the
 * circle's box (on top) would hide the triangle from the pointer. So the bodies' <svg>s let the pointer through and only
 * their drawn bodies take it (the same as the shape-shift demo).
 */
const BODY_CLASS = "handoff-body";
const body = { position: "absolute" as const, left: 0, top: 0, width: "70%", height: "70%", pointerEvents: "none" as const };

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
