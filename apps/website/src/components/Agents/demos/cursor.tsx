import Agent from "../Agent";
import Eyes from "../props/cursor/Eyes";
import Ripple from "../props/cursor/Ripple";
import { cursor, cursorEyes, cursorRipples } from "../animations/cursor";
import type { DemoProps } from "./types";

export const label = "Programmable cursors";
export const order = 20;

/** The ripple is a run of rings of growing radius and the closing eyes a run of openings (see animations/cursor.ts),
 *  so each is its own prop. */
const items = Object.fromEntries([
  ...cursorRipples.map(({ name, r, dot }) => [name, <Ripple r={r} dot={dot} />]),
  ...cursorEyes.map(({ name, open }) => [name, <Eyes open={open} />]),
]);

export default function CursorDemo({ className }: DemoProps) {
  return <Agent className={className} shape="circle" colour="yellow" animation={cursor} items={items} />;
}
