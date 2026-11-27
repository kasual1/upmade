import { UpmadePoint } from '../interfaces/point.interface';

/** Minimal viewport state needed to project world coordinates into overlay (screen) coordinates. */
export interface UpmadeOverlayViewportState {
  scale: number;
  translateX: number;
  translateY: number;
  viewportWidth: number;
  viewportHeight: number;
}

/**
 * Longest cursor icon, in characters. Icons are shared with collaborators on every presence update, so keep them
 * small: a plain SVG icon is well below 1 KB.
 */
export const UPMADE_CURSOR_ICON_MAX_LENGTH = 8192;

export type UpmadeOverlayEdge = 'top' | 'right' | 'bottom' | 'left';

export interface UpmadeEdgeClampResult {
  x: number;
  y: number;
  /** Angle (radians) pointing from the clamped position towards the off-screen point. */
  angle: number;
  edge: UpmadeOverlayEdge;
}

/**
 * Shared geometry for screen-space overlays (remote cursors, agentic cursors) rendered
 * on top of the engine.
 */
export class UpmadeViewportOverlayHelper {
  static worldToScreen(state: UpmadeOverlayViewportState, worldX: number, worldY: number): UpmadePoint {
    return {
      x: worldX * state.scale + state.translateX,
      y: worldY * state.scale + state.translateY,
    };
  }

  static isInViewport(state: UpmadeOverlayViewportState, screenX: number, screenY: number): boolean {
    return screenX >= 0 && screenX <= state.viewportWidth && screenY >= 0 && screenY <= state.viewportHeight;
  }

  /** Clamps an off-screen point to the viewport edge, returning the nearest edge and the direction to the point. */
  static clampToEdge(state: UpmadeOverlayViewportState, screenX: number, screenY: number, padding: number): UpmadeEdgeClampResult {
    const { viewportWidth, viewportHeight } = state;

    const clampedX = Math.max(padding, Math.min(viewportWidth - padding, screenX));
    const clampedY = Math.max(padding, Math.min(viewportHeight - padding, screenY));

    const distLeft = clampedX - padding;
    const distRight = viewportWidth - padding - clampedX;
    const distTop = clampedY - padding;
    const distBottom = viewportHeight - padding - clampedY;

    let edge: UpmadeOverlayEdge = 'top';
    const minDist = Math.min(distLeft, distRight, distTop, distBottom);
    if (minDist === distLeft) edge = 'left';
    else if (minDist === distRight) edge = 'right';
    else if (minDist === distTop) edge = 'top';
    else edge = 'bottom';

    const angle = Math.atan2(screenY - clampedY, screenX - clampedX);

    return { x: clampedX, y: clampedY, angle, edge };
  }

  static getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0 || (parts.length === 1 && parts[0].length <= 1)) {
      return name;
    }
    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /**
   * The image source of a cursor icon (`IUpmadeUser.cursorIcon`, `UpmadeAgentOptions.cursorIcon`), or `null` when
   * there is none or it is not usable. SVG markup becomes a `data:` URL; image URLs are accepted when they are
   * http(s), `data:image/` or relative. Icons are always drawn as images, never as markup, so an icon that comes
   * from a collaborator cannot run scripts or reach the page.
   */
  static getCursorIconSrc(icon: unknown): string | null {
    if (typeof icon !== 'string') {
      return null;
    }
    const value = icon.trim();
    if (value.length === 0 || value.length > UPMADE_CURSOR_ICON_MAX_LENGTH) {
      return null;
    }
    if (value.startsWith('<')) {
      const svgTag = /<svg\b[^>]*>/i.exec(value);
      if (!svgTag) {
        return null;
      }
      // An SVG file drawn as an image needs the SVG namespace, which inline markup often leaves out.
      const markup = /\sxmlns\s*=/i.test(svgTag[0])
        ? value
        : value.slice(0, svgTag.index) + svgTag[0].replace(/^<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"') + value.slice(svgTag.index + svgTag[0].length);
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
    }
    return UpmadeViewportOverlayHelper.isSafeImageUrl(value, UPMADE_CURSOR_ICON_MAX_LENGTH) ? value : null;
  }

  /** Whether a URL is http(s), `data:image/` or relative, so a collaborator cannot point images at other schemes. */
  static isSafeImageUrl(value: unknown, maxLength = 2048): value is string {
    if (typeof value !== 'string' || value.length === 0 || value.length > maxLength) {
      return false;
    }
    const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(value.trim())?.[1]?.toLowerCase();
    return scheme === undefined || scheme === 'http' || scheme === 'https' || (scheme === 'data' && /^data:image\//i.test(value.trim()));
  }
}

