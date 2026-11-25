import Agent from "../Agent";
import Glasses, { Glint, Shine } from "../props/cyclingGlasses/Glasses";
import Hand from "../props/Hand";
import { cyclingGlasses, cyclingGlassesGlint } from "../animations/cyclingGlasses";
import type { DemoProps } from "./types";

export const label = "Performance";
export const order = 140;

/** The glint's sweep is a row of frames, one prop each (see animations/cyclingGlasses.ts). */
const items = {
  glasses: <Glasses />,
  ...Object.fromEntries(cyclingGlassesGlint.map((x, k) => [`glint${k}`, <Glint key={k} x={x} />])),
  shine: <Shine />,
  hand: <Hand colour="green" />,
};

export default function CyclingGlassesDemo({ className, onEvent, start, rate }: DemoProps) {
  return (
    <Agent className={className} shape="triangle" colour="green" animation={cyclingGlasses} items={items} onEvent={onEvent} start={start} rate={rate} />
  );
}
