import Agent from "../Agent";
import Hand from "../props/devices/Hand";
import { Laptop, Phone, Tablet } from "../props/devices/Devices";
import { devices } from "../animations/devices";
import type { DemoProps } from "./types";

export const label = "Cross-platform";
export const order = 110;

const items = {
  phone: <Phone />,
  tablet: <Tablet />,
  laptop: <Laptop />,
  hand: <Hand colour="green" />,
};

/**
 * The animation draws the original moved 7 units right (the rig cannot move its body sideways, see
 * animations/devices.ts), so the agent is shifted back left by 7/64 of its width here.
 */
export default function DevicesDemo({ className }: DemoProps) {
  return (
    <div className={className} style={{ position: "relative" }}>
      <Agent
        shape="triangle"
        colour="green"
        animation={devices}
        items={items}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: `translateX(${(-7 / 64) * 100}%)` }}
      />
    </div>
  );
}
