/**
 * Agent animations are plain data: keyframe tracks for the parts of an agent (body, eyes, hands) and for the
 * props it handles (a hat, a bouquet...), plus named events that let the page react at given moments.
 * `poseAt()` (timeline.ts) turns an animation and a time into a pose; `<Agent>` draws the rig and applies it.
 */

/** An [x, y] point in the agent's 64x64 drawing space (the feet sit near y 49.5). */
export type Vec = readonly [number, number];

/**
 * How a track eases into a key. `inOut` (the default) starts and ends slowly, which is what most of the
 * agents' moves use; `out` decelerates (good for a pop or a landing), `in` accelerates (good for a throw).
 */
export type Ease = "linear" | "inOut" | "in" | "out";

/** A keyframe: the time in ms from the start of the loop, the value, and how to ease into it. */
export type Key<V> = readonly [time: number, value: V, ease?: Ease];

/** Keyframes in time order. Before the first key and after the last one the value holds. */
export type Track<V> = readonly Key<V>[];

/** A [from, to) range of time in ms. */
export type Span = readonly [from: number, to: number];

export type HandName = "L" | "R";

export interface HandTrack {
  /** where the hand is; when left out it rests at the shape's default spot */
  path?: Track<Vec>;
  /** when the hand is drawn behind the body (switch only while it is clear of the body) */
  behind?: readonly Span[];
}

export interface PropTrack {
  /**
   * what the prop follows: a hand, the top of the head, or nothing ("world": just the offset, but still carried by the
   * body's lift, shift, lean and squash and by its hops, like everything the agent holds). "scene" props belong to the
   * scene, not the agent (a line it painted, the ground it stands on): placed by the offset in the box's own drawing,
   * they stay put while the body moves or hops; `behind` still draws them under the body.
   */
  attach: HandName | "head" | "world" | "scene";
  /** position relative to the attach point */
  offset?: Track<Vec>;
  rotate?: Track<number>;
  scale?: Track<number>;
  /** when it is shown; when left out it is always shown */
  visible?: readonly Span[];
  /** when it is drawn behind the body */
  behind?: readonly Span[];
  /** fades it (1 opaque, 0 invisible) */
  opacity?: Track<number>;
}

/**
 * One blink. The eyes close over `close` ms, stay shut (at `depth`) for `hold` ms from `at`, then reopen over
 * `open` ms. A shallow `depth` with a long `hold` makes a squint.
 */
export interface Blink {
  /** when the eyes are fully shut, in ms */
  at: number;
  /** ms to close (default 45) */
  close?: number;
  /** ms to reopen (default 45) */
  open?: number;
  /** ms held shut after `at` (default 0) */
  hold?: number;
  /** how open the eyes are while shut: 0 closed, 1 open (default .1) */
  depth?: number;
  /** how the eyes close and reopen: "smooth" eases in and out (default), "linear" moves at an even speed */
  ease?: "smooth" | "linear";
}

/** The parts of a blink an animation can set once for all its blinks. */
export type BlinkShape = Omit<Blink, "at">;

export interface AgentAnimation {
  /** the loop's length in ms */
  duration: number;
  body?: {
    /** vertical offset, negative is up (a hop) */
    lift?: Track<number>;
    /** horizontal offset, negative is left (a shake, a step aside, or a fixed placement) */
    shift?: Track<number>;
    /** rotation in degrees about the feet */
    lean?: Track<number>;
    /** [scaleX, scaleY] about the feet, for squash and stretch */
    squash?: Track<Vec>;
    /** a gentle breathing scale (amount, e.g. .012) */
    breathe?: number;
    /**
     * the body outline over time, for agents that change shape (into a cursor, a circle...). Keys are SVG path strings;
     * between two keys with the same commands the numbers are interpolated, otherwise the outline switches at the key.
     * Without it the agent keeps its shape's outline.
     */
    outline?: Track<string>;
  };
  eyes?: {
    /** where the eyes look, as an offset of the pupils */
    look?: Track<Vec>;
    /** blinks: a time (the moment the eyes are shut, using the `blink` shape) or a blink of its own shape */
    blinks?: readonly (number | Blink)[];
    /** the shape of this animation's blinks when a blink doesn't give its own (default: 45 ms each way to .1) */
    blink?: BlinkShape;
    /** when the eyes are closed happily (^ ^) */
    happy?: readonly Span[];
    /** when the eyes are not drawn at all (e.g. while the body is a cursor) */
    hidden?: readonly Span[];
    /** blushing cheeks under the eyes (0 none, 1 full) */
    blush?: Track<number>;
    /**
     * an eyelid: how much of the eyes' height is cut off flat from the top (0 none, .5 half, 1 all). The cut moves
     * with the gaze but not with blinks or `scale`, so the eyes can blink or stretch under a lid.
     */
    lid?: Track<number>;
    /** [x, y] size of the eyes about their lower ends (1 normal); y above 1 stretches them taller than open */
    scale?: Track<Vec>;
    /** where the white glints sit, as an offset from their place in the pupils (they move with the gaze too) */
    glint?: Track<Vec>;
  };
  hands?: Partial<Record<HandName, HandTrack>>;
  props?: Record<string, PropTrack>;
  /** [time, name]: `onEvent(name)` fires when the loop passes that time */
  events?: readonly (readonly [number, string])[];
  /** the moment shown, still, to people who prefer reduced motion */
  rest?: number;
  /**
   * For an animation drawn at another size or height than the family's (a port of a drawing made for another layout,
   * with room for its props): the scale its agent is drawn at and the y its feet stand on. The agent's box then shows
   * the drawing zoomed by 1 / scale about the box's middle, with that ground at the shape's own feet, so the agent
   * comes out at the same size and on the same line as every other agent; its props reach out past the box.
   * Layers drawn together (a stage agent on top of a body) take the same frame.
   */
  frame?: { scale: number; ground: number };
}

/** Everything the rig needs to draw one moment of an animation. */
export interface Pose {
  /** `outline` is set only when the animation changes the body's outline */
  body: { lift: number; shift: number; lean: number; scale: Vec; outline?: string };
  eyes: { look: Vec; open: number; happy: boolean; hidden: boolean; blush: number; lid: number; scale: Vec; glint: Vec };
  hands: Record<HandName, { at: Vec; behind: boolean }>;
  props: Record<string, { visible: boolean; behind: boolean; at: Vec; rotate: number; scale: number; opacity: number }>;
}
