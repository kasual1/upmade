/**
 * How the code typer fits its code into the window (plan §3.7). The design sizes the code font with the window,
 * `min(14px, max(11px, (window width - 36px) / 36))`, which in-app browsers with a minimum font size clamp, so the
 * code overflows. Here the code is always laid out at a real CODE_FONT_PX and scaled by a transform instead:
 * `k = design font / CODE_FONT_PX`, laid out `1 / k` times wider than the window, so it wraps and looks exactly as
 * the design's does at every width. Pure, so the unit tests import it directly.
 */

/** the code's real font size (the design's largest) */
export const CODE_FONT_PX = 14;
/** the design's smallest code font size, i.e. the smallest the scaled code looks */
export const MIN_LOOK_PX = 11;

/** The design's code font size for a window `windowWidth` px wide (its outer width, the frame's border included). */
export function designFontPx(windowWidth: number): number {
  return Math.min(CODE_FONT_PX, Math.max(MIN_LOOK_PX, (windowWidth - 36) / 36));
}

/** The scale of the code for a window `windowWidth` px wide: 1 down to 11 / 14 (rounded to 4 places). */
export function codeScale(windowWidth: number): number {
  if (!Number.isFinite(windowWidth) || windowWidth <= 0) return 1;
  return Math.round((designFontPx(windowWidth) / CODE_FONT_PX) * 10000) / 10000;
}
