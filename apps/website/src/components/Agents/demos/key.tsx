import Agent from "../Agent";
import Key from "../props/key/Key";
import Hand from "../props/key/Hand";
import Sparkle from "../props/key/Sparkle";
import { key } from "../animations/key";
import type { DemoProps } from "./types";

export const label = "Open source";
export const order = 10;

/**
 * The animation shrinks the agent to 0.85 about its feet; the landing page also sets it 10 units left and 2.5 up in
 * its 64x64 box (making room for the key swinging out to the right), which is done here by shifting the agent.
 */
const SHIFT = { x: -10.03 / 64, y: -2.54 / 64 };

export default function KeyDemo({ className }: DemoProps) {
  return (
    <div className={className} style={{ position: "relative" }}>
      <Agent
        shape="squircle"
        colour="violet"
        animation={key}
        items={{ key: <Key />, sparkle: <Sparkle />, hand: <Hand colour="violet" /> }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: `translate(${SHIFT.x * 100}%, ${SHIFT.y * 100}%)` }}
      />
    </div>
  );
}
