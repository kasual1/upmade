import Agent from "../Agent";
import Bouquet from "../props/Bouquet";
import { bouquetReveal } from "../animations";
import type { DemoProps } from "./types";

export const label = "Bouquet";
export const order = 110;

export default function BouquetDemo({ className, onEvent, start, rate }: DemoProps) {
  return (
    <Agent className={className} shape="circle" colour="blue" animation={bouquetReveal} items={{ bouquet: <Bouquet /> }} onEvent={onEvent} start={start} rate={rate} />
  );
}
