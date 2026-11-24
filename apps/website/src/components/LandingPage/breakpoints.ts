/**
 * The landing pages' breakpoints, in CSS px (max-width queries: "at or below"). CSS modules write them as literals
 * (`@media (max-width: 960px)`), as documented in tokens.css; this object mirrors them for code (matchMedia, tests).
 *
 * - `stack` 960: grids drop to two columns and showcases stack (media above copy, the reversed order resets).
 * - `nowrap` 700: below it the hero subtitle may wrap (it stays on one line from 700 px up).
 * - `phone` 620: agents, the toolbar, paddings and type take their phone sizes; the feature grid has one column.
 */
export const BP = {
  stack: 960,
  nowrap: 700,
  phone: 620,
} as const;

export type Breakpoint = keyof typeof BP;

/** The media query matching widths at or below a breakpoint, e.g. `maxWidth("phone")` → `(max-width: 620px)`. */
export function maxWidth(bp: Breakpoint): string {
  return `(max-width: ${BP[bp]}px)`;
}

/** The page's side gutter at its narrowest (the CSS gutter is `max(24px, env(safe-area-inset-*))`). */
export const PAGE_GUTTER = 24;
