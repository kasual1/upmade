import { UPMADE_CURSOR_ICON_MAX_LENGTH, UpmadeOverlayViewportState, UpmadeViewportOverlayHelper } from './viewport-overlay.helper';

describe('UpmadeViewportOverlayHelper', () => {
  const state: UpmadeOverlayViewportState = {
    scale: 2,
    translateX: 10,
    translateY: 20,
    viewportWidth: 800,
    viewportHeight: 600,
  };

  describe('worldToScreen', () => {
    it('should apply scale and translation', () => {
      expect(UpmadeViewportOverlayHelper.worldToScreen(state, 5, 7)).toEqual({ x: 20, y: 34 });
    });
  });

  describe('isInViewport', () => {
    it('should return true for points inside the viewport', () => {
      expect(UpmadeViewportOverlayHelper.isInViewport(state, 0, 0)).toBe(true);
      expect(UpmadeViewportOverlayHelper.isInViewport(state, 800, 600)).toBe(true);
    });

    it('should return false for points outside the viewport', () => {
      expect(UpmadeViewportOverlayHelper.isInViewport(state, -1, 10)).toBe(false);
      expect(UpmadeViewportOverlayHelper.isInViewport(state, 10, 601)).toBe(false);
    });
  });

  describe('clampToEdge', () => {
    it('should clamp a point left of the viewport to the left edge', () => {
      const result = UpmadeViewportOverlayHelper.clampToEdge(state, -100, 300, 8);
      expect(result.x).toBe(8);
      expect(result.y).toBe(300);
      expect(result.edge).toBe('left');
      expect(result.angle).toBeCloseTo(Math.PI);
    });

    it('should clamp a point below the viewport to the bottom edge', () => {
      const result = UpmadeViewportOverlayHelper.clampToEdge(state, 400, 1000, 8);
      expect(result.x).toBe(400);
      expect(result.y).toBe(592);
      expect(result.edge).toBe('bottom');
      expect(result.angle).toBeCloseTo(Math.PI / 2);
    });

    it('should clamp a point right of the viewport to the right edge', () => {
      const result = UpmadeViewportOverlayHelper.clampToEdge(state, 2000, 300, 8);
      expect(result.x).toBe(792);
      expect(result.edge).toBe('right');
    });
  });

  describe('getInitials', () => {
    it('should return initials for multi-word names', () => {
      expect(UpmadeViewportOverlayHelper.getInitials('Ada Byron Lovelace')).toBe('AL');
    });

    it('should return the first letter for single-word names', () => {
      expect(UpmadeViewportOverlayHelper.getInitials('planner')).toBe('P');
    });

    it('should return single characters unchanged', () => {
      expect(UpmadeViewportOverlayHelper.getInitials('x')).toBe('x');
    });
  });

  describe('getCursorIconSrc', () => {
    const decode = (src: string | null) => decodeURIComponent((src ?? '').replace('data:image/svg+xml;charset=utf-8,', ''));

    it('should return null when there is no icon', () => {
      expect(UpmadeViewportOverlayHelper.getCursorIconSrc(undefined)).toBeNull();
      expect(UpmadeViewportOverlayHelper.getCursorIconSrc(null)).toBeNull();
      expect(UpmadeViewportOverlayHelper.getCursorIconSrc('')).toBeNull();
      expect(UpmadeViewportOverlayHelper.getCursorIconSrc('   ')).toBeNull();
      expect(UpmadeViewportOverlayHelper.getCursorIconSrc(42)).toBeNull();
    });

    it('should turn SVG markup into a data URL and add the SVG namespace when it is missing', () => {
      const src = UpmadeViewportOverlayHelper.getCursorIconSrc('<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>');
      expect(src?.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true);
      expect(decode(src)).toBe('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>');
    });

    it('should keep markup that already declares the namespace, including an XML prologue', () => {
      const markup = '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" width="16"><rect width="16" height="16"/></svg>';
      expect(decode(UpmadeViewportOverlayHelper.getCursorIconSrc(markup))).toBe(markup);
    });

    it('should reject markup that is not SVG', () => {
      expect(UpmadeViewportOverlayHelper.getCursorIconSrc('<img src=x onerror="alert(1)">')).toBeNull();
    });

    it('should accept http(s), data:image and relative URLs only', () => {
      expect(UpmadeViewportOverlayHelper.getCursorIconSrc('https://example.com/bot.svg')).toBe('https://example.com/bot.svg');
      expect(UpmadeViewportOverlayHelper.getCursorIconSrc('/icons/bot.svg')).toBe('/icons/bot.svg');
      expect(UpmadeViewportOverlayHelper.getCursorIconSrc('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA');
      expect(UpmadeViewportOverlayHelper.getCursorIconSrc('javascript:alert(1)')).toBeNull();
      expect(UpmadeViewportOverlayHelper.getCursorIconSrc('data:text/html,x')).toBeNull();
    });

    it('should reject icons longer than the limit', () => {
      const long = `<svg>${'<g/>'.repeat(UPMADE_CURSOR_ICON_MAX_LENGTH)}</svg>`;
      expect(UpmadeViewportOverlayHelper.getCursorIconSrc(long)).toBeNull();
    });
  });
});
