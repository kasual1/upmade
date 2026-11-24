# Plan: rebuild `/` to the "Infinite landing page" design with sections set by config

**Basis.** I took Plan 3's architecture: a typed config, an exhaustive registry, a context-driven footer, the sign as the clock for the code snippet, and a narrow change to the global font rule. From Plan 1 I took the section-local event signal and the ScaledStage approach. From Plan 2 I took the per-media-key mapped types. I checked the disputed points against the code:

- The sign can be the clock. The header of `animations/frameworkSign.ts` says its 22342 ms loop is React 6170 + Vue 6824 + Angular 9348 ms, and that each flip starts 500 ms before the next framework's turn.
- Plan 2's `_landing-next.tsx` would not be routed, because Docusaurus skips `_`-prefixed pages. The preview must be `landing-next.tsx`.
- The docs links exist. `advanced/dynamic-objects` and `examples/performance-showcase` are there for react, vue and angular.
- Playwright is installed only at the repo root (`@playwright/test`), and `apps/website` has no Playwright config yet.

Paths are relative to `apps/website`.

## 1. Goals and non-goals

**Goals**

- `/` matches the artifact. Port the last CSS rule that wins for each selector. Skip the dead CSS/JS: the draggable objects, `.install`, `.feature-icon`.
- A page is a typed, JSX-free config. Adding, reordering or hiding a section means editing one data file.
- The page works on phones and in in-app browsers that enforce a minimum font size.
- Everything is rendered on the server (copy, h1, FAQ answers) and accessible. Agents only animate while on screen.
- `/agentic`, the docs, the blog and the sitewide chrome do not change at any milestone.

**Non-goals (this effort)**

- Dark mode. The page is forced light, but every colour is a token so a dark set can be added later.
- Redesigning `/agentic`. It moves onto the same renderer only after cutover.
- The toolbar's full "stow the tool / finish the arrow at 4x" choreography. Version 1 jumps straight to the clicked tool.
- The InstallCommand chip, the typewriter title and the Caveat font on `/`. The design does not use them.

## 2. Section inventory

| # | Artifact section (lines) | Section type | Agents (registry key) | Data / content source | Reused vs new |
|---|---|---|---|---|---|
| 0 | Announcement bar (L396) | sitewide chrome, not a section | – | RenameBanner | Reuse. Optional restyle, done in its own PR |
| 1 | Header (L398–402) | part of hero | idle (BrandLogo 38px) | `hero.nav` in config, `Brand/links.ts` | New BrandLogo. Reuse MenuButton and the navbar contract |
| 2 | Hero (L403–425) | `hero` | toolCycle | `content/landing/infinite.ts` | New Toolbar primitive. Reuse the icons in `tools.tsx`. New `Agent.seek` |
| 3 | Features (L427–437) | `featureGrid` | key, handoff, shapeShift, controlPanel, devices, book | `content/landing/features.ts` | New section. Agents reused as they are |
| 4 | DOM based canvas (L439–459) | `showcase` + media `domCanvas` | corner juggler (bottom-left) | `infinite.ts` | Port DomCanvasDemo, Calculator and calculator-state into the art style |
| 5 | Easy to get started (L461–474) | `showcase` (reversed) + media `codeTyper` | corner frameworkSign (bottom-right), which is the clock | `content/landing/frameworks.ts` | Port CodeWindow, highlight and CODE_FRAMEWORKS from `Sections.tsx` |
| 6 | Optimized for performance (L476–503) | `showcase` + media `starBoard` | corner cyclingGlasses (bottom-left) | `infinite.ts`, `REPO_URL` | Port PerformanceDemo. Speed driven by glassesOn/glassesOff |
| 7 | FAQ (L505–515) | `faq` (+ FAQPage JSON-LD) | – | `content/landing/faq.ts` | New. The behaviour matches today's Faq |
| 8 | Footer (L517–524) | page chrome, `footer: "landing"` | idle (BrandLogo 52px) | `themeConfig.footer.links` + config tagline/meta | New LandingFooter, rendered by the swizzled `theme/Footer` |

- The design has no separate CTA section. CallToActionBar and the Wordmark section are dropped from `/`. The Wordmark stays in the blog footer.
- About "hero canvas": in the live design the hero has no draggable canvas. The only canvas-like content there is the toolCycle agent and the toolbar. The old canvas (DraggableCanvasItem, the getBBox layout effect, wet-grass, the hello drawing) is not ported.

## 3. Architecture

### 3.1 Folder layout

```
src/
  pages/index.tsx                      # stays (redirects.spec routeSource('/')): <LandingPage config={infinitePage}/>
  pages/landing-next.tsx               # temporary preview, noindex + sitemap ignorePatterns, deleted at cutover
  content/landing/
    infinite.ts                        # "/" page: meta + section order (the file you edit)
    features.ts  faq.ts  frameworks.ts # copy blocks, reusable by agentic.ts later
  components/
    Brand/                             # sitewide assets moved out of Landing (Landing/* re-exports until cleanup)
      paths.ts  Icon.tsx  Wordmark.tsx  BrandLogo.tsx  links.ts (REPO_URL, SKILL_REPO, social)
    LandingPage/
      LandingPage.tsx                  # HtmlClassNameProvider + LandingPageContext + Layout + Head + <main>
      registry.ts  SectionRenderer.tsx  context.tsx
      types.ts                         # config types (3.2)
      validate.ts                      # pure validateLandingConfig(cfg): string[]  (used by tests + dev warning)
      links.ts                         # LinkRef + useResolveLink (docs→preferred fw, app→useAppUrl, route→baseUrl)
      seo.ts                           # buildFaqJsonLd, buildSoftwareAppJsonLd
      tokens.css                       # --lp-* tokens scoped to html.landing-page (customCss)
      primitives/  SectionShell, SectionIntro, Button, MediaFrame, ScaledStage, CornerAgent, Toolbar, SegmentedToggle
      sections/    Hero/  FeatureGrid/  Showcase/  Faq/            (index.tsx + .module.css each)
      chrome/      LandingFooter/
      media/       registry.ts  DomCanvas/  CodeTyper/  StarBoard/
      hooks/       usePreferredDocsPath, useReducedMotion (reactive), useInView (shared IO),
                   useTimeline (replaces 3 run/at copies), useHeroNavObserver, useSectionSignal
    Agents/
      registry.ts  AgentSlot.tsx  demos/types.ts (widened)
```

### 3.2 Config types (`LandingPage/types.ts`)

```ts
import type { AgentKey } from "@site/src/components/Agents/registry";
import type { MediaKey, MediaPropsMap } from "./media/registry";
import type { ToolKey } from "./primitives/Toolbar";

export type LinkRef =
  | { kind: "docs"; path?: string }      // → /docs/<preferred framework>/<path>
  | { kind: "app"; path?: string }       // useAppUrl()
  | { kind: "route"; to: string }        // baseUrl-aware
  | { kind: "external"; href: string };
export interface Cta { label: string; link: LinkRef; variant?: "dark" | "light"; newTab?: boolean }
export interface AgentRef { key: AgentKey; label?: string }   // no label ⇒ aria-hidden

interface Base<T extends string> { type: T; id: string; hidden?: boolean }  // id ⇒ `${id}-heading`, `${id}-q-${i}`

export interface HeroSection extends Base<"hero"> {
  nav: { links: { label: string; link: LinkRef; hideBelow?: 620 }[]; github: LinkRef };
  toggle?: { label: string; link: LinkRef; current?: boolean }[];
  title: string; subtitle: string;
  agent: AgentRef & { key: "toolCycle" };
  toolbar?: { tools: readonly ToolKey[]; syncWithAgent: boolean };
  ctas: Cta[];
}
export interface FeatureGridSection extends Base<"featureGrid"> {
  srHeading: string; items: { title: string; body: string; agent: AgentRef }[];
}
export type ShowcaseSection = { [K in MediaKey]: Base<"showcase"> & {
  heading: string; body: string; cta?: Cta; reversed?: boolean;
  media: { key: K; props?: MediaPropsMap[K] };
  cornerAgent?: AgentRef & { corner: "bl" | "br"; size?: "s" | "m" | "l" };
} }[MediaKey];
export interface FaqSection extends Base<"faq"> {
  heading: string; intro?: string; items: { q: string; a: string }[]; jsonLd?: boolean; // `code` spans only
}
export type SectionConfig = HeroSection | FeatureGridSection | ShowcaseSection | FaqSection;

export interface LandingPageConfig {
  htmlClassName: string;                 // "landing-page" keeps the navbar.css contract
  meta: { title: string; description: string; ogImage?: string };
  footer: "landing" | "docusaurus";
  sections: readonly SectionConfig[];
}
```

Example (`content/landing/infinite.ts`, shortened):

```ts
export const infinitePage = {
  htmlClassName: "landing-page", footer: "landing",
  meta: { title: TITLE, description: DESCRIPTION, ogImage: "img/social/landing.png" },
  sections: [
    { type: "hero", id: "hero", title: "Infinite Canvas Development Kit",
      subtitle: "Easily build agentic canvas experiences with React, Vue and Angular.",
      agent: { key: "toolCycle", label: "The Upmade agent using canvas tools" },
      toolbar: { tools: ["cursor","pen","eraser","arrow","shapeRectangle","type","image"], syncWithAgent: true },
      nav: { links: [{ label: "Blog", link: { kind: "route", to: "/blog" } },
                     { label: "Documentation", link: { kind: "docs" }, hideBelow: 620 }],
             github: { kind: "external", href: REPO_URL } },
      toggle: [{ label: "Infinite", link: { kind: "route", to: "/" }, current: true },
               { label: "Agentic", link: { kind: "route", to: "/agentic" } }],
      ctas: [{ label: "Demo", link: { kind: "app" }, variant: "dark", newTab: true },
             { label: "Get started", link: { kind: "docs" }, variant: "light" }] },
    { type: "featureGrid", id: "features", srHeading: "Features", items: FEATURES },
    { type: "showcase", id: "dom-canvas", heading: "DOM based canvas", body: "…", media: { key: "domCanvas" },
      cta: { label: "Dynamic Objects", link: { kind: "docs", path: "advanced/dynamic-objects" } },
      cornerAgent: { key: "juggler", corner: "bl", size: "l" } },
    { type: "showcase", id: "get-started", reversed: true, heading: "Easy to get started", body: "…",
      media: { key: "codeTyper", props: { frameworks: CODE_FRAMEWORKS } },
      cta: { label: "Quick Start", link: { kind: "docs" } }, cornerAgent: { key: "frameworkSign", corner: "br" } },
    { type: "showcase", id: "performance", heading: "Optimized for performance", body: "…",
      media: { key: "starBoard", props: { repoUrl: REPO_URL } },
      cta: { label: "Full Demo", link: { kind: "docs", path: "examples/performance-showcase" } },
      cornerAgent: { key: "cyclingGlasses", corner: "bl", size: "s" } },
    { type: "faq", id: "faq", heading: "Frequently Asked Questions",
      intro: "Answers to common questions about adopting Upmade in production projects.", items: FAQ_ITEMS, jsonLd: true },
  ],
} as const satisfies LandingPageConfig;
```

### 3.3 Registry and renderer

```tsx
type SectionType = SectionConfig["type"];
type SectionComponent<T extends SectionType> = ComponentType<{ config: Extract<SectionConfig, { type: T }> }>;
export const SECTIONS = { hero: Hero, featureGrid: FeatureGrid, showcase: Showcase, faq: Faq }
  satisfies { [T in SectionType]: SectionComponent<T> };   // a missing entry fails `npm run typecheck`

export function SectionRenderer({ sections }: { sections: readonly SectionConfig[] }) {
  return <>{sections.filter(s => !s.hidden).map(s => {
    const C = SECTIONS[s.type] as SectionComponent<typeof s.type>;
    return <SectionErrorBoundary key={s.id} id={s.id}><C config={s as never} /></SectionErrorBoundary>;
  })}</>;
}
```

- The registry is a static map. There is no `require.context`, so it is SSR-safe and works on any bundler.
- The media registry works the same way: `MEDIA = { domCanvas, codeTyper, starBoard }`. Each entry declares `listens: readonly string[]` for the agent events it consumes.

### 3.4 Design tokens and styling

- `tokens.css` is added to `customCss` after `general.css`. Every token uses the `--lp-` prefix and is scoped to `html.landing-page`, so nothing collides with `--ifm-*` or the legacy `--landing-*` tokens. `/agentic` shares the class but never reads `--lp-*`. Contents:
  - The design tokens: ink, soft, line, paper, hand, pink, chip, chip-h, hair, blue, green, yellow, lift, float, spring, spring2.
  - Hard-coded design values promoted to tokens: divider `#EDEDEF`, panel `#F7F7F4`, the pink, key and window gradients, `#3F3F3B`, `#7A7A74`, art focus ring `#8FD0FF`, and the code palettes for light and dark backgrounds.
  - The type scale: h1 `clamp(40px,5.4vw,68px)`, h2 `clamp(32px,4vw,48px)`, 26/23, 19/18, 16.5, 13.5, 11.
  - Spacing (120/80/64), gutters `max(24px, env(safe-area-inset-*))`, content widths 1180/1400/820/640, and radii 14/16/28/22/999.
  - Values stay in px on purpose, because the site sets `html{font-size:20px}`.
- One small CSS module per section or primitive. No hex values in modules or TSX: use `currentColor` or tokens. Framework colours live in `frameworks.ts` data.
- Breakpoints are 960, 700 and 620 px. They are written as literals, documented in `tokens.css`, and mirrored in a TS `BP` object.
- Global CSS conflicts, handled with no visual change to other pages:
  - `typography.css:6` becomes `*:not(upmade-button):not([data-font])`. Mono text then uses `data-font="mono"` and needs no `!important`. Elements without the attribute keep today's behaviour.
  - `.page` resets with low specificity (`:where()`): `font-size:16px`, plus p and h1–h3 colour and size set to `inherit`.
- Fonts: keep the `@fontsource-variable` Inter and JetBrains Mono imports. The `preloadCriticalFonts` postBuild step throws without them. Variable Inter covers weights 650 and 800. Do not load Google Fonts.
- Colour scheme: `html.landing-page { color-scheme: light }`. The decision is written down in `tokens.css`.

### 3.5 Agents in sections

Widen `demos/types.ts`:

```ts
export interface DemoProps { className?: string; style?: CSSProperties; label?: string; paused?: boolean;
  reactive?: boolean; onEvent?: (e: string) => void; agentRef?: Ref<AgentHandle> }
```

- Stateful demos (toolCycle, frameworkSign, controlPanel, hatSwap) update their own state first, then call `onEvent`. All new props are optional, so `/agent` keeps working.
- `Agents/registry.ts`: `AGENTS = { toolCycle: { label, Component, events, reach, composite? }, … } satisfies Record<string, AgentEntry>`, with `AgentKey = keyof typeof AGENTS`. `/agent` iterates `AGENTS` instead of `require.context`. Each demo's `order` moves into its registry entry.
- `<AgentSlot agent onEvent agentRef className>` owns:
  - the `position:relative` box and the overflow padding taken from `reach`;
  - the SSR ready gate: `visibility:hidden` until mounted, for composites and devices, with a `<noscript>` reveal;
  - one global `[data-agent-slot] [data-part=body]{pointer-events:visiblePainted}` rule, which replaces the `<style>` tags that handoff and shapeShift inject.
- Sections refer to agents only by key and never build `items` maps. Event wiring stays inside the section, because `onEvent` runs in `flushSync`:
  - `useSectionSignal()` is a ref-based emit/subscribe with no React state.
  - Showcase passes `emit` to the corner AgentSlot and `subscribe` to the media.
  - Media react imperatively, without React renders.

| Pairing | Clock | Mechanism | Reduced-motion fallback (no events fire) |
|---|---|---|---|
| frameworkSign → codeTyper | the sign | flip → typer `startNext()` 500 ms later; the typer has no timer of its own between frameworks, so the two cannot drift | full React snippet, sign shows React |
| cyclingGlasses → starBoard | the agent | glassesOn/glassesOff → Web Animations `playbackRate` ramps to 30x, then a cubic coast (L1077–1088) | board static |
| toolCycle ↔ Toolbar | the agent | `tool:*` sets the selection (local state in Toolbar). A click calls `agentRef.seek(TOOL_START[k])` | "cursor" selected, a click only selects |

Agent runtime changes (milestone M2, each with a test):

- `useReducedMotion` becomes reactive (listens for `change`).
- One shared IntersectionObserver with `rootMargin:"200px 0px"`.
- `applyPose` skips hidden props.
- A new `AgentHandle { seek(ms) }`.
- Fix handoff so all its layers share one box or one visibility source.
- The toolCycle label becomes static, so screen readers are not flooded.
- BrandLogo look-up and wink: a `lookAt` and `wink` reaction in `reactions.ts`, gated by reduced motion. It is polish: version 1 uses the random hop.

### 3.6 Hero

Structure:

- `header.top`: BrandLogo, nav links, GitHub, and MenuButton below 620px;
- SegmentedToggle (`aria-current="page"`);
- a plain server-rendered h1 with `text-wrap:balance` (no typewriter, which is better for LCP);
- the subtitle;
- AgentSlot toolCycle;
- the Toolbar;
- the CTA Buttons.

Navbar contract: keep it unchanged. Move the IntersectionObserver in `Landing/Hero.tsx` (lines 298–322) into `useHeroNavObserver(ref)`, used by both the old and the new hero. The hook observes the hero header and toggles `landing-nav-visible` and `data-landing-nav-animated`. `data-hero-menu` and the 250 ms `SIDEBAR_CLOSE_MS` stay as they are.

Toolbar:

- `role="toolbar"`, roving tabindex, arrow keys, `aria-pressed` and an `aria-label` per tool.
- The sliding pill is placed from refs per button, never from class-name querySelectors. It is re-measured by a ResizeObserver and `document.fonts.ready`.

### 3.7 Responsiveness and the minimum font size

Layout: grids go 3/2/1 columns. Showcases stack at 960px (the media order resets). The nowrap subtitle applies only from 700px up. Agents, the toolbar and padding take phone sizes at 620px and below. There is no horizontal scroll at 320px:

- `main { overflow-x: clip }` (clip, not hidden, so the agents' vertical reach is kept);
- MediaFrame reserves a gutter, taken from the registry `reach`, on the side of its corner agent.

Minimum font size. Android WebViews (Instagram, Facebook, LinkedIn), Chrome's minimum-font-size setting and iOS text inflation all clamp small computed font sizes. The design's small type then overflows its frames: the code font clamped to 11px, cqw-sized stars, 11px badges and 12.5px keys.

- Set `html.landing-page { -webkit-text-size-adjust:100%; text-size-adjust:100% }`.
- Never shrink text with `font-size`. `<ScaledStage width={560} height={385}>` lays the content out at a fixed virtual size, with real fonts of 12px or more. A ResizeObserver sets `--k = min(1, w/560)`, and the stage applies `transform: scale(var(--k))`. The frame's height comes from `aspect-ratio`, so the measurement never feeds back into layout. DomCanvas, CodeTyper and StarBoard all use it. `cqw` stays only for geometry: the `--tilt` wipe and the `min-height`.
- Scaled chips get `white-space:nowrap; overflow:hidden` as a safety net.
- Check it in Playwright (section 5) and on real devices: Android Chrome at the largest font size, the Instagram in-app browser at 360px, and iOS Safari with large Dynamic Type.

### 3.8 Accessibility

Structure:

- One `<main>` and one h1.
- Each `<section aria-labelledby="${id}-heading">` has an h2. The features h2 is visually hidden, and feature titles are h3.
- All ids are derived from the section id, so a section type can appear twice without collisions.

FAQ:

- `h3 > button[aria-expanded][aria-controls]` with an answer region, one item open at a time.
- Answers stay in the server-rendered HTML. A closed answer uses `grid-template-rows:0fr` plus `inert`, which keeps the .35s animation. Check this with VoiceOver and find-in-page. If it fails, fall back to `hidden` with no animation.

- Slider: keep `role=slider`, arrow keys ±5, Home/End and `aria-valuetext`.
- Decorative elements: the StarBoard is `aria-hidden` with `tabIndex=-1` links. Agents are `aria-hidden` unless they have a label.
- Focus: a visible ring in `--lp-hand` on all controls.
- Contrast: `#7A7A74` at 13.5px is about 4.4:1, which is below AA. Recommend `#6E6E68` (decision 3).
- Reduced motion: every module has a `prefers-reduced-motion` block, without `!important`. Each event-driven pairing has the static state listed in 3.5.

### 3.9 Performance

- About 17 `<Agent>` instances: the hero (1), 2 logos, 6 features (11 instances, because handoff and shapeShift are composites) and 3 corners. All share one rAF loop, and only agents on screen tick. The shared observer and the hidden-prop skip from M2 bound the cost per frame. Animations are module constants, so no clock restarts.
- No `React.lazy` or `BrowserOnly`, because Suspense with SSR is a risk. Work is deferred instead: agents, timers and media start in view. three.js is not on `/`. Sections below the fold get `content-visibility:auto; contain-intrinsic-size:auto 800px`.
- Budgets per milestone:
  - the `/` JS chunk size, before and after;
  - Lighthouse mobile: LCP is the h1 text, CLS ≈ 0 (gates use `visibility` and frames use `aspect-ratio`), TBT no worse than +20%;
  - a Performance-panel check with the feature grid in view on a mid-range Android profile.

### 3.10 SSR and SEO

- Everything is server-rendered. Browser APIs are touched only in effects. `usePreferredDocsPath` renders the React docs path on the server and switches after mount, as today.
- `<Head>` is built from `config.meta`:
  - The title and og/twitter titles are set directly, as today. TitleFormatter already skips appending the site name.
  - `og:image` and `twitter:image` are absolute URLs via `useBaseUrl(…, {absolute:true})`.
  - JSON-LD: FAQPage from the faq section and SoftwareApplication from `Brand/links.ts`, built in `seo.ts`.
- Fix the missing `img/docusaurus-social-card.jpg`: add a 1200×630 card and point `themeConfig.image` at it.
- llms output is unchanged. The plugin covers docs only.

## 4. Content

Where things live:

- All copy is in `src/content/landing/*.ts`: page order and hero/showcase copy in `infinite.ts`, plus `features.ts`, `faq.ts` and `frameworks.ts`.
- URLs and the repo/skill names are in `Brand/links.ts`.
- Footer links stay in `docusaurus.config.ts` under `footer.links`, as the one source. The raw-HTML Community entries become `{label, href}` items, with a sitewide footer check.

Reorder, hide or edit a section: move, delete, set `hidden: true` on, or edit its object in `infinite.ts`. TypeScript and `validate.ts` catch mistakes.

Add a section using an existing type (for example a fourth showcase):

1. Add a config object with a unique `id`.
2. If it needs new media, add `media/<Name>/` and a `MEDIA` entry with its props type and `listens`.
3. Reference a corner agent by `AgentKey`.
4. Run `npm run typecheck && npm test`.

Add a new section type:

1. Add an interface to `SectionConfig`.
2. Create `sections/<Name>/index.tsx` and its `.module.css`, built from the primitives and tokens.
3. Add one line to `SECTIONS`. The compiler fails until you do.
4. Add validation rules and a test case.
5. Add a Playwright screenshot.

## 5. Testing and verification

| Layer | What | Where / script |
|---|---|---|
| Unit (vitest, default `npm test`) | `validateLandingConfig`: unique section ids and derived ids, exactly one hero, every AgentKey/MediaKey registered, every corner agent emits at least one event its media listens to, hero tools are a subset of the toolCycle `tool:*` events, every docs path exists in `docs/{react,vue,angular}` | `tests/landing-config.spec.ts` |
| Unit | `buildFaqJsonLd` (one entry per item, no backticks), `useResolveLink` cases, the highlight tokenizer | same and `tests/landing-utils.spec.ts` |
| Unit | Each registry entry's `events` is a subset of its `animation.events`, every entry has a `rest`, `TOOL_START` is derived correctly | extend `tests/agents.spec.ts` |
| Post-build | `build/index.html`: one h1, every FAQ answer present, no duplicate ids, og/twitter tags and the og:image file exists, FAQPage JSON-LD parses, `html.landing-page`, toggle links to `/agentic/` | `tests/landing-output.spec.ts`, new `test:landing` like `test:llms` |
| Playwright (new `apps/website/_e2e/playwright.config.ts`, webServer `docusaurus serve`) | Projects: desktop 1440, tablet 960, phone 390 and 320. For `/` (and `/landing-next/` before cutover): no pageerror or console errors, no horizontal overflow (`scrollWidth <= innerWidth`), screenshots with `reducedMotion:'reduce'`, FAQ and toolbar keyboard flows, navbar shown only after scrolling past the hero | `e2e:website` script |
| Playwright, min font | A Chromium persistent context with prefs `webkit.webprefs.minimum_font_size = 24` (to be confirmed in M0): assert each MediaFrame's children stay inside its box | same suite |
| Regression guard | Screenshots of `/agentic/`, `/blog/` and one docs page, taken as a baseline in M0 and compared at every milestone | same suite |
| Kept green | `redirects.spec.ts` (index.tsx stays, the preview route shadows no redirect), `site-urls.spec.ts`, `live-demo-contract`, `blog-videos`, `calculator-state.spec.ts` (moves with its module), `npm run typecheck`, `npm run build` (the font postBuild step must not throw) | every milestone |

## 6. Milestones

Each milestone is one PR, verified with typecheck, tests, build and Playwright.

| # | Scope | Verify | Old landing: kept / deleted |
|---|---|---|---|
| M0 | Playwright harness and baseline screenshots of `/`, `/agentic`, blog, docs. Confirm the min-font technique | suite runs green against today's site | nothing changes |
| M1 | Groundwork: `Brand/` (paths, Icon with GitHubIcon via useBaseUrl, Wordmark, links), with `Landing/*` re-exporting it as shims. Shared hooks (usePreferredDocsPath, useHeroNavObserver, useTimeline), used by both current pages. The `[data-font]` font rule. `[class*=wordmarkLetter]` becomes a real class. Remove the `console.log` in `Root.tsx` | screenshots pixel-identical | shims keep `/agentic`, RenameBanner, UpmadeBrand and Footer/Links working |
| M2 | Agent layer: widened DemoProps, `registry.ts`, AgentSlot, `/agent` iterates the registry, the runtime fixes (3.5) | `/agent` looks the same in the same order; agents.spec extended | `require.context` removed |
| M3 | Kit skeleton: `tokens.css`, primitives, types, registry, renderer, validate, LandingPage, LandingPageContext; the `/landing-next/` preview (noindex, `sitemap.ignorePatterns`) | a wrong key fails tsc; the sitemap has no preview URL; redirects.spec passes | – |
| M4 | FeatureGrid with the six agents | 3/2/1 columns; no clipping at 320/620/960; no rig flash with JS throttled | – |
| M5 | FAQ with JSON-LD | keyboard accordion; answers in the built HTML; Rich Results test | – |
| M6a/b/c | Showcases: starBoard with glasses, domCanvas with juggler, codeTyper with the sign as clock. MediaFrame, CornerAgent, ScaledStage | sign and snippet in step for 3 cycles; board speeds up; slider works by keyboard; min-font test passes; reduced motion gives static states | – |
| M7 | Hero: BrandLogo, toggle, toolCycle with Toolbar sync, seek on click, CTAs, nav observer | navbar appears only after the hero header; MenuButton works below 620px; h1 in view-source | – |
| M8 | LandingFooter via `theme/Footer` reading LandingPageContext (`footer:"landing"`); docs still null, blog keeps Wordmark; Community links converted to `{label, href}` | SSR output shows exactly one footer per page type | – |
| M9 | Cutover: `index.tsx` becomes `<LandingPage config={infinitePage}/>`; delete the preview; social card; `test:landing` | full suite; Lighthouse against the baseline; `/agentic`, blog and docs screenshots unchanged; real-device checks | old Hero, CallToActionBar and the Wordmark section are no longer used by `/` but are not deleted yet |
| M10 | `/agentic` onto the renderer (`content/landing/agentic.ts`; media frames, themes, skillTerminal) | same checks as M9 for `/agentic` | then delete: `Landing/Hero.tsx` and both DraggableCanvasItem forks, HeroTitle, ImageCard*, `Sections.tsx`, `Landing/styles.module.css`, all of `Agentic/*`, the shims, HELLO_STROKES, the wet-grass images (if unused), `static/js/hide-navbar-brand.js` (grep first). Keep moved: Calculator and calculator-state with its spec, `tools.tsx` icons, MenuButton, InstallCommand (if agentic still uses it), HeartBubbles |
| M11 | Polish: toolbar stow/arrow `request()`, BrandLogo look-up and wink, optional RenameBanner restyle (sitewide, own PR) | Playwright and screenshots | – |

How `/agentic` and the other pages are protected:

- Legacy files are not touched until M10. Moves go through re-export shims.
- Tokens use the `--lp-` prefix, and global CSS changes only affect elements that opt in.
- The footer change is chosen per page in config.
- Playwright baselines of `/agentic`, blog and docs gate every PR.

## 7. Decisions for you

1. Footer scope: should the design footer appear only on landing pages (the plan's default), or replace the Docusaurus footer sitewide?
2. Toolbar clicks at launch: is jumping straight to the clicked tool's turn acceptable, with the stow/arrow choreography in M11? Or is the full choreography needed for launch?
3. Design deviations:
   - Darken the footer meta text `#7A7A74` to about `#6E6E68` to pass AA contrast?
   - Drop the InstallCommand chip and the typewriter title from `/`, as the design does?
4. Copy and SEO: the h1 and subtitle change, and the current title is "The Infinite Canvas Development Kit". Should the `<title>` and meta description stay as they are, or follow the new copy?
5. `/agentic` migration (M10): do it in this effort, or later? Legacy code can only be deleted once it moves.
6. Social card: who supplies the 1200×630 image? A placeholder would be generated from the hero otherwise.

The design source is the "Infinite landing page" artifact: https://claude.ai/artifact/Thh6HdxgF7h1YY5Euzdmxx
