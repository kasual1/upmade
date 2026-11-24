import Agent from "../Agent";
import Book from "../props/book/Book";
import Page from "../props/book/Page";
import Hand from "../props/book/Hand";
import Squint from "../props/book/Squint";
import { book, PAGE_SX, EYE_SY } from "../animations/book";
import type { DemoProps } from "./types";

export const label = "Speed-reading";
export const order = 40;

/** The frames of the turning page and of the eyes (squint and blinks), one prop each, named as in the animation. */
const items = {
  ...Object.fromEntries(PAGE_SX.map((sx, k) => [`page${k}`, <Page sx={sx} />])),
  ...Object.fromEntries(EYE_SY.map((sy, k) => [`eye${k}`, <Squint sy={sy} />])),
  book: <Book />,
  handL: <Hand />,
  handR: <Hand />,
};

export default function BookDemo({ className }: DemoProps) {
  return <Agent className={className} shape="triangle" colour="orange" animation={book} items={items} />;
}
