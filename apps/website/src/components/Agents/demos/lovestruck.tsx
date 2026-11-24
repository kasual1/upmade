import Agent from "../Agent";
import { lovestruck } from "../animations/lovestruck";
import type { DemoProps } from "./types";

export const label = "Lovestruck";
export const order = 70;

/** The yellow bullet, in love. The landing page bursts hearts on its `smile` event; this demo just plays the loop. */
export default function LovestruckDemo({ className }: DemoProps) {
  return <Agent className={className} shape="bullet" colour="yellow" animation={lovestruck} />;
}
