import Agent from "../Agent";
import Ripple from "../props/cursor/Ripple";
import { cursor, cursorRipples } from "../animations/cursor";
import type { DemoProps } from "./types";

export const label = "Programmable cursors";
export const order = 20;

/** The ripple is a run of rings of growing radius (see animations/cursor.ts), so each ring is its own prop. */
const items = Object.fromEntries([
  ...cursorRipples.map(({ name, r, dot }) => [name, <Ripple r={r} dot={dot} />]),
]);

export default function CursorDemo({ className }: DemoProps) {
  return <Agent className={className} shape="circle" colour="yellow" animation={cursor} items={items} />;
}
