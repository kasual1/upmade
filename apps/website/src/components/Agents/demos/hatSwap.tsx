import { useState } from "react";
import Agent from "../Agent";
import Hat, { HAT_KINDS } from "../props/Hat";
import { hatSwap } from "../animations";
import type { DemoProps } from "./types";

export const label = "Hat swap";
export const order = 100;

/** Keeps track of which hat is worn and which is held, from the animation's `swap` and `putOn` events. */
export default function HatSwapDemo({ className, onEvent, start, rate }: DemoProps) {
  const [worn, setWorn] = useState(0);
  const [held, setHeld] = useState(0);
  return (
    <Agent
      className={className}
      shape="squircle"
      colour="violet"
      animation={hatSwap}
      items={{ worn: <Hat kind={HAT_KINDS[worn]} />, held: <Hat kind={HAT_KINDS[held]} /> }}
      onEvent={(e) => {
        if (e === "swap") setHeld((worn + 1) % HAT_KINDS.length);
        if (e === "putOn") setWorn(held);
        onEvent?.(e);
      }}
      start={start}
      rate={rate}
    />
  );
}
