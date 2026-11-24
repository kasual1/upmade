// Measures how far each /agent demo's drawing reaches past its box, for the `reach` numbers in
// src/components/LandingPage/agents.ts. Serve a production build, then run from apps/website:
//
//   npx docusaurus serve --port 4391 --no-open &
//   node scripts/measure-agent-reach.mjs http://localhost:4391/agent 60
//
// It opens /agent with motion on in a viewport tall enough that every demo plays at once, and for the given number
// of seconds (cover two loops of the longest animation) samples, per `figure[data-demo]`, the union of the screen
// rects of every drawn element (displayed, not at opacity 0, plus half its stroke, clipped to its <svg> where that
// clips, plus any <canvas>) against the demo's box (the figure's first element). It prints the maximum per side as a
// fraction of the box. Set WEBSITE_E2E_CHROMIUM to a Chromium executable if Playwright's own is not installed.
import { chromium } from '@playwright/test';
const URL = process.argv[2] ?? 'http://localhost:4391/agent';
const SECONDS = Number(process.argv[3] ?? 60);
const executablePath = process.env.WEBSITE_E2E_CHROMIUM || undefined;
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const page = await browser.newPage({ viewport: { width: 1400, height: 1600 }, reducedMotion: 'no-preference' });
await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const max = {};
const t0 = Date.now();
let samples = 0;
while (Date.now() - t0 < SECONDS * 1000) {
  const r = await page.evaluate(() => {
    const out = {};
    const SEL = 'path,circle,ellipse,rect,line,polyline,polygon,image,text,use';
    for (const fig of document.querySelectorAll('figure[data-demo]')) {
      const boxEl = fig.firstElementChild;
      const b = boxEl.getBoundingClientRect();
      let L = Infinity, T = Infinity, R = -Infinity, B = -Infinity;
      for (const el of fig.querySelectorAll(SEL)) {
        if (el.closest('clipPath,defs,mask,symbol,figcaption')) continue;
        if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
        const cs = getComputedStyle(el);
        if (cs.fill === 'none' && cs.stroke === 'none') continue;
        let r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        let pad = 0;
        if (cs.stroke !== 'none') {
          const m = el.getScreenCTM();
          pad = (parseFloat(cs.strokeWidth) || 0) / 2 * (m ? Math.hypot(m.a, m.b) : 1);
        }
        let l = r.left - pad, t = r.top - pad, rr = r.right + pad, bb = r.bottom + pad;
        const svg = el.ownerSVGElement;
        if (svg && getComputedStyle(svg).overflow !== 'visible') {
          const s = svg.getBoundingClientRect();
          l = Math.max(l, s.left); t = Math.max(t, s.top); rr = Math.min(rr, s.right); bb = Math.min(bb, s.bottom);
          if (rr <= l || bb <= t) continue;
        }
        L = Math.min(L, l); T = Math.min(T, t); R = Math.max(R, rr); B = Math.max(B, bb);
      }
      for (const c of fig.querySelectorAll('canvas')) {
        const r = c.getBoundingClientRect();
        L = Math.min(L, r.left); T = Math.min(T, r.top); R = Math.max(R, r.right); B = Math.max(B, r.bottom);
      }
      out[fig.dataset.demo] = { w: b.width, h: b.height, top: (b.top - T) / b.height, right: (R - b.right) / b.width, bottom: (B - b.bottom) / b.height, left: (b.left - L) / b.width };
    }
    return out;
  });
  samples++;
  for (const [k, v] of Object.entries(r)) {
    const m = (max[k] ??= { w: v.w, h: v.h, top: -9, right: -9, bottom: -9, left: -9 });
    for (const s of ['top', 'right', 'bottom', 'left']) m[s] = Math.max(m[s], v[s]);
  }
  await page.waitForTimeout(40);
}
console.log('samples', samples);
for (const [k, m] of Object.entries(max)) console.log(k.padEnd(16), m.w, m.h, ['top', 'right', 'bottom', 'left'].map((s) => `${s}=${m[s].toFixed(3)}`).join(' '));
await browser.close();
