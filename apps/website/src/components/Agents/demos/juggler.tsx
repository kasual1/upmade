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
 * The agent sits in its box like the others; the throws arc up to about half the box's height above it.
 *
 * It hops like the others when hovered or clicked, but only up and down (`lean: 0, squash: 0`): a hop's tilt and
 * squash turn about the feet, and would fling the world-placed objects and hands (up to 80 units above the feet) far
 * off their paths. Moving straight up and down, the whole act jumps together.
 */
const HOP = { lean: 0, squash: 0 };

/** room above the box for the throws (they peak about 0.6 of the box's height above it at the preview's 110 px) */
const ROOM = { marginTop: 72 };

export default function JugglerDemo({ className }: DemoProps) {
  return <Agent shape="circle" colour="blue" animation={juggler} items={items} reactive={HOP} className={className} style={ROOM} />;
}
