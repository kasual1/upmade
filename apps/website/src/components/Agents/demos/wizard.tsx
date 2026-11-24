import Agent from "../Agent";
import Hat from "../props/wizard/Hat";
import Wand from "../props/wizard/Wand";
import Sparkle from "../props/wizard/Sparkle";
import { Apple, Rabbit, Vase } from "../props/wizard/Conjured";
import { wizard, SHIFT_X, SPARKLE_SIZES } from "../animations/wizard";
import type { DemoProps } from "./types";

export const label = "Wizard";
export const order = 50;

const items = {
  hat: <Hat />,
  vase: <Vase />,
  apple: <Apple />,
  rabbit: <Rabbit />,
  wand: <Wand colour="pink" />,
  ...Object.fromEntries(SPARKLE_SIZES.map((size, k) => [`sparkle${k + 1}`, <Sparkle size={size} />])),
};

/**
 * The animation stands the shrunk body in the middle of the 64x64 box; the landing page has it 14.5 units left of the
 * middle (making room for the objects on its right), which is done here by shifting the agent.
 */
export default function WizardDemo({ className }: DemoProps) {
  return (
    <div className={className} style={{ position: "relative" }}>
      <Agent
        shape="squircle"
        colour="pink"
        animation={wizard}
        items={items}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: `translate(${(-SHIFT_X / 64) * 100}%, 0)` }}
      />
    </div>
  );
}
