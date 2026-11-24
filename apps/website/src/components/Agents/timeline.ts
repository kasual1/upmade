/**
 * Pure functions from an animation and a time to a pose: no DOM, no clock, so they are easy to test and to
 * scrub through in the preview page.
 */
import type { AgentAnimation, Ease, HandName, Key, Pose, Span, Track, Vec } from "./types";
import { SHAPES, type ShapeName } from "./tokens";

const EASES: Record<Ease, (u: number) => number> = {
  linear: (u) => u,
  inOut: (u) => u * u * (3 - 2 * u),
  in: (u) => u * u,
  out: (u) => 1 - (1 - u) * (1 - u),
};

const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

/** The value of a track at time t: eased between the keys around t, held before the first and after the last. */
export function sample(track: Track<number> | undefined, t: number, fallback: number): number;
export function sample(track: Track<Vec> | undefined, t: number, fallback: Vec): Vec;
export function sample(track: Track<number | Vec> | undefined, t: number, fallback: number | Vec): number | Vec {
  if (!track || track.length === 0) return fallback;
  if (t <= track[0][0]) return track[0][1];
  for (let n = 1; n < track.length; n++) {
    const [t1, b, ease = "inOut"] = track[n] as Key<number | Vec>;
    if (t > t1) continue;
    const [t0, a] = track[n - 1];
    const u = t1 > t0 ? EASES[ease]((t - t0) / (t1 - t0)) : 1;
    return typeof a === "number" ? lerp(a, b as number, u) : [lerp(a[0], (b as Vec)[0], u), lerp(a[1], (b as Vec)[1], u)];
  }
  return track[track.length - 1][1];
}

export const within = (spans: readonly Span[] | undefined, t: number) => !!spans?.some(([a, b]) => t >= a && t < b);

/** How open the eyes are (1 open, .1 shut) at time t, with a quick blink of `len` ms around each blink time. */
export function openness(blinks: readonly number[] | undefined, t: number, len = 90): number {
  for (const b of blinks ?? []) {
    const d = Math.abs(t - b);
    if (d < len / 2) return 0.1 + 0.9 * (d / (len / 2));
  }
  return 1;
}

/** One moment of an animation, for a given body shape. t is wrapped into the loop. */
export function poseAt(anim: AgentAnimation, t: number, shape: ShapeName = "squircle"): Pose {
  const spec = SHAPES[shape];
  t = ((t % anim.duration) + anim.duration) % anim.duration;
  const breathe = 1 + (anim.body?.breathe ?? 0) * Math.sin((2 * Math.PI * t) / anim.duration * 2);
  const squash = sample(anim.body?.squash, t, [1, 1] as Vec);
  const hand = (name: HandName) => ({
    at: sample(anim.hands?.[name]?.path, t, spec.hands[name]),
    behind: within(anim.hands?.[name]?.behind, t),
  });
  const hands = { L: hand("L"), R: hand("R") };
  const props: Pose["props"] = {};
  for (const [name, p] of Object.entries(anim.props ?? {})) {
    const anchor: Vec = p.attach === "head" ? spec.head : p.attach === "world" ? [0, 0] : hands[p.attach].at;
    const offset = sample(p.offset, t, [0, 0] as Vec);
    props[name] = {
      visible: p.visible ? within(p.visible, t) : true,
      behind: within(p.behind, t),
      at: [anchor[0] + offset[0], anchor[1] + offset[1]],
      rotate: sample(p.rotate, t, 0),
      scale: sample(p.scale, t, 1),
    };
  }
  return {
    body: { lift: sample(anim.body?.lift, t, 0), lean: sample(anim.body?.lean, t, 0), scale: [squash[0], squash[1] * breathe] },
    eyes: { look: sample(anim.eyes?.look, t, [0, 0] as Vec), open: openness(anim.eyes?.blinks, t), happy: within(anim.eyes?.happy, t) },
    hands,
    props,
  };
}

/** The events whose time lies in (from, to], wrapping round the end of the loop. */
export function eventsBetween(anim: AgentAnimation, from: number, to: number): string[] {
  const d = anim.duration;
  const a = ((from % d) + d) % d, b = ((to % d) + d) % d;
  return (anim.events ?? [])
    .filter(([at]) => (a <= b ? at > a && at <= b : at > a || at <= b))
    .map(([, name]) => name);
}

/** Problems with an animation's data (keys out of order or outside the loop, spans the wrong way round...). */
export function validate(anim: AgentAnimation): string[] {
  const issues: string[] = [];
  const keys = (label: string, track?: Track<unknown>) =>
    track?.forEach(([t], n) => {
      if (t < 0 || t > anim.duration) issues.push(`${label}: key at ${t} ms is outside the ${anim.duration} ms loop`);
      if (n > 0 && t < track[n - 1][0]) issues.push(`${label}: keys out of order at ${t} ms`);
    });
  const spans = (label: string, list?: readonly Span[]) =>
    list?.forEach(([a, b]) => {
      if (a > b) issues.push(`${label}: span [${a}, ${b}] runs backwards`);
      if (a < 0 || b > anim.duration) issues.push(`${label}: span [${a}, ${b}] is outside the loop`);
    });
  keys("body.lift", anim.body?.lift);
  keys("body.lean", anim.body?.lean);
  keys("body.squash", anim.body?.squash);
  keys("eyes.look", anim.eyes?.look);
  spans("eyes.happy", anim.eyes?.happy);
  for (const h of ["L", "R"] as const) {
    keys(`hands.${h}`, anim.hands?.[h]?.path);
    spans(`hands.${h}.behind`, anim.hands?.[h]?.behind);
  }
  for (const [name, p] of Object.entries(anim.props ?? {})) {
    keys(`props.${name}.offset`, p.offset);
    keys(`props.${name}.rotate`, p.rotate);
    keys(`props.${name}.scale`, p.scale);
    spans(`props.${name}.visible`, p.visible);
    spans(`props.${name}.behind`, p.behind);
  }
  anim.events?.forEach(([t, name]) => {
    if (t < 0 || t > anim.duration) issues.push(`event "${name}" at ${t} ms is outside the loop`);
  });
  return issues;
}
