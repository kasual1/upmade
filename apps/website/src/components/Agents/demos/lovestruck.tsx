import { useCallback, useRef } from "react";
import Agent from "../Agent";
import HeartBubbles, { type HeartBubblesHandle } from "../effects/HeartBubbles";
import { lovestruck } from "../animations/lovestruck";
import type { DemoProps } from "./types";

export const label = "Lovestruck";
export const order = 70;

/**
 * Where the hearts' canvas sits around the agent's box, in fractions of the box: as on the landing page, about 2.1
 * boxes wide and centred on it, reaching from just under its feet to about 1.75 boxes above it.
 */
const HEARTS = { position: "absolute", left: "-57%", right: "-57%", bottom: "-4%", height: "274%", zIndex: 0 } as const;

/** The yellow bullet, in love: hearts bubble up from behind it, and two more burst up as it smiles. */
export default function LovestruckDemo({ className }: DemoProps) {
  const box = useRef<HTMLDivElement>(null);
  const hearts = useRef<HeartBubblesHandle>(null);
  const onEvent = useCallback((name: string) => {
    if (name === "smile") hearts.current?.burst(2);
  }, []);
  return (
    <div ref={box} className={className} style={{ position: "relative" }}>
      <HeartBubbles agent={box} ref={hearts} style={HEARTS} />
      <Agent shape="bullet" colour="yellow" animation={lovestruck} onEvent={onEvent} style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }} />
    </div>
  );
}
