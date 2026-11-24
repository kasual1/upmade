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
 * The agent fills the box: the animation itself draws the body at 0.66 with its feet at (32 63.5), as the original
 * does, and the objects fly well above its head (up to y 10 of the box).
 *
 * No hover hop (`reactive={false}`): the original ignores the pointer, and a hop's lean and squash turn about the
 * feet, so it would fling the world-placed objects and hands (up to 80 units above the feet) far off their paths.
 */
export default function JugglerDemo({ className }: DemoProps) {
  return <Agent shape="circle" colour="blue" animation={juggler} items={items} reactive={false} className={className} />;
}
