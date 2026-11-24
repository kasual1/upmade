import type { ReactNode } from "react";
import Agent from "../Agent";
import Hand from "../props/Hand";
import Cord from "../props/plug/Cord";
import { Plug, PlugProngs, Socket, SocketHoles } from "../props/plug/Connectors";
import { CORD_PIECE, CORD_PIECES, plug } from "../animations/plug";
import type { DemoProps } from "./types";

export const label = "WebMCP";
export const order = 30;

/** Every piece of both cords, named as in the animation (`cordLInk0`, `cordRCore9`...). */
const cords: Record<string, ReactNode> = {};
for (const side of ["L", "R"])
  for (const part of ["Ink", "Core"] as const)
    for (let n = 0; n < CORD_PIECES; n++)
      cords[`cord${side}${part}${n}`] = <Cord part={part === "Ink" ? "ink" : "core"} length={CORD_PIECE} />;

const items: Record<string, ReactNode> = {
  ...cords,
  plug: <Plug />,
  plugProngs: <PlugProngs />,
  socket: <Socket />,
  socketHoles: <SocketHoles />,
  handL: <Hand colour="green" />,
  handR: <Hand colour="green" />,
};

export default function PlugDemo({ className }: DemoProps) {
  return <Agent className={className} shape="triangle" colour="green" animation={plug} items={items} />;
}
