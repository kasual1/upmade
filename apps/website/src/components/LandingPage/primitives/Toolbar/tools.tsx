import type { ReactNode } from "react";
import { TOOLS as LEGACY_TOOLS } from "../../../Landing/tools";

/** The editor tools the hero toolbar can show, named as the toolCycle agent's `tool:*` events name them. */
export const TOOL_KEYS = ["cursor", "pen", "eraser", "arrow", "shapeRectangle", "type", "image"] as const;

export type ToolKey = (typeof TOOL_KEYS)[number];

/** The design's accessible names of the tools (the design calls the rectangle tool "Shape"). */
const LABELS: Record<ToolKey, string> = {
  cursor: "Select",
  pen: "Pen",
  eraser: "Eraser",
  arrow: "Arrow",
  shapeRectangle: "Shape",
  type: "Text",
  image: "Image",
};

/**
 * Each tool's label and icon (children of a 24x24 Lucide-style SVG). The icons are the legacy mock toolbar's
 * (Landing/tools.tsx), which lists the same tools in the same order.
 */
export const TOOLS: Record<ToolKey, { label: string; icon: ReactNode }> = Object.fromEntries(
  TOOL_KEYS.map((key, index) => [key, { label: LABELS[key], icon: LEGACY_TOOLS[index].icon }]),
) as Record<ToolKey, { label: string; icon: ReactNode }>;
