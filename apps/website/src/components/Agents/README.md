# Agents

The Upmade agent family (body shapes × colours, with eyes and two hands) and their animations, as reusable React
components. Preview them all at `/agent`.

```tsx
import { Agent, Hat, hatSwap } from "@site/src/components/Agents";

<Agent shape="squircle" colour="violet" animation={hatSwap}
       items={{ worn: <Hat kind="topHat" />, held: <Hat kind="cap" /> }}
       onEvent={(e) => e === "putOn" && nextTheme()} />
```

## How it fits together

| File | What it does |
| --- | --- |
| `types.ts` | The animation format: keyframe tracks for the body, eyes, hands and props, spans, events |
| `tokens.ts` | Ink, strokes, the colours and the body shapes (outline, feet, eyes, head and hand spots) |
| `timeline.ts` | Pure functions: `sample()`, `poseAt(animation, t, shape)`, `eventsBetween()`, `validate()` |
| `runtime.ts` | One shared `requestAnimationFrame` loop for every agent, and a looping clock that reports events |
| `Agent.tsx` | Draws the rig once and writes each frame's pose into it (no React re-render per frame); plays only while on screen; holds `animation.rest` with reduced motion |
| `reactions.ts` | Random hops (single, double or a mid-air wiggle, each with its own height, speed, tilt and squash) that `<Agent>` plays on top of its animation when hovered or clicked; turn them off with `reactive={false}` |
| `props/` | Things agents handle (`Hat`, `Bouquet`, and one folder per ported landing-page agent), drawn around (0 0) in the same style |
| `animations/` | The animations, as data, including the ports of every agent on the landing pages |
| `demos/` | One file per entry on `/agent`; the page picks them up automatically (`/agent?only=<key>` shows one) |

## Adding an animation

1. Create `animations/myThing.ts` exporting an `AgentAnimation`. Times are in ms within `duration`; positions are in
   the agent's 64×64 drawing space (the feet sit near y 49.5). Only list what moves: hands rest at the shape's spots,
   eyes look ahead, the body stands still.
2. Props move with a hand (`attach: "R"`), on the head (`attach: "head"`) or freely (`attach: "world"`). To put a
   hand or a prop behind the body, give it `behind` spans, and switch layers only while it is clear of the body
   (above the head or out to the side), or it will visibly pop through.
3. Blinks are times (`blinks: [700, 3900]`) or blinks of their own shape
   (`{ at: 1200, close: 100, hold: 300, open: 160, depth: .42 }` is a slow squint); `eyes.blink` sets the shape for
   the plain times. `body.shift` moves the whole agent sideways (a shake, a step, or a fixed placement), as `lift`
   does vertically.
4. Fire `events` at the moments the page should react to, and handle them with `onEvent`.
5. Export it from `animations/index.ts` (every export there is checked by `tests/agents.spec.ts`) and add a
   `demos/myThing.tsx` exporting `label` and a default component; `/agent` lists it automatically. To inspect one moment, pass `time={ms}` to `<Agent>`; it then shows that moment still.
