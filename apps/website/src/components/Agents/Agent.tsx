import { useEffect, useId, useRef, type CSSProperties, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { hopAt, randomHop, type Hop } from "./reactions";
import { createClock, subscribe } from "./runtime";
import { poseAt } from "./timeline";
import { COLOURS, INK, SHAPES, STROKE, type Colour, type ShapeName } from "./tokens";
import type { AgentAnimation, HandName, Pose } from "./types";

export interface AgentProps {
  shape?: ShapeName;
  colour?: Colour;
  /** what the agent does; without one it just stands there */
  animation?: AgentAnimation;
  /** how each prop named in the animation looks, drawn around its attach point (e.g. `{ hat: <Hat kind="beret" /> }`) */
  items?: Record<string, ReactNode>;
  /** called with an event's name when the loop passes it (see `AgentAnimation.events`); state updates made here are
   *  rendered before that frame is drawn */
  onEvent?: (name: string) => void;
  /** show this moment (ms) still instead of playing, e.g. for a scrubber */
  time?: number;
  paused?: boolean;
  /**
   * hops (a different random hop each time) when the pointer comes onto it or it is clicked; on by default. Pass
   * `{ lean, squash, lift }` factors to tone the hop down, e.g. `{ lean: 0, squash: 0 }` for an agent whose props
   * reach far from its feet, where tilting and squashing about the feet would fling them about.
   */
  reactive?: boolean | HopStyle;
  /** its eyes follow the pointer while it moves nearby, on top of the animation's own glances */
  followPointer?: boolean;
  /** describes the agent to screen readers; without it the agent is decorative */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

const HANDS: HandName[] = ["L", "R"];
/** numbers written into the SVG: 3 decimals is well under a pixel at any size the agents are drawn */
const f = (n: number) => String(Math.round(n * 1000) / 1000);
/** scales get 4 decimals, so slow breathing changes smoothly instead of in visible steps */
const fs = (n: number) => String(Math.round(n * 10000) / 10000);

interface Parts {
  body: SVGGElement;
  outline: SVGPathElement;
  blush: SVGGElement;
  gaze: SVGGElement;
  eyes: SVGGElement;
  glints: SVGGElement;
  lid: SVGGElement;
  lidCut: SVGRectElement;
  happy: SVGGElement;
  layered: Array<{ el: SVGGElement; kind: "hand" | "prop"; name: string; behind: boolean }>;
}

function findParts(svg: SVGSVGElement): Parts {
  const one = (part: string) => svg.querySelector<SVGGElement>(`[data-part="${part}"]`)!;
  return {
    body: one("body"),
    outline: svg.querySelector<SVGPathElement>('[data-part="outline"]')!,
    blush: one("blush"),
    gaze: one("gaze"),
    eyes: one("eyes"),
    glints: one("glints"),
    lid: one("lid"),
    lidCut: svg.querySelector<SVGRectElement>('[data-part="lid-cut"]')!,
    happy: one("happy"),
    layered: Array.from(svg.querySelectorAll<SVGGElement>("[data-layer]")).map((el) => ({
      el,
      kind: el.dataset.hand ? "hand" : "prop",
      name: el.dataset.hand ?? el.dataset.prop!,
      behind: el.dataset.layer === "behind",
    })),
  };
}

/** Writes a pose into the rig's SVG (attributes only, so it can run every frame without React re-rendering). */
function applyPose(parts: Parts, pose: Pose, shape: ShapeName) {
  const [fx, fy] = SHAPES[shape].feet;
  const { lift, shift, lean, scale } = pose.body;
  parts.body.setAttribute(
    "transform",
    `translate(${f(shift)} ${f(lift)}) rotate(${f(lean)} ${fx} ${fy}) translate(${fx} ${fy}) scale(${fs(scale[0])} ${fs(scale[1])}) translate(${-fx} ${-fy})`,
  );
  if (pose.body.outline) parts.outline.setAttribute("d", pose.body.outline);
  parts.gaze.setAttribute("transform", `translate(${f(pose.eyes.look[0])} ${f(pose.eyes.look[1])})`);
  parts.gaze.style.display = pose.eyes.hidden ? "none" : "";
  parts.blush.style.opacity = f(pose.eyes.hidden ? 0 : pose.eyes.blush);
  // eyes: stretched about their lower ends (eyes.scale), then blinked about their middle
  const top = SHAPES[shape].eyesY, cy = top + 3.1, bottom = top + 6.2;
  const [sx, sy] = pose.eyes.scale;
  const stretch = sx === 1 && sy === 1 ? "" : ` translate(32 ${bottom}) scale(${fs(sx)} ${fs(sy)}) translate(-32 ${-bottom})`;
  parts.eyes.setAttribute("transform", `translate(0 ${cy}) scale(1 ${fs(pose.eyes.open)}) translate(0 ${-cy})${stretch}`);
  parts.glints.setAttribute("transform", `translate(${f(pose.eyes.glint[0])} ${f(pose.eyes.glint[1])})`);
  // the lid cuts the eyes flat from the top, in the gaze's space, so it doesn't blink or stretch with them
  if (pose.eyes.lid > 0) {
    parts.lidCut.setAttribute("y", f(top + 6.2 * pose.eyes.lid));
    parts.lid.setAttribute("clip-path", `url(#${parts.lidCut.parentElement!.id})`);
  } else parts.lid.removeAttribute("clip-path");
  parts.eyes.style.display = pose.eyes.happy ? "none" : "";
  parts.happy.style.display = pose.eyes.happy ? "" : "none";
  for (const p of parts.layered) {
    if (p.kind === "hand") {
      const h = pose.hands[p.name as HandName];
      p.el.style.display = h.behind === p.behind ? "" : "none";
      p.el.setAttribute("transform", `translate(${f(h.at[0])} ${f(h.at[1])})`);
    } else {
      const pr = pose.props[p.name];
      const on = !!pr && pr.visible && pr.behind === p.behind;
      p.el.style.display = on ? "" : "none";
      if (pr) {
        p.el.setAttribute("transform", `translate(${f(pr.at[0])} ${f(pr.at[1])}) rotate(${f(pr.rotate)}) scale(${f(pr.scale)})`);
        p.el.style.opacity = pr.opacity < 1 ? f(Math.max(0, pr.opacity)) : "";
      }
    }
  }
}

const IDLE: AgentAnimation = { duration: 1000 };

/**
 * An agent from the Upmade family: one of the body shapes in one of the colours, with eyes and two hands, playing
 * a declarative animation. Plays only while on screen; shows `animation.rest` still with reduced motion.
 */
/** How strongly a hop moves the agent: factors for its height, tilt and squash (1 = as rolled). */
export interface HopStyle {
  lift?: number;
  lean?: number;
  squash?: number;
}

export default function Agent({
  shape = "squircle",
  colour = "pink",
  animation = IDLE,
  items = {},
  onEvent,
  time,
  paused = false,
  reactive = true,
  followPointer = false,
  label,
  className,
  style,
}: AgentProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  const gradient = `agent-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const spec = SHAPES[shape];
  const [light, base] = COLOURS[colour];
  const propNames = Object.keys(animation.props ?? {});
  // scene props are drawn outside the body, so its moves and hops don't carry them
  const inScene = (n: string) => animation.props?.[n]?.attach === "scene";
  // compared by value, so an inline `reactive={{ lean: 0 }}` doesn't restart the animation on every render
  const hopKey = typeof reactive === "object" ? JSON.stringify(reactive) : String(reactive);

  useEffect(() => {
    const hopStyle: HopStyle = typeof reactive === "object" ? reactive : {};
    const svg = svgRef.current;
    if (!svg) return;
    const parts = findParts(svg);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const still = time !== undefined || paused || reduce;

    // the eyes ease towards the pointer while it moves nearby, and back to the animation's own gaze when it rests
    const gaze = { x: 0, y: 0, tx: 0, ty: 0, last: -1e9 };
    const onPointer = (e: PointerEvent) => {
      const r = svg.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), reach = 240;
      gaze.tx = Math.max(-1, Math.min(1, dx / reach)) * 2.2;
      gaze.ty = Math.max(-1, Math.min(1, dy / reach)) * 1.6;
      gaze.last = performance.now();
    };
    const follow = followPointer && !reduce;
    if (follow) window.addEventListener("pointermove", onPointer, { passive: true });

    // a hop plays on top of whatever the animation is doing
    let hop: { hop: Hop; start: number } | null = null;
    const show = (t: number) => {
      const pose = poseAt(animation, t, shape);
      if (follow) {
        const resting = performance.now() - gaze.last > 2500;
        gaze.x += ((resting ? 0 : gaze.tx) - gaze.x) * 0.18;
        gaze.y += ((resting ? 0 : gaze.ty) - gaze.y) * 0.18;
        pose.eyes.look = [pose.eyes.look[0] + gaze.x, pose.eyes.look[1] + gaze.y];
      }
      const h = hop && hopAt(hop.hop, performance.now() - hop.start);
      if (h) {
        const k = { lift: hopStyle.lift ?? 1, lean: hopStyle.lean ?? 1, squash: hopStyle.squash ?? 1 };
        // a frame zooms the drawing by 1 / scale, so the hop is made smaller by as much to come out the same height
        pose.body.lift += h.lift * k.lift * (animation.frame?.scale ?? 1);
        pose.body.lean += h.lean * k.lean;
        pose.body.scale = [pose.body.scale[0] * (1 + (h.scale[0] - 1) * k.squash), pose.body.scale[1] * (1 + (h.scale[1] - 1) * k.squash)];
        pose.eyes.open = Math.min(pose.eyes.open, h.open);
      } else hop = null;
      applyPose(parts, pose, shape);
    };
    let stopHop: (() => void) | undefined;
    const startHop = () => {
      if (hop) return;   // one at a time
      hop = { hop: randomHop(), start: performance.now() };
      if (still) {
        // nothing else is ticking: run frames just for the hop
        stopHop?.();
        stopHop = subscribe(() => {
          show(time ?? animation.rest ?? 0);
          if (!hop) stopHop?.();
        });
      }
    };
    const body = parts.body;
    if (reactive && !reduce) {
      body.addEventListener("pointerenter", startHop);
      body.addEventListener("click", startHop);
    }
    const unbind = () => {
      body.removeEventListener("pointerenter", startHop);
      body.removeEventListener("click", startHop);
      window.removeEventListener("pointermove", onPointer);
      stopHop?.();
    };

    if (still) {
      show(time ?? animation.rest ?? 0);
      if (!follow) return unbind;
      // a still agent still follows the pointer with its eyes
      const stopGaze = subscribe(() => show(time ?? animation.rest ?? 0));
      return () => {
        unbind();
        stopGaze();
      };
    }
    const clock = createClock(animation);
    show(0);
    let stop: (() => void) | undefined;
    const io = new IntersectionObserver((entries) => {
      stop?.();
      stop = undefined;
      // an event's state changes are committed before this frame's pose is drawn, so props that depend on them (which
      // hat is worn...) are already up to date when they appear, rather than one frame late
      if (entries.some((e) => e.isIntersecting))
        stop = subscribe((dt) => show(clock.advance(dt, (e) => flushSync(() => onEventRef.current?.(e)))));
    });
    io.observe(svg);
    return () => {
      io.disconnect();
      stop?.();
      unbind();
    };
  }, [animation, shape, time, paused, hopKey, followPointer, propNames.join()]);

  const hand = (name: HandName, layer: "behind" | "front") => (
    <g key={`${name}-${layer}`} data-hand={name} data-layer={layer} transform={`translate(${spec.hands[name][0]} ${spec.hands[name][1]})`}>
      <circle r={4.6} fill={`url(#${gradient})`} stroke={INK} strokeWidth={STROKE.hand} />
    </g>
  );
  const prop = (name: string, layer: "behind" | "front") => (
    <g key={`${name}-${layer}`} data-prop={name} data-layer={layer} style={{ display: "none" }}>
      {items[name]}
    </g>
  );
  const y = spec.eyesY;
  // the drawing at its frame's scale, zoomed about the box's middle with its ground on the shape's feet
  const fr = animation.frame;
  const viewBox = fr
    ? [32 - 32 * fr.scale, fr.ground - spec.feet[1] * fr.scale, 64 * fr.scale, 64 * fr.scale].map((n) => +n.toFixed(4)).join(" ")
    : "0 0 64 64";

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox}
      className={className}
      style={{ overflow: "visible", ...style }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <clipPath id={`${gradient}-lid`} clipPathUnits="userSpaceOnUse">
          <rect data-part="lid-cut" x={-64} y={-64} width={192} height={192} />
        </clipPath>
        <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset=".65" stopColor={base} />
        </linearGradient>
      </defs>
      {propNames.filter(inScene).map((n) => prop(n, "behind"))}
      <g data-part="body">
        {propNames.filter((n) => !inScene(n)).map((n) => prop(n, "behind"))}
        {HANDS.map((h) => hand(h, "behind"))}
        <path data-part="outline" d={spec.d} fill={`url(#${gradient})`} stroke={INK} strokeWidth={STROKE.body} strokeLinejoin="round" />
        <g data-part="blush" style={{ opacity: 0 }}>
          <ellipse cx={20.6} cy={y + 9} rx={3.6} ry={2.1} fill="#FF7E9F" />
          <ellipse cx={43.4} cy={y + 9} rx={3.6} ry={2.1} fill="#FF7E9F" />
        </g>
        {/* data-part="gaze", not data-look: the landing pages' pointer-following eyes script drives every [data-look] */}
        <g data-part="gaze">
          <g data-part="lid">
            <g data-part="eyes">
              <rect x={24.55} y={y} width={4.3} height={6.2} rx={2.15} fill={INK} />
              <rect x={35.15} y={y} width={4.3} height={6.2} rx={2.15} fill={INK} />
              <g data-part="glints">
                <circle cx={27.2} cy={y + 1.7} r={1} fill="#FFFFFF" />
                <circle cx={37.8} cy={y + 1.7} r={1} fill="#FFFFFF" />
              </g>
            </g>
          </g>
          <g data-part="happy" style={{ display: "none" }}>
            <path d={`M23.7 ${y + 4.3}q3 -4.5 6 0M34.3 ${y + 4.3}q3 -4.5 6 0`} fill="none" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
          </g>
        </g>
        {propNames.filter((n) => !inScene(n)).map((n) => prop(n, "front"))}
        {HANDS.map((h) => hand(h, "front"))}
      </g>
      {propNames.filter(inScene).map((n) => prop(n, "front"))}
    </svg>
  );
}
