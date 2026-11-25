/**
 * The "Highly customizable" media's themes and clock, free of React and the DOM (unit-tested in
 * tests/landing-themes.spec.ts).
 *
 * The themes are the design's (its ThemesDemo script, the agentic design's THEMES), as data: colours stay out of the
 * CSS module, which only reads `var(--theme-*)`. The design gives lengths in cqw of its 605px wide `.themes-fit`;
 * here the controls are laid out on a 605px ScaledStage, so `cq()` turns them into the same virtual px. The
 * design's one shadow per theme is split into its parts (x, y, blur, colour), so that every --theme-* value is a
 * registered custom property (styles.module.css `@property`) and the whole theme morphs by transitioning them on
 * the media's root, gradients included.
 */

/** the virtual stage the controls are laid out on: the design's `.themes-fit`, 16:11 like the frame */
export const STAGE_W = 605;
export const STAGE_H = (STAGE_W * 11) / 16;

/** `n` cqw of the 605px stage, in px (rounded to 1/1000 px) */
export function cq(n: number): string {
  return `${Math.round(n * STAGE_W * 10) / 1000}px`;
}

export interface Theme {
  /** what it is, for people reading the table */
  name: string;
  canvas: string;
  surfaceTop: string;
  surface: string;
  field: string;
  border: string;
  borderWidth: string;
  radius: string;
  sendRadius: string;
  shadowX: string;
  shadowY: string;
  shadowBlur: string;
  shadowColor: string;
  ink: string;
  muted: string;
  accentTop: string;
  accent: string;
  onAccent: string;
}

export type ThemeKey = Exclude<keyof Theme, "name">;

/** each theme value's custom property and its registered syntax (styles.module.css keeps the `@property` rules) */
export const THEME_VARS = {
  canvas: { name: "--theme-canvas", syntax: "<color>" },
  surfaceTop: { name: "--theme-surface-top", syntax: "<color>" },
  surface: { name: "--theme-surface", syntax: "<color>" },
  field: { name: "--theme-field", syntax: "<color>" },
  border: { name: "--theme-border", syntax: "<color>" },
  borderWidth: { name: "--theme-border-width", syntax: "<length>" },
  radius: { name: "--theme-radius", syntax: "<length>" },
  sendRadius: { name: "--theme-send-radius", syntax: "<length-percentage>" },
  shadowX: { name: "--theme-shadow-x", syntax: "<length>" },
  shadowY: { name: "--theme-shadow-y", syntax: "<length>" },
  shadowBlur: { name: "--theme-shadow-blur", syntax: "<length>" },
  shadowColor: { name: "--theme-shadow-color", syntax: "<color>" },
  ink: { name: "--theme-ink", syntax: "<color>" },
  muted: { name: "--theme-muted", syntax: "<color>" },
  accentTop: { name: "--theme-accent-top", syntax: "<color>" },
  accent: { name: "--theme-accent", syntax: "<color>" },
  onAccent: { name: "--theme-on-accent", syntax: "<color>" },
} as const satisfies Record<ThemeKey, { name: `--theme-${string}`; syntax: string }>;

export const THEME_KEYS = Object.keys(THEME_VARS) as ThemeKey[];

/**
 * The five themes, in the order the hat-swapping agent's hats go on (Agents/props/Hat HAT_KINDS: top hat, cap,
 * beanie, beret, party hat): the agent starts in its top hat with the first theme, and each "putOn" wears the next.
 */
export const THEMES: readonly Theme[] = [
  {
    name: "Upmade's light theme, in the agents' ink",
    canvas: "#F7F7F4",
    surfaceTop: "#FFFFFF",
    surface: "#F1F1EE",
    field: "#FFFFFF",
    border: "#0A0A0A",
    borderWidth: cq(0.55),
    radius: cq(2.8),
    sendRadius: "50%",
    shadowX: "0px",
    shadowY: cq(0.7),
    shadowBlur: "0px",
    shadowColor: "rgba(10, 10, 10, 0.1)",
    ink: "#0A0A0A",
    muted: "#6b6b75",
    accentTop: "#3a3a3a",
    accent: "#0A0A0A",
    onAccent: "#FFFFFF",
  },
  {
    name: "dark: the landing page's off-white as chunky outlines on ink, with a pink send button",
    canvas: "#141416",
    surfaceTop: "#2c2c31",
    surface: "#1f1f23",
    field: "#18181b",
    border: "#F7F7F4",
    borderWidth: cq(0.55),
    radius: cq(2.8),
    sendRadius: "50%",
    shadowX: "0px",
    shadowY: cq(0.7),
    shadowBlur: "0px",
    shadowColor: "rgba(0, 0, 0, 0.55)",
    ink: "#F7F7F4",
    muted: "#a1a1aa",
    accentTop: "#ff8bc5",
    accent: "#FF6AB5",
    onAccent: "#0A0A0A",
  },
  {
    name: "warm paper, pill shaped controls",
    canvas: "#f6efe3",
    surfaceTop: "#fffaf0",
    surface: "#f5e7d0",
    field: "#fffdf7",
    border: "#4a3423",
    borderWidth: cq(0.45),
    radius: cq(5),
    sendRadius: "50%",
    shadowX: "0px",
    shadowY: cq(0.7),
    shadowBlur: "0px",
    shadowColor: "rgba(120, 85, 40, 0.16)",
    ink: "#4a3423",
    muted: "#8c7158",
    accentTop: "#e2765d",
    accent: "#c8553d",
    onAccent: "#fffaf0",
  },
  {
    name: "bold, square, hard shadows",
    canvas: "#FFD60A",
    surfaceTop: "#FFFFFF",
    surface: "#FFFFFF",
    field: "#FFFFFF",
    border: "#0A0A0A",
    borderWidth: cq(0.75),
    radius: "0px",
    sendRadius: "0px",
    shadowX: cq(1.1),
    shadowY: cq(1.1),
    shadowBlur: "0px",
    shadowColor: "#0A0A0A",
    ink: "#0A0A0A",
    muted: "#3f3f46",
    accentTop: "#ff8bc5",
    accent: "#FF6AB5",
    onAccent: "#0A0A0A",
  },
  {
    name: "deep blue, glowing accent",
    canvas: "#0b1f3a",
    surfaceTop: "#1d4a80",
    surface: "#12305a",
    field: "#0b1f3a",
    border: "#6FC3FF",
    borderWidth: cq(0.4),
    radius: cq(1.6),
    sendRadius: cq(1.2),
    shadowX: "0px",
    shadowY: "0px",
    shadowBlur: cq(3),
    shadowColor: "rgba(111, 195, 255, 0.35)",
    ink: "#e0f2fe",
    muted: "#8fb4d9",
    accentTop: "#8fd0ff",
    accent: "#6FC3FF",
    onAccent: "#0b1f3a",
  },
];

/** A theme as custom properties (`{ "--theme-canvas": "#F7F7F4", … }`), for a style prop or setProperty. */
export function themeVars(theme: Theme): Record<`--theme-${string}`, string> {
  const vars: Record<`--theme-${string}`, string> = {};
  for (const key of THEME_KEYS) vars[THEME_VARS[key].name] = theme[key];
  return vars;
}

/** The theme after `index`, wrapping around. */
export function nextTheme(index: number): number {
  return (index + 1) % THEMES.length;
}

/** The theme worn after the agent's `count`th "putOn" (it starts in the first one's hat). */
export function themeAfterPutOns(count: number): number {
  return ((count % THEMES.length) + THEMES.length) % THEMES.length;
}

/* ---- the clock ---- */

/** the hat-swapping agent's loop (Agents/animations/hatSwap.ts `duration`): one "putOn" per loop */
export const HAT_LOOP_MS = 2600;

/**
 * The fallback clock: when no "putOn" has arrived for FALLBACK_AFTER_MS while the media is on screen (the agent
 * does not forward its events, is paused or off screen), the media moves on by itself, one theme per HAT_LOOP_MS,
 * until the next "putOn" arrives.
 */
export const FALLBACK_AFTER_MS = HAT_LOOP_MS * 1.5;

/** how long one morph takes (styles.module.css `--themes-morph`) */
export const MORPH_MS = 600;
