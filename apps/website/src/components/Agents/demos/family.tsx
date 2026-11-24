import Agent from "../Agent";
import { idle } from "../animations";
import type { Colour, ShapeName } from "../tokens";
import type { DemoProps } from "./types";

/** The five shapes, idling. Each is its own demo entry so they line up in the grid with the others. */
const FAMILY: Array<[ShapeName, Colour]> = [["squircle", "pink"], ["circle", "blue"], ["triangle", "green"], ["bullet", "yellow"], ["pill", "violet"]];

export const demos = FAMILY.map(([shape, colour], k) => ({
  key: shape,
  label: shape,
  order: k,
  Demo: ({ className }: DemoProps) => <Agent className={className} shape={shape} colour={colour} animation={idle} followPointer />,
}));
