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
  /** hops (a different random hop each time) when the pointer comes onto it or it is clicked; on by default */
  reactive?: boolean;
  /** describes the agent to screen readers; without it the agent is decorative */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

const HANDS: HandName[] = ["L", "R"];
const f = (n: number) => n.toFixed(2);

interface Parts {
  body: SVGGElement;
  gaze: SVGGElement;
  eyes: SVGGElement;
  happy: SVGGElement;
  layered: Array<{ el: SVGGElement; kind: "hand" | "prop"; name: string; behind: boolean }>;
}

function findParts(svg: SVGSVGElement): Parts {
  const one = (part: string) => svg.querySelector<SVGGElement>(`[data-part="${part}"]`)!;
  return {
    body: one("body"),
    gaze: one("gaze"),
    eyes: one("eyes"),
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
  const { lift, lean, scale } = pose.body;
  parts.body.setAttribute(
    "transform",
    `translate(0 ${f(lift)}) rotate(${f(lean)} ${fx} ${fy}) translate(${fx} ${fy}) scale(${f(scale[0])} ${f(scale[1])}) translate(${-fx} ${-fy})`,
  );
  parts.gaze.setAttribute("transform", `translate(${f(pose.eyes.look[0])} ${f(pose.eyes.look[1])})`);
  const cy = SHAPES[shape].eyesY + 3.1;
  parts.eyes.setAttribute("transform", `translate(0 ${cy}) scale(1 ${f(pose.eyes.open)}) translate(0 ${-cy})`);
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
      if (pr) p.el.setAttribute("transform", `translate(${f(pr.at[0])} ${f(pr.at[1])}) rotate(${f(pr.rotate)}) scale(${f(pr.scale)})`);
    }
  }
}

const IDLE: AgentAnimation = { duration: 1000 };

/**
 * An agent from the Upmade family: one of the body shapes in one of the colours, with eyes and two hands, playing
 * a declarative animation. Plays only while on screen; shows `animation.rest` still with reduced motion.
 */
export default function Agent({
  shape = "squircle",
  colour = "pink",
  animation = IDLE,
  items = {},
  onEvent,
  time,
  paused = false,
  reactive = true,
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

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const parts = findParts(svg);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const still = time !== undefined || paused || reduce;

    // a hop plays on top of whatever the animation is doing
    let hop: { hop: Hop; start: number } | null = null;
    const show = (t: number) => {
      const pose = poseAt(animation, t, shape);
      const h = hop && hopAt(hop.hop, performance.now() - hop.start);
      if (h) {
        pose.body.lift += h.lift;
        pose.body.lean += h.lean;
        pose.body.scale = [pose.body.scale[0] * h.scale[0], pose.body.scale[1] * h.scale[1]];
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
      stopHop?.();
    };

    if (still) {
      show(time ?? animation.rest ?? 0);
      return unbind;
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
  }, [animation, shape, time, paused, reactive, propNames.join()]);

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

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 64 64"
      className={className}
      style={{ overflow: "visible", ...style }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset=".65" stopColor={base} />
        </linearGradient>
      </defs>
      <g data-part="body">
        {propNames.map((n) => prop(n, "behind"))}
        {HANDS.map((h) => hand(h, "behind"))}
        <path d={spec.d} fill={`url(#${gradient})`} stroke={INK} strokeWidth={STROKE.body} strokeLinejoin="round" />
        {/* data-part="gaze", not data-look: the landing pages' pointer-following eyes script drives every [data-look] */}
        <g data-part="gaze">
          <g data-part="eyes">
            <rect x={24.55} y={y} width={4.3} height={6.2} rx={2.15} fill={INK} />
            <rect x={35.15} y={y} width={4.3} height={6.2} rx={2.15} fill={INK} />
            <circle cx={27.2} cy={y + 1.7} r={1} fill="#FFFFFF" />
            <circle cx={37.8} cy={y + 1.7} r={1} fill="#FFFFFF" />
          </g>
          <g data-part="happy" style={{ display: "none" }}>
            <path d={`M23.7 ${y + 4.3}q3 -4.5 6 0M34.3 ${y + 4.3}q3 -4.5 6 0`} fill="none" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
          </g>
        </g>
        {propNames.map((n) => prop(n, "front"))}
        {HANDS.map((h) => hand(h, "front"))}
      </g>
    </svg>
  );
}
