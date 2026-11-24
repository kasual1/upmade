import Agent from "../Agent";
import Key from "../props/key/Key";
import Hand from "../props/key/Hand";
import Sparkle from "../props/key/Sparkle";
import Glints from "../props/key/Glints";
import TallEyes from "../props/key/TallEyes";
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
      items={{ key: <Key />, sparkle: <Sparkle />, hand: <Hand colour="violet" />,
        glintCovers: <Glints cover />, glints: <Glints />, tallEyes: <TallEyes /> }}
      className={className}
    />
  );
}
