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
| `props/` | Things agents handle (`Hat`, `Bouquet`), drawn around (0 0) in the same style |
| `animations/` | The animations, as data |

## Adding an animation

1. Create `animations/myThing.ts` exporting an `AgentAnimation`. Times are in ms within `duration`; positions are in
   the agent's 64×64 drawing space (the feet sit near y 49.5). Only list what moves: hands rest at the shape's spots,
   eyes look ahead, the body stands still.
2. Props move with a hand (`attach: "R"`), on the head (`attach: "head"`) or freely (`attach: "world"`). To put a
   hand or a prop behind the body, give it `behind` spans, and switch layers only while it is clear of the body
   (above the head or out to the side), or it will visibly pop through.
3. Fire `events` at the moments the page should react to, and handle them with `onEvent`.
4. Export it from `animations/index.ts`, add it to the preview page (`src/pages/agent.tsx`) and to the data check in
   `tests/agents.spec.ts`. Pause it there and scrub through the loop to fine-tune keys.
