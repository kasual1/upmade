import { useState, type ReactNode } from "react";
import Agent from "../Agent";
import Hand from "../props/Hand";
import { FRAMEWORKS, Pole, Sign } from "../props/frameworkSign/Sign";
import { FRAMEWORK_SIGN_WIDTHS, frameworkSign } from "../animations/frameworkSign";
import type { DemoProps } from "./types";

export const label = "Framework sign";
export const order = 130;

/**
 * Cycles the sign's logo (React, Vue, Angular) on the animation's `flip` event, as the landing page does in step with
 * its code snippet.
 */
export default function FrameworkSignDemo({ className, onEvent, start, rate }: DemoProps) {
  const [n, setN] = useState(0);
  const framework = FRAMEWORKS[n];
  const items: Record<string, ReactNode> = { pole: <Pole />, hand: <Hand colour="pink" /> };
  FRAMEWORK_SIGN_WIDTHS.forEach((w, k) => (items[`sign${k + 1}`] = <Sign framework={framework} width={w} />));
  return (
    <div className={className} style={{ position: "relative" }}>
      <Agent
        shape="squircle"
        colour="pink"
        animation={frameworkSign}
        items={items}
        onEvent={(e) => {
          if (e === "flip") setN((i) => (i + 1) % FRAMEWORKS.length);
          onEvent?.(e);
        }}
        start={start}
        rate={rate}
        label={`Agent holding up a sign: ${framework}`}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
}
