import { useState } from "react";
import Agent from "../Agent";
import Button from "../props/controlPanel/Button";
import Gloss from "../props/controlPanel/Gloss";
import Hand from "../props/Hand";
import Panel from "../props/controlPanel/Panel";
import Tint from "../props/controlPanel/Tint";
import { controlPanel, GLOSS_X, SQUARE, TINT_PATHS } from "../animations/controlPanel";
import type { Colour } from "../tokens";
import type { DemoProps } from "./types";

export const label = "Customizing";
export const order = 100;

/** The colour coats and the shine frames never change, so they are made once. */
const frames = {
  tintOrange: <Tint d={SQUARE} colour="orange" />,
  ...Object.fromEntries(TINT_PATHS.map((d, k) => [`tintPink${k}`, <Tint d={d} colour="pink" />])),
  ...Object.fromEntries(GLOSS_X.map((x, k) => [`gloss${k}`, <Gloss x={x} />])),
  button: <Button />,
  panel: <Panel />,
  hand: <Hand colour="pink" />,
  handOrange: <Hand colour="orange" />,
};

/** Repaints the agent from the animation's `orange` and `pink` events (the hand's colour is faded by the animation). */
export default function ControlPanelDemo({ className }: DemoProps) {
  const [colour, setColour] = useState<Colour>("pink");
  return (
    <Agent
      className={className}
      shape="squircle"
      colour={colour}
      animation={controlPanel}
      items={frames}
      onEvent={(e) => {
        if (e === "orange") setColour("orange");
        if (e === "pink") setColour("pink");
      }}
    />
  );
}
