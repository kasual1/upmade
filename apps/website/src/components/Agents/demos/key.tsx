import Agent from "../Agent";
import Key from "../props/key/Key";
import Hand from "../props/key/Hand";
import Sparkle from "../props/key/Sparkle";
import { key } from "../animations/key";
import type { DemoProps } from "./types";

export const label = "Open source";
export const order = 10;

export default function KeyDemo({ className }: DemoProps) {
  return (
    <Agent
      shape="squircle"
      colour="violet"
      animation={key}
      items={{ key: <Key />, sparkle: <Sparkle />, hand: <Hand colour="violet" /> }}
      className={className}
    />
  );
}
