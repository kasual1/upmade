/**
 * The frames demo's geometry and script, kept free of React and Docusaurus so the unit tests can import it.
 *
 * Everything is laid out on one virtual stage of STAGE_W x STAGE_H px (the design's .frames-demo, whose `cqw` units
 * become 10 virtual px each), which ScaledStage scales to the frame. The shop pages inside the frames are laid out
 * at their own readable widths (SHOP_W: desktop 800 px, phone 300 px, as the design's .frames-scale) and scaled
 * down to their frame by a constant factor, so no text is ever shrunk with font-size (plan §3.7).
 */

/** the virtual stage: 1 design `cqw` = 10 px; 16:11 like the showcase frame */
export const STAGE_W = 1000;
export const STAGE_H = 687.5;

export type Device = "desktop" | "phone";

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** the frames on the stage (the design's .frames-frame: top 15cqw; desktop 9.5/56/40cqw, phone 70.5/20/43.3cqw) */
export const FRAMES: Record<Device, Box> = {
  desktop: { left: 95, top: 150, width: 560, height: 400 },
  phone: { left: 705, top: 150, width: 200, height: 433 },
};

/** the titlebar chip above each frame: 5cqw high, 1.3cqw above the frame; its side padding (.7cqw + the outline) */
export const TITLEBAR = { height: 50, gap: 13, padding: 11 } as const;
/** the play and add buttons in the titlebar (3.2cqw square) */
export const BUTTON = 32;

/** how far the world pans while only the desktop frame is shown (.frames-world[data-solo]: 12.5cqw) */
export const SOLO_SHIFT = 125;

/** the shop pages' layout widths (the design's .frames-scale) */
export const SHOP_W: Record<Device, number> = { desktop: 800, phone: 300 };

/** the scale of a device's shop page to its frame, and the page's layout height at that scale */
export function shopScale(device: Device): { k: number; height: number } {
  const k = FRAMES[device].width / SHOP_W[device];
  return { k, height: FRAMES[device].height / k };
}

/**
 * The shop's unit, `--u`: 1% of the desktop page's inner width (88% of 800 px), 2.8% of the phone page's (86% of
 * 300 px), as in the design. Its smallest text (the note, 1.8u) stays above 12 px.
 */
export const SHOP_UNIT: Record<Device, number> = { desktop: 7.04, phone: 7.224 };

/** where the cursor points: off the stage below its middle, at the desktop titlebar's add button, on the phone page */
export type Target = "offscreen" | "add" | "phone";

/** where on a target the cursor's tip rests, as fractions of its width and height (the design's TIP) */
export const TIP: Record<Exclude<Target, "offscreen">, [number, number]> = { add: [0.5, 0.5], phone: [0.62, 0.3] };

/** the box of the desktop titlebar's add button, in the world's coordinates */
export function addButtonBox(): Box {
  const f = FRAMES.desktop;
  return {
    left: f.left + f.width - TITLEBAR.padding - BUTTON,
    top: f.top - TITLEBAR.gap - TITLEBAR.height / 2 - BUTTON / 2,
    width: BUTTON,
    height: BUTTON,
  };
}

/**
 * Where the cursor's tip is for a target, in the world's virtual px (the cursor lives in the world, so it pans with
 * the frames). Off screen it sits below the stage's middle once the world has panned to the desktop frame; `below`
 * is how far below the stage, in virtual px.
 */
export function cursorPoint(target: Target, below = 60): { x: number; y: number } {
  if (target === "offscreen") return { x: STAGE_W * 0.375, y: STAGE_H + below };
  const box = target === "add" ? addButtonBox() : FRAMES.phone;
  const [tx, ty] = TIP[target];
  return { x: box.left + box.width * tx, y: box.top + box.height * ty };
}

export interface BuildState {
  /** the desktop page has been generated (until then its frame shows the loading panel) */
  built: boolean;
  target: Target;
  /** the cursor is pressing the add button */
  pressed: boolean;
  /** the phone variant has been added */
  phone: boolean;
  /** the phone page has been generated */
  phoneBuilt: boolean;
}

/** both frames built, the cursor resting on the phone page: the server render, reduced motion, between loops */
export const FINAL_STATE: BuildState = { built: true, target: "phone", pressed: false, phone: true, phoneBuilt: true };

/** the start of a round: the desktop frame alone and loading, the cursor off screen */
export const START_STATE: BuildState = { built: false, target: "offscreen", pressed: false, phone: false, phoneBuilt: false };

/** one round of the choreography (the design's run()): at `ms` after the round starts, apply `patch` */
export const STEPS: readonly { ms: number; patch: Partial<BuildState> }[] = [
  { ms: 1500, patch: { built: true } }, // the desktop page pops in
  { ms: 2300, patch: { target: "add" } }, // the cursor flies to the add button
  { ms: 3700, patch: { pressed: true } },
  { ms: 3850, patch: { pressed: false, phone: true } }, // a phone frame appears (and loads); the world recentres
  { ms: 4800, patch: { target: "phone" } },
  { ms: 5350, patch: { phoneBuilt: true } },
];

/** a round's length; then the next one starts from START_STATE */
export const LOOP_MS = 9400;

/** the state `ms` into a round (pure; the component schedules the same steps with timers) */
export function stateAt(ms: number): BuildState {
  let state = START_STATE;
  for (const step of STEPS) if (step.ms <= ms % LOOP_MS) state = { ...state, ...step.patch };
  return state;
}
