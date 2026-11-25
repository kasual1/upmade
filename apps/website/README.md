# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Landing pages

`/` and `/agentic` are config-driven: their sections, copy and meta live in `src/content/landing/infinite.ts` and
`src/content/landing/agentic.ts`, rendered by the kit in `src/components/LandingPage` (see its README for how to add,
reorder or hide a section). The animated agents come from `src/components/Agents` (previewed at `/agent`). The plan
behind it is `landing-overhaul-plan.md` at the repo root. Checks: `npm test`, `npm run test:landing` (after a build)
and `npm run e2e:website`.

## Blog navigation

Blog listings show the linked Upmade logo and name in a flat top header. Entries
use the full content width and align with the logo's left edge, without a post-list
sidebar. Listing thumbnails reuse the hero's white image-card frame and shadow.
Both blog layouts use a centered, 1080px maximum-width container with extra
desktop side gutters, keeping the header and content left edges aligned.
Individual posts have no left sidebar. Their flat header replaces the logo with
a back arrow linking to the blog overview. The thumbnail and article use the
left content area, with a sticky table of contents on the right on desktop.
The header scrolls away with the page. Blog pages have no top navigation
links, GitHub icon, mobile menu, or floating navbar. Navigation on other pages is
unchanged.
The right-hand table of contents on individual posts uses a 2rem top offset.
Blog listings and individual posts leave extra responsive space below the content
and reuse the landing page's stylized UPMADE wordmark immediately above the footer.

## Installation

The website's default and link cursors use 24px SVG assets in `static/img/cursor-*.svg`,
matching the engine's white-filled, black-outline arrow and hand. Hotspots match
`UpmadeCursorHelper`: 4,4 for the arrow and 12,12 for the hand. Text fields and
disabled controls keep semantic cursors; embedded demo frames manage their own cursors.

```bash
yarn
```

## Local Development

```bash
yarn start
```

From the repository root, you can also run `npm run docs:start`.
On Windows, development uses Webpack to avoid the Rspack 1.7.12
`cssExtractHmr.js` module-graph panic. CSS hot reload remains enabled.
Production builds and development on other platforms still use Rspack;
the other Docusaurus v4 and faster options remain enabled.

To point LiveDemo previews to a local demo app while running docs locally, set `DEMO_BASE_URL` before starting:

```powershell
$env:DEMO_BASE_URL_ANGULAR="http://localhost:4200"
$env:DEMO_BASE_URL_REACT="http://localhost:5173"
$env:DEMO_BASE_URL_VUE="http://localhost:5174"
yarn start
```

If these are not set, defaults are chosen by environment:

- Development (`yarn start`): Angular `http://localhost:4200`, React `http://localhost:5173`, Vue `http://localhost:5174`
- Production build (`yarn build`): `https://kasual1.github.io/upmade/{angular|react|vue}`

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Blog thumbnails

Every blog post gets a generated thumbnail (a blurred, squeegee-style painting rendered in resolution steps of dithered pixels). `npm run thumbnails` renders `static/img/blog/<slug>.png` for each post and adds `image: /img/blog/<slug>.png` to its front matter, which Docusaurus uses as the post's `og:image`. It also runs automatically before `npm run build`.

Each image is fully determined by its seed, an arbitrary string of up to 32 characters (`5b1192ef`, `hello upmade`, …). Eight hex digits are used as the seed number directly, any other text is hashed; the seed also picks the color family (Angular, React or Vue). The seed is printed in the image's bottom right corner and stored in the post's `thumbnailSeed` front matter; posts without one get a stable hex seed from their slug. Edit `thumbnailSeed` to re-roll a thumbnail: the PNG stores its seed, so the next run re-renders it. `--force` regenerates everything and `--slug <slug>` targets one post. Commit the generated PNGs.

`npm run thumbnails -- --seed 5b1192ef --scale 4` renders any seed on its own (here at 4800×2520); `--seed random` picks a fresh one. The generator core (`scripts/thumbnails/lib.mjs`, `palettes.mjs`, `painting.mjs`) has no Node dependencies and renders the same picture at every scale, so it can also run in the browser; `render.mjs` adds PNG output via resvg. The label is drawn with system fonts, so generate thumbnails on a machine with Inter or Segoe UI installed.

## LLM Documentation

Production builds publish `/llms.txt` and Markdown versions of all public Angular, React, and Vue documentation, for example `/docs/react/getting-started/quick-start.md`. A combined `llms-full.txt` is intentionally not generated. The plugin owns these files; do not add a competing static index or commit build output.

The index introduction and plugin options live in [docusaurus.config.ts](docusaurus.config.ts). Detailed content comes from the existing documentation sources. Update those sources normally, then rebuild. `LiveDemo` tags retain their repository, source-file, and demo-route metadata; the exporter does not execute components or download demo code.

Run these commands from the repository root:

```bash
npm run test -w apps/website
npm run build -w apps/website
npm run test:llms -w apps/website
npm run serve -w apps/website -- --port 3001
```

Choose another port if 3001 is occupied. Fetch `http://localhost:3001/llms.txt` and a framework Markdown URL to inspect production output. The development server does not generate these files.

Use `npm run build`, not a direct `docusaurus build` invocation: the npm `postbuild` step verifies the index and normalizes root-relative links in Markdown exports for subpath deployments. It uses parsed link positions to leave code samples and `LiveDemo` metadata intact. A missing index or missing linked Markdown file fails this step.

The build-output contracts require an existing production build and are separate from the source-only `test` and `test:watch` commands. They check the Docusaurus document inventory, index ordering, preserved examples, local link targets, and discovery metadata. CI checks both `/` and `/preview/`; deployment runs these contracts before uploading the build artifact.

To check a subpath deployment locally in PowerShell, set the same base URL for both build and validation:

```powershell
$previousBaseUrl = $env:Docusaurus_BASE_URL
try {
	$env:Docusaurus_BASE_URL = '/preview/'
	npm run build -w apps/website
	if ($LASTEXITCODE -ne 0) { throw 'Website build failed' }
	npm run test:llms -w apps/website
	if ($LASTEXITCODE -ne 0) { throw 'LLM output validation failed' }
} finally {
	$env:Docusaurus_BASE_URL = $previousBaseUrl
}
```

Rebuild with the default base URL before returning to root-path production previews. Keep `Docusaurus_BASE_URL` consistent when serving a subpath build.

## Deployment

Using SSH:

```bash
USE_SSH=true yarn deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
