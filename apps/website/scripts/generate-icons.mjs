// Generates the site's icons from the pink squircle agent at rest (the logo's agent: src/components/Agents, idle), so
// they match the agent drawn in the header. Run from apps/website:
//
//   npm run icons:generate
//
// It writes, into static/:
//   img/favicon.svg        the agent large on a white rounded tile (rx 350 of 1000), so it reads at tab size
//   favicon.ico            16, 32, 48 and 64 px, rendered from favicon.svg (PNG-encoded layers)
//   img/logo.svg           the bare agent, cropped to its drawing
//   img/logo.png           the bare agent, transparent, 512 wide
//   img/logo_avatar.png    512x512 on white with room around it (also the apple-touch-icon), no alpha channel
//
// and, outside the website:
//   logo.svg (repo root)   the README badge: the agent idling (breathing, glancing about, blinking; animated in
//                          CSS from Agents/animations/idle.ts) on a white rounded tile with a light grey border
//   apps/app/client/public/  the demo app's icons, on the same white tile: favicon.svg and favicon.ico (16, 32, 48; the agent
//                          a little bigger, for the tab), favicon-96x96.png, apple-touch-icon.png (180),
//                          web-app-manifest-192x192.png and web-app-manifest-512x512.png
//
// and the agent as SVG markup (UPMADE_LOGO_MARKUP, UPMADE_LOGO_VIEWBOX) for the code that draws it inline:
//   libs/engine/core/src/components/upmade-watermark/upmade-logo.ts   the editor's "upmade.io" watermark
//   src/components/Brand/logoAgent.ts                                  the website footer
//
// It replaces tools/logo (npm run logo:generate), which drew these from the old hand-drawn mark.
//
// The outline, colours and ink come from the agents' tokens (Node runs the .ts file directly); the eyes, glints and
// hands are placed as the rig draws them at rest (Agents/Agent.tsx), the eyes glancing up to the right (LOOK).
// Rasterized with @resvg/resvg-js.
import { writeFileSync } from "node:fs";
import zlib from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { COLOURS, INK, SHAPES, STROKE } from "../src/components/Agents/tokens.ts";
// the agents' own timeline and idle animation, for the README badge's loop (the npm script loads ./ts-resolve.mjs,
// so their extensionless imports resolve)
import { poseAt } from "../src/components/Agents/timeline.ts";
import { idle } from "../src/components/Agents/animations/idle.ts";

const STATIC = join(dirname(fileURLToPath(import.meta.url)), "..", "static");
const REPO = join(STATIC, "..", "..", "..");
const APP = join(REPO, "apps/app/client/public");
const [LIGHT, BASE] = COLOURS.pink;
const { d: OUTLINE, eyesY: EYES_Y, hands: HANDS } = SHAPES.squircle;
const HAND_R = 4.6;
/** where the eyes look: up and to the right (the rig's gaze offset, as in Agents/animations/idle.ts' glances) */
const LOOK = [3.8, -3.8];

/** the gradient's id: unique enough to share a page with the site's own agents (theirs are `agent-<react id>`) */
const GRADIENT = "upmade-logo-pink";

/**
 * The agent in its own 64x64 drawing space; `rim` is the colour of its outlines (ink).
 * `rimClass` marks the outlines with class="rim", so a stylesheet can recolour them (the editor's watermark).
 */
function agent(rim = INK, { rimClass = false } = {}) {
  const cls = rimClass ? ' class="rim"' : "";
  const hand = ([x, y]) =>
    `<circle${cls} cx="${x}" cy="${y}" r="${HAND_R}" fill="url(#${GRADIENT})" stroke="${rim}" stroke-width="${STROKE.hand}"/>`;
  return [
    `<path${cls} d="${OUTLINE}" fill="url(#${GRADIENT})" stroke="${rim}" stroke-width="${STROKE.body}" stroke-linejoin="round"/>`,
    `<g transform="translate(${LOOK[0]} ${LOOK[1]})">`,
    `<rect x="24.55" y="${EYES_Y}" width="4.3" height="6.2" rx="2.15" fill="${INK}"/>`,
    `<rect x="35.15" y="${EYES_Y}" width="4.3" height="6.2" rx="2.15" fill="${INK}"/>`,
    `<circle cx="27.2" cy="${EYES_Y + 1.7}" r="1" fill="#FFFFFF"/>`,
    `<circle cx="37.8" cy="${EYES_Y + 1.7}" r="1" fill="#FFFFFF"/>`,
    `</g>`,
    hand(HANDS.L),
    hand(HANDS.R),
  ].join("");
}

const DEFS =
  `<defs><linearGradient id="${GRADIENT}" x1="0" y1="0" x2="0" y2="1">` +
  `<stop offset="0" stop-color="${LIGHT}"/><stop offset=".65" stop-color="${BASE}"/></linearGradient></defs>`;

// the drawing's extent, rims included: from the left hand to the right hand, from the top of the body to its feet
const X0 = HANDS.L[0] - HAND_R - STROKE.hand / 2;
const X1 = HANDS.R[0] + HAND_R + STROKE.hand / 2;
const Y0 = 13.5 - STROKE.body / 2;
const Y1 = SHAPES.squircle.feet[1] + STROKE.body / 2;
const W = X1 - X0, H = Y1 - Y0;

const n = (v) => Number(v.toFixed(4));

/** The bare agent, cropped to its drawing with a little room (logo.svg). */
function bare(rim) {
  const pad = 0.6;
  const vb = [X0 - pad, Y0 - pad, W + 2 * pad, H + 2 * pad].map(n).join(" ");
  const w = Math.round((W + 2 * pad) * 10), h = Math.round((H + 2 * pad) * 10);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${vb}">${DEFS}${agent(rim)}</svg>`;
}

/**
 * The agent centred on a 1000x1000 tile, `width` wide. `rounded`: the favicons' rounded square; otherwise square
 * (the avatar: platforms crop it themselves). `border`: a thin rim around the tile in that colour (the README badge,
 * so the white tile shows on GitHub's white page). `inner`: the agent's markup, if not the still one (the README's
 * animated badge); `style`: a stylesheet for it.
 */
function tile({ background, rim = INK, rounded, width, border, inner = agent(rim), style = "" }) {
  const s = width / W;
  const tx = 500 - (X0 + W / 2) * s, ty = 500 - (Y0 + H / 2) * s;
  const ground = border
    ? `<rect x="8" y="8" width="984" height="984" rx="342" ry="342" fill="${background}" stroke="${border}" stroke-width="16"/>`
    : `<rect width="1000" height="1000"${rounded ? ' rx="350" ry="350"' : ""} fill="${background}"/>`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000">${style}${DEFS}${ground}` +
    `<g transform="translate(${n(tx)} ${n(ty)}) scale(${n(s)})">${inner}</g></svg>`
  );
}

// ---- the README badge: the agent idling (Agents/animations/idle.ts), baked into CSS keyframes ----

/**
 * The agent's idle loop as an animated SVG: the rig's moving parts (Agents/Agent.tsx applyPose) as groups, each with
 * a CSS animation sampled from the idle animation's poses (poseAt). An <img> on GitHub plays CSS animations but runs
 * no script, so the loop is baked in. Breathing moves the body and hands, the gaze moves the eyes, and blinks squash
 * them about their middle; with reduced motion it stands still.
 */
function idleAgent() {
  const D = idle.duration;
  const [fx, fy] = SHAPES.squircle.feet;
  const eyesMid = EYES_Y + 3.1;
  const pose = (t) => poseAt(idle, t % D, "squircle");
  /**
   * One channel as keyframes: `values(t)` sampled every `step` ms, keeping only the frames that linear interpolation
   * between the kept ones can't reproduce within `eps` (flat stretches shrink to their two ends).
   */
  function keyframes(name, step, values, css, eps) {
    const s = [];
    for (let t = 0; t <= D; t += step) s.push([t, values(t)]);
    if (s[s.length - 1][0] !== D) s.push([D, values(D)]);
    const kept = [s[0]];
    let a = 0;
    for (let b = 2; b < s.length; b++) {
      const fits = s.slice(a + 1, b).every(([t, v]) =>
        v.every((x, i) => Math.abs(x - (s[a][1][i] + ((s[b][1][i] - s[a][1][i]) * (t - s[a][0])) / (s[b][0] - s[a][0]))) <= eps),
      );
      if (!fits) {
        a = b - 1;
        kept.push(s[a]);
      }
    }
    kept.push(s[s.length - 1]);
    const frames = kept.map(([t, v]) => `${n((t / D) * 100)}%{transform:${css(v)}}`).join("");
    return `@keyframes ${name}{${frames}}`;
  }
  const px = (v) => `${n(v)}px`;
  const css = [
    keyframes("breathe", 100, (t) => pose(t).body.scale, ([sx, sy]) =>
      `translate(${px(fx)},${px(fy)}) scale(${n(sx)},${n(sy)}) translate(${px(-fx)},${px(-fy)})`, 0.0004),
    keyframes("look", 20, (t) => pose(t).eyes.look, ([x, y]) => `translate(${px(x)},${px(y)})`, 0.03),
    keyframes("blink", 10, (t) => [pose(t).eyes.open], ([o]) =>
      `translate(0,${px(eyesMid)}) scale(1,${n(o)}) translate(0,${px(-eyesMid)})`, 0.01),
    `.breathe{animation:breathe ${D}ms linear infinite}`,
    `.look{animation:look ${D}ms linear infinite}`,
    `.blink{animation:blink ${D}ms linear infinite}`,
    `@media (prefers-reduced-motion:reduce){.breathe,.look,.blink{animation:none}}`,
  ].join("");
  const hand = ([x, y]) =>
    `<circle cx="${x}" cy="${y}" r="${HAND_R}" fill="url(#${GRADIENT})" stroke="${INK}" stroke-width="${STROKE.hand}"/>`;
  const inner = [
    `<g class="breathe">`,
    `<path d="${OUTLINE}" fill="url(#${GRADIENT})" stroke="${INK}" stroke-width="${STROKE.body}" stroke-linejoin="round"/>`,
    `<g class="look"><g class="blink">`,
    `<rect x="24.55" y="${EYES_Y}" width="4.3" height="6.2" rx="2.15" fill="${INK}"/>`,
    `<rect x="35.15" y="${EYES_Y}" width="4.3" height="6.2" rx="2.15" fill="${INK}"/>`,
    `<circle cx="27.2" cy="${EYES_Y + 1.7}" r="1" fill="#FFFFFF"/>`,
    `<circle cx="37.8" cy="${EYES_Y + 1.7}" r="1" fill="#FFFFFF"/>`,
    `</g></g>`,
    hand(HANDS.L),
    hand(HANDS.R),
    `</g>`,
  ].join("");
  return { inner, style: `<style>${css}</style>` };
}

const png = (svg, width) => new Resvg(svg, { fitTo: { mode: "width", value: width } }).render().asPng();

/** An .ico of PNG-encoded layers (supported by every current browser and OS), one per size. */
function ico(layers) {
  const header = Buffer.alloc(6 + 16 * layers.length);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(layers.length, 4);
  let offset = header.length;
  layers.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, e); // width (0 means 256)
    header.writeUInt8(size >= 256 ? 0 : size, e + 1); // height
    header.writeUInt8(0, e + 2); // palette size
    header.writeUInt8(0, e + 3); // reserved
    header.writeUInt16LE(1, e + 4); // colour planes
    header.writeUInt16LE(32, e + 6); // bits per pixel
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...layers.map((l) => l.data)]);
}

/**
 * An opaque PNG (RGB, no alpha channel), for the avatar: Apple's touch icons are meant to be opaque, and resvg always
 * renders RGBA. The SVG is rendered on a solid background, then its pixels are re-encoded without the alpha bytes.
 */
function opaquePng(svg, width, background) {
  const image = new Resvg(svg, { fitTo: { mode: "width", value: width }, background }).render();
  const { width: w, height: h, pixels } = image;
  const raw = Buffer.alloc(h * (1 + w * 3));
  for (let y = 0; y < h; y++) {
    const row = y * (1 + w * 3);
    raw[row] = 0; // filter: none
    for (let x = 0; x < w; x++) {
      const p = (y * w + x) * 4, q = row + 1 + x * 3;
      raw[q] = pixels[p];
      raw[q + 1] = pixels[p + 1];
      raw[q + 2] = pixels[p + 2];
    }
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(zlib.crc32(body));
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(2, 9); // colour type: RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const files = {
  "img/favicon.svg": tile({ background: "#ffffff", rounded: true, width: 820 }),
  "img/logo.svg": bare(INK),
};
for (const [name, svg] of Object.entries(files)) writeFileSync(join(STATIC, name), svg + "\n");

writeFileSync(join(STATIC, "img/logo.png"), png(files["img/logo.svg"], 512));
writeFileSync(
  join(STATIC, "img/logo_avatar.png"),
  opaquePng(tile({ background: "#ffffff", rounded: false, width: 700 }), 512, "#ffffff"),
);
writeFileSync(
  join(STATIC, "favicon.ico"),
  ico([16, 32, 48, 64].map((size) => ({ size, data: png(files["img/favicon.svg"], size) }))),
);

// the README badge: the agent idling, animated
writeFileSync(join(REPO, "logo.svg"), tile({ background: "#ffffff", width: 700, border: "#ededed", ...idleAgent() }) + "\n");

// the demo app: the same white rounded tile as the website's favicon
const light = { background: "#ffffff", rounded: true };
const appTab = tile({ ...light, width: 860 });
writeFileSync(join(APP, "favicon.svg"), appTab + "\n");
writeFileSync(join(APP, "favicon.ico"), ico([16, 32, 48].map((size) => ({ size, data: png(appTab, size) }))));
const appTile = tile({ ...light, width: 760 });
for (const [name, size] of [
  ["favicon-96x96.png", 96],
  ["apple-touch-icon.png", 180],
  ["web-app-manifest-192x192.png", 192],
  ["web-app-manifest-512x512.png", 512],
]) {
  writeFileSync(join(APP, name), png(appTile, size));
}

// The agent as markup for code that draws it inline: the editor's watermark (libs/engine) and the website footer.
// Its outlines carry class="rim" and are ink by default; the watermark recolours them with the theme's logoColor.
function logoModule(header) {
  const pad = 0.6;
  const vb = [X0 - pad, Y0 - pad, W + 2 * pad, H + 2 * pad].map(n);
  const markup = DEFS + agent(INK, { rimClass: true });
  return [
    ...header.map((line) => `// ${line}`),
    `export const UPMADE_LOGO_VIEWBOX = '${vb.join(" ")}';`,
    "",
    `export const UPMADE_LOGO_WIDTH = ${vb[2]};`,
    "",
    `export const UPMADE_LOGO_HEIGHT = ${vb[3]};`,
    "",
    `export const UPMADE_LOGO_MARKUP =`,
    `  '${markup}';`,
    "",
  ].join("\n");
}
const MODULE_NOTE =
  "Written by `npm run icons:generate` (apps/website/scripts/generate-icons.mjs) from the agents' tokens: don't edit it by hand.";
writeFileSync(
  join(REPO, "libs/engine/core/src/components/upmade-watermark/upmade-logo.ts"),
  logoModule([
    "The Upmade logo drawn by the watermark: the pink agent (the website's logo), as SVG markup in UPMADE_LOGO_VIEWBOX.",
    MODULE_NOTE,
    "Its outlines carry class=\"rim\": the watermark's stylesheet colours them with the theme's logoColor.",
  ]),
);
writeFileSync(
  join(STATIC, "..", "src/components/Brand/logoAgent.ts"),
  logoModule([
    "The Upmade logo as SVG markup, for places that draw it inline as HTML (the footer): the pink agent in",
    "UPMADE_LOGO_VIEWBOX, its outlines ink and marked class=\"rim\". Elsewhere React draws the live <Agent>.",
    MODULE_NOTE,
  ]),
);

console.log(`Wrote ${Object.keys(files).length + 3} icons to ${STATIC}, the README badge, 6 icons to ${APP} and the logo markup modules`);
