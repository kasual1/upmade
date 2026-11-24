import Agent from "../Agent";
import Hat from "../props/wizard/Hat";
import Wand from "../props/wizard/Wand";
import Sparkle from "../props/wizard/Sparkle";
import { Apple, Rabbit, Vase } from "../props/wizard/Conjured";
import { wizard, SPARKLE_SIZES } from "../animations/wizard";
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

export default function WizardDemo({ className }: DemoProps) {
  return (
    <Agent shape="squircle" colour="pink" animation={wizard} items={items} className={className} />
  );
}
