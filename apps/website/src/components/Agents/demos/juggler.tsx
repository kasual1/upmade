import Agent from "../Agent";
import Apple from "../props/juggler/Apple";
import Calculator from "../props/juggler/Calculator";
import Hand from "../props/juggler/Hand";
import Vase from "../props/juggler/Vase";
import { juggler } from "../animations/juggler";
import type { DemoProps } from "./types";

export const label = "Juggler";
export const order = 120;

const items = {
  vase: <Vase />,
  apple: <Apple />,
  calculator: <Calculator />,
  handR: <Hand />,
  handL: <Hand />,
};

/**
 * The original draws the body at 0.66 with its feet (32 49.6) at (32 63.5) of the 64x64 box, so the agent takes 66%
 * of the box, its top-left at (32 - 0.66 x 32, 63.5 - 0.66 x 49.6) = (10.88 30.76) units. The objects fly well
 * above its head (up to y 10 of the box), which the agent's SVG lets show (it does not clip).
 *
 * No hover hop (`reactive={false}`): the original ignores the pointer, and a hop's lean and squash turn about the
 * feet, so it would fling the world-placed objects and hands (up to 80 units above the feet) far off their paths.
 */
const SCALE = 0.66;
const place = {
  position: "absolute" as const,
  left: `${((32 - SCALE * 32) / 64) * 100}%`,
  top: `${((63.5 - SCALE * 49.6) / 64) * 100}%`,
  width: `${SCALE * 100}%`,
  height: `${SCALE * 100}%`,
};

export default function JugglerDemo({ className }: DemoProps) {
  return (
    <div className={className} style={{ position: "relative" }}>
      <Agent shape="circle" colour="blue" animation={juggler} items={items} reactive={false} style={place} />
    </div>
  );
}
