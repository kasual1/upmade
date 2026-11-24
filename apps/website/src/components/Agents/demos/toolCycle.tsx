import { useState, type ReactNode } from "react";
import Agent from "../Agent";
import Hand from "../props/toolCycle/Hand";
import Paint from "../props/toolCycle/Paint";
import { Eyes, Smile, Tongue } from "../props/toolCycle/Face";
import { Arrow, Brush, Eraser, Photo, Shape, TypewriterBase, TypewriterCarriage } from "../props/toolCycle/Tools";
import { EYE_FRAMES, EYE_STEPS, PAINT_FRAMES, toolCycle } from "../animations/toolCycle";
import type { DemoProps } from "./types";

export const label = "Tool cycle";
export const order = 150;

/** How each prop of the animation looks, named as in animations/toolCycle.ts. */
const items: Record<string, ReactNode> = {
  ...Object.fromEntries(Array.from({ length: PAINT_FRAMES }, (_, k) => [`paint${k + 1}`, <Paint upTo={(k + 1) / PAINT_FRAMES} />])),
  ...Object.fromEntries(Array.from({ length: EYE_FRAMES }, (_, k) => [`eyes${k + 1}`, <Eyes sy={(k + 1) / EYE_STEPS} />])),
  smile: <Smile />,
  tongue: <Tongue />,
  arrow: <Arrow />,
  handL: <Hand />,
  handR: <Hand />,
  brush: <Brush />,
  brushHand: <Hand />,
  eraserHand: <Hand />,
  eraser: <Eraser />,
  shape0: <Shape kind="triangle" />,
  shape1: <Shape kind="square" />,
  shape2: <Shape kind="circle" />,
  juggleHand: <Hand />,
  typerHand: <Hand small />,
  typerBase: <TypewriterBase />,
  typerCarriage: <TypewriterCarriage />,
  photo: <Photo />,
};

/**
 * The hero agent of infinite.html. The page syncs its toolbar to the `tool:<name>` events; here the tool in use is
 * kept from them and put on the wrapper as `data-tool` (the loop starts on the cursor, like the page's toolbar).
 */
export default function ToolCycleDemo({ className }: DemoProps) {
  const [tool, setTool] = useState("cursor");
  return (
    <div className={className} data-tool={tool}>
      <Agent
        shape="squircle"
        colour="pink"
        animation={toolCycle}
        items={items}
        followPointer
        label={`The pink Upmade agent using the ${tool} tool`}
        onEvent={(e) => e.startsWith("tool:") && setTool(e.slice(5))}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
