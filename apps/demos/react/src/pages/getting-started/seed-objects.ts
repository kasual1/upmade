import {
  UpmadeBaseObject,
  UpmadeShape,
  ShapeType,
} from "@upmade/react-editor";

export function createSeedObjects(): UpmadeBaseObject[] {
  return [
    new UpmadeShape({
      translateX: 20,
      translateY: -150,
      width: 120,
      height: 120,
      shapeType: ShapeType.Rectangle,
      fillColor: { light: "#ffd5ea", dark: "#7a2e55" },
      strokeColor: { light: "#ff6ab5", dark: "#ff6ab5" },
      strokeWidth: 3,
    }),
    new UpmadeShape({
      translateX: -140,
      translateY: -170,
      width: 120,
      height: 120,
      shapeType: ShapeType.Ellipse,
      fillColor: { light: "#d7eeff", dark: "#2b5674" },
      strokeColor: { light: "#6fc3ff", dark: "#6fc3ff" },
      strokeWidth: 3,
    }),
    new UpmadeShape({
      translateX: -60,
      translateY: 10,
      width: 120,
      height: 110,
      shapeType: ShapeType.Triangle,
      fillColor: { light: "#ccf6db", dark: "#22603a" },
      strokeColor: { light: "#4ade80", dark: "#4ade80" },
      strokeWidth: 3,
    }),
  ];
}
