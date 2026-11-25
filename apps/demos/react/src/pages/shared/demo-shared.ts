import type { CSSProperties } from "react";
import type { UpmadeBaseObject } from "@upmade/react-editor";
import { createSeedObjects } from "../getting-started/seed-objects";

export const hostStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  fontFamily: "Roboto, sans-serif",
};

export const toolbarStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 12px",
  background: "#fafaf8",
  borderBottom: "2px solid #0a0a0a",
  flexWrap: "wrap",
};

export const statusBarStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "8px 12px",
  background: "#fafaf8",
  borderTop: "2px solid #0a0a0a",
  fontSize: "13px",
};

export const editorStyle: CSSProperties = {
  flex: 1,
  minHeight: 0,
  display: "block",
};

export function buttonStyle(active = false): CSSProperties {
  return {
    padding: "6px 12px",
    border: `2px solid #0a0a0a`,
    borderRadius: "999px",
    background: active ? "#056bb4" : "#ffffff",
    color: active ? "#ffffff" : "#0a0a0a",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "inherit",
  };
}

export async function seedEditor(editor: HTMLUpmadeEditorElement) {
  for (const obj of createSeedObjects()) {
    await editor.addObject(obj as UpmadeBaseObject<HTMLElement | SVGElement>);
  }
}
