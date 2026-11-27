import { UpmadeBaseObject, UpmadePoint } from '@upmade/core';

/**
 * World point at the top-left corner of the axis-aligned box around the given objects (rotation included).
 * A cursor whose owner has these objects selected shows its name label here instead of following the pointer.
 * Returns `null` when no object is given.
 */
export function getSelectionTopLeft(objects: Iterable<UpmadeBaseObject<any> | null | undefined>): UpmadePoint | null {
  let minX = Infinity;
  let minY = Infinity;
  for (const object of objects) {
    if (!object) continue;
    const polygon = object.rotatedPolygon;
    for (const corner of [polygon.topLeft, polygon.topRight, polygon.bottomRight, polygon.bottomLeft]) {
      if (corner.x < minX) minX = corner.x;
      if (corner.y < minY) minY = corner.y;
    }
  }
  return Number.isFinite(minX) && Number.isFinite(minY) ? { x: minX, y: minY } : null;
}
