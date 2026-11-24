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
  /** what the prop follows: a hand, the top of the head, or nothing ("world": just the offset) */
  attach: HandName | "head" | "world";
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

export interface AgentAnimation {
  /** the loop's length in ms */
  duration: number;
  body?: {
    /** vertical offset, negative is up (a hop) */
    lift?: Track<number>;
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
    /** times of quick blinks */
    blinks?: readonly number[];
    /** when the eyes are closed happily (^ ^) */
    happy?: readonly Span[];
    /** when the eyes are not drawn at all (e.g. while the body is a cursor) */
    hidden?: readonly Span[];
    /** blushing cheeks under the eyes (0 none, 1 full) */
    blush?: Track<number>;
  };
  hands?: Partial<Record<HandName, HandTrack>>;
  props?: Record<string, PropTrack>;
  /** [time, name]: `onEvent(name)` fires when the loop passes that time */
  events?: readonly (readonly [number, string])[];
  /** the moment shown, still, to people who prefer reduced motion */
  rest?: number;
}

/** Everything the rig needs to draw one moment of an animation. */
export interface Pose {
  /** `outline` is set only when the animation changes the body's outline */
  body: { lift: number; lean: number; scale: Vec; outline?: string };
  eyes: { look: Vec; open: number; happy: boolean; hidden: boolean; blush: number };
  hands: Record<HandName, { at: Vec; behind: boolean }>;
  props: Record<string, { visible: boolean; behind: boolean; at: Vec; rotate: number; scale: number; opacity: number }>;
}
