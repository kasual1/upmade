# LandingPage: config-driven landing pages

A landing page is a typed, JSX-free config object (`src/content/landing/*.ts`) rendered by `<LandingPage config={…}/>`.
The "/" page is `src/content/landing/infinite.ts`, rendered by `src/pages/index.tsx` (until the cutover, M9, it was
previewed at `/landing-next/`). The plan is `landing-overhaul-plan.md` at the repo root.

## Layout

```
LandingPage.tsx       HtmlClassNameProvider + LandingPageContext + Layout + Head (meta, JSON-LD) + <main data-lp-page>
SectionRenderer.tsx   renders visible sections in order, each inside a SectionErrorBoundary
registry.ts           SECTIONS: section type → component (`satisfies`: a missing type fails the typecheck)
types.ts              the config types (LinkRef, Cta, AgentRef, the section types, LandingPageConfig)
context.tsx           LandingPageContext; useLandingPage() is null outside landing pages (theme/Footer reads it)
validate.ts           validateLandingConfig(cfg, ctx?): string[] (tests + a dev-only console warning)
links.ts              pure resolveLink(LinkRef, ctx); components use hooks/useResolveLink
seo.ts                buildFaqJsonLd, buildSoftwareAppJsonLd, jsonLdText
tokens.css            --lp-* design tokens on html.landing-page, plus resets inside [data-lp-page] (customCss)
breakpoints.ts        BP = { stack: 960, nowrap: 700, phone: 620 } (mirrors tokens.css)
agents.ts             agent key → the existing /agent demo + label, reach, composite, clientOnly (M2)
hooks/                usePreferredDocsPath, useHeroNavObserver, useTimeline, useReducedMotion, useInView,
                      useSectionSignal, useResolveLink
primitives/           AgentSlot, SectionShell, SectionIntro, Button, LinkTo, MediaFrame, ScaledStage, CornerAgent,
                      SegmentedToggle, Toolbar
sections/             Hero, FeatureGrid, Showcase, Faq
media/                manifest.ts (props types, listens, frame), registry.ts (MEDIA), DomCanvas, CodeTyper, StarBoard
chrome/LandingFooter  the design footer (rendered by theme/Footer from M8)
```

Rules: one CSS module per component (`styles.module.css`), tokens only (no hex in modules or TSX; data such as
framework colours lives in content files). Everything renders on the server; browser APIs only in effects. Mono text
uses `data-font="mono"` on the element that holds the text (the global Inter rule skips only elements with the
attribute, not their children). `src/components/Agents/` is read-only for this work (plan §0): agents are used by key
through `agents.ts` and `primitives/AgentSlot`.

Pure modules (`types.ts`, `links.ts`, `seo.ts`, `validate.ts`, `agents.ts`, `media/manifest.ts`, `breakpoints.ts`,
the content files) must not import `@docusaurus/*` or `@site/*`: the vitest specs import them directly.

## Editing a page

- **Reorder** sections: move their objects in `sections`.
- **Hide** a section: `hidden: true` (it is not rendered; its ids still count as taken).
- **Edit** copy: in `infinite.ts`, or the shared blocks `features.ts`, `faq.ts`, `frameworks.ts`. URLs and repo names
  come from `src/components/Brand/links.ts`.
- **Add a section of an existing type** (e.g. a fourth showcase):
  1. Add a config object with a unique slug `id` (element ids derive from it: `${id}-heading`, `${id}-q-${i}`, …).
  2. If it needs new media: create `media/<Name>/` (index.tsx + styles.module.css), add its props to `MediaPropsMap`
     and its entry (`listens`, `frame`) in `media/manifest.ts`, then one line in `MEDIA` (media/registry.ts).
  3. Reference agents by `AgentKey` (`agents.ts`).
  4. Run `../../node_modules/.bin/tsc -p .` (or `npm run typecheck` once fixed) and `npm test`.

Links in a config are `LinkRef`s: `{ kind: "docs", path? }` (the visitor's preferred framework; the quick start
without a path), `{ kind: "app", path? }`, `{ kind: "route", to }` (baseUrl-aware), `{ kind: "external", href }`.

## Adding a section type

1. Add an interface to `SectionConfig` in `types.ts`.
2. Create `sections/<Name>/index.tsx` + `styles.module.css` from the primitives and tokens. Wrap it in `SectionShell`
   (`<section aria-labelledby="${id}-heading">`) with an h2 of id `${id}-heading`.
3. Add one line to `SECTIONS` in `registry.ts`; the typecheck fails until you do.
4. Add validation rules to `validate.ts` (e.g. the ids it derives, in `derivedIds`) and a case to
   `tests/landing-config.spec.ts`.
5. Add a Playwright check/screenshot in `_e2e/`.

## Checks

- `tests/landing-config.spec.ts`: every page config passes `validateLandingConfig` (unique section and derived ids,
  exactly one visible hero, registered agent and media keys, docs pages that exist for react, vue and angular), and
  each rule has a failing fixture.
- `tests/landing-utils.spec.ts`: `buildFaqJsonLd`, `buildSoftwareAppJsonLd`, `resolveLink`.
- `tests/landing-agents.spec.ts`: every agent key is a real /agent demo; AgentSlot's server output.
- `_e2e/landing.e2e.ts`: "/" loads without errors, server-rendered structure, no horizontal overflow, FAQ and toolbar
  keyboard flows, navbar after the hero, media frames under a minimum font size, in the sitemap. `_e2e/home-baseline`
  screenshots "/" (update on purpose with `npm run e2e:website:update -- home-baseline`).
- `tests/landing-output.spec.ts` (`npm run test:landing`, after `npm run build`): "/" in the built HTML (one h1, every
  FAQ answer, unique ids, meta and JSON-LD, the toggle, one footer; no /landing-next/ left).

## File ownership for the parallel milestones

Each milestone works only in its own folders. The shared files (`types.ts`, `registry.ts`, `media/manifest.ts`,
`media/registry.ts`, `content/landing/infinite.ts`, `tokens.css`) were finalized in M3; change them only when there
is no other way, and say so in the milestone's report.

| Milestone | Owns |
|---|---|
| M4 | `sections/FeatureGrid/*` |
| M5 | `sections/Faq/*` |
| M6a | `media/StarBoard/*` |
| M6b | `media/DomCanvas/*` (port `Landing/Calculator.tsx` + `calculator-state.ts` here, with its spec; leave re-export shims in `Landing/`) |
| M6c | `media/CodeTyper/*` |
| M6 (shared; M6a/b/c coordinate) | `sections/Showcase/*` |
| M7 | `sections/Hero/*`, `primitives/Toolbar/*` |
| M8 | `chrome/LandingFooter/*`, `src/theme/Footer/*`, `footer.links` in `docusaurus.config.ts` |

Primitives other than the Toolbar (`SectionShell`, `SectionIntro`, `Button`, `LinkTo`, `MediaFrame`, `ScaledStage`,
`CornerAgent`, `SegmentedToggle`, `AgentSlot`) are shared: fix bugs there in place, but keep their props compatible.

## Hook points (plan §0)

The /agent demos do not forward events yet, so nothing is wired between agents and media: each media runs on its own
clock (the code typer uses the sign's documented 6170/6824/9348 ms turns; the star board drifts at a steady speed; the
toolbar starts on "cursor" and a click only selects). `useSectionSignal` (Showcase passes `subscribe` to its media),
`media/manifest.ts` `listens`, `agents.ts` `AGENT_EVENTS` and `AgentSlot`'s `onEvent` stay, so wiring the final agents
(M11) is an adapter change, not a rewrite.
