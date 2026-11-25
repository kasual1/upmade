// Post-build checks of "/" (the landing page) in the built HTML: run `npm run build` first, then
// `npm run test:landing`. Not part of `npm test`, like the llms and blog-video output checks. LANDING_BUILD_DIR
// (relative to apps/website or absolute) checks another build directory, e.g. an e2e out dir.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';
import { describe, expect, test } from 'vitest';
import { FAQ_ITEMS } from '../src/content/landing/faq';
import { DESCRIPTION, TITLE, infinitePage } from '../src/content/landing/infinite';

const websiteRoot = fileURLToPath(new URL('../', import.meta.url));
const buildRoot = path.resolve(websiteRoot, process.env.LANDING_BUILD_DIR ?? 'build');
const indexFile = path.join(buildRoot, 'index.html');
const html = fs.existsSync(indexFile) ? fs.readFileSync(indexFile, 'utf8') : '';
const $ = load(html);

const norm = (t: string) => t.replace(/\s+/g, ' ').trim();
const stripBackticks = (t: string) => t.replace(/`/g, '');
const jsonLd = () => $('script[type="application/ld+json"]').map((_, el) => JSON.parse($(el).text())).get() as Array<Record<string, any>>;
const hero = infinitePage.sections.find((s) => s.type === 'hero')!;

describe('"/" in the built HTML', () => {
  test('the build exists', () => {
    expect(fs.existsSync(indexFile), `${indexFile} is missing: run npm run build first`).toBe(true);
  });

  test('is the landing page: html.landing-page, one main, one h1 with the hero title', () => {
    expect($('html').attr('class') ?? '').toMatch(/\blanding-page\b/);
    expect($('main[data-lp-page]')).toHaveLength(1);
    expect($('h1')).toHaveLength(1);
    expect(norm($('h1').text())).toBe(hero.title);
  });

  test('every section is rendered with its heading', () => {
    for (const section of infinitePage.sections) {
      if ('hidden' in section && section.hidden) continue;
      expect($(`section[aria-labelledby="${section.id}-heading"] #${section.id}-heading`), section.id).toHaveLength(1);
    }
  });

  test('has no duplicate ids', () => {
    const ids = $('[id]').map((_, el) => $(el).attr('id')).get();
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });

  test('every FAQ answer is in the HTML, and the FAQPage JSON-LD has one entry per item', () => {
    const text = norm($('section[aria-labelledby="faq-heading"]').text());
    for (const item of FAQ_ITEMS) {
      expect(text).toContain(norm(stripBackticks(item.q)));
      expect(text).toContain(norm(stripBackticks(item.a)));
    }
    const faq = jsonLd().find((entry) => entry['@type'] === 'FAQPage');
    expect(faq).toBeDefined();
    expect(faq!.mainEntity).toHaveLength(FAQ_ITEMS.length);
    faq!.mainEntity.forEach((q: { name: string; acceptedAnswer: { text: string } }, i: number) => {
      expect(q.name).toBe(stripBackticks(FAQ_ITEMS[i].q));
      expect(q.acceptedAnswer.text).not.toContain('`');
    });
  });

  test('has the SoftwareApplication JSON-LD', () => {
    expect(jsonLd().some((entry) => entry['@type'] === 'SoftwareApplication')).toBe(true);
  });

  test('keeps the title and description, is indexable, and has og/twitter titles', () => {
    expect($('title').text()).toBe(TITLE);
    expect($('meta[name="description"]').attr('content')).toBe(DESCRIPTION);
    expect($('meta[property="og:title"]').attr('content')).toBe(TITLE);
    expect($('meta[name="twitter:title"]').attr('content')).toBe(TITLE);
    expect($('meta[name="robots"][content*="noindex"]')).toHaveLength(0);
  });

  test('has an absolute og:image and twitter:image', () => {
    for (const sel of ['meta[property="og:image"]', 'meta[name="twitter:image"]']) {
      expect($(sel).attr('content') ?? '', sel).toMatch(/^https?:\/\//);
    }
  });

  // Known gap: the site's default social image (themeConfig.image, img/docusaurus-social-card.jpg) does not exist.
  // The social card is plan decision 6, outside this effort. When the card is added this starts failing: then
  // change `test.fails` to `test`.
  test.fails('the og:image file exists in the build', () => {
    const url = new URL($('meta[property="og:image"]').attr('content') ?? '');
    expect(fs.existsSync(path.join(buildRoot, decodeURIComponent(url.pathname)))).toBe(true);
  });

  test('the toggle links to /agentic and marks "/" as the current page', () => {
    const toggle = $('section[aria-labelledby="hero-heading"] nav a');
    const hrefs = toggle.map((_, el) => $(el).attr('href')).get();
    expect(hrefs.some((h) => /\/agentic\/?$/.test(h))).toBe(true);
    expect(toggle.filter('[aria-current="page"]').map((_, el) => $(el).attr('href')).get()).toEqual(['/']);
  });

  test('has exactly one footer, the landing footer', () => {
    expect($('footer')).toHaveLength(1);
    expect($('.footer')).toHaveLength(0);
  });
});

describe('the build', () => {
  test('has no /landing-next/ preview and no sitemap entry for it', () => {
    expect(fs.existsSync(path.join(buildRoot, 'landing-next'))).toBe(false);
    const sitemap = fs.readFileSync(path.join(buildRoot, 'sitemap.xml'), 'utf8');
    expect(sitemap).not.toContain('landing-next');
  });
});

describe('"/agentic/" in the built HTML', () => {
  const file = path.join(buildRoot, 'agentic', 'index.html');
  const a = load(fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '');

  test('is the agentic landing page: one main, one h1, every section, one footer, unique ids', async () => {
    const { agenticPage, AGENTIC_TITLE } = await import('../src/content/landing/agentic');
    expect(a('html').attr('class') ?? '').toMatch(/\blanding-page\b/);
    expect(a('main[data-lp-page]')).toHaveLength(1);
    expect(a('h1')).toHaveLength(1);
    for (const section of agenticPage.sections) {
      expect(a(`section[aria-labelledby="${section.id}-heading"] #${section.id}-heading`), section.id).toHaveLength(1);
    }
    expect(a('title').text()).toBe(AGENTIC_TITLE);
    expect(a('footer')).toHaveLength(1);
    const ids = a('[id]').map((_, el) => a(el).attr('id')).get();
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });

  test('every FAQ answer is in the HTML, with FAQPage JSON-LD, and the toggle marks /agentic current', async () => {
    const { AGENTIC_FAQ_ITEMS } = await import('../src/content/landing/agentic-faq');
    const text = norm(a('section[aria-labelledby="faq-heading"]').text());
    for (const item of AGENTIC_FAQ_ITEMS) expect(text).toContain(norm(stripBackticks(item.a)));
    const ld = a('script[type="application/ld+json"]').map((_, el) => JSON.parse(a(el).text())).get() as Array<Record<string, any>>;
    expect(ld.find((e) => e['@type'] === 'FAQPage')?.mainEntity).toHaveLength(AGENTIC_FAQ_ITEMS.length);
    const current = a('section[aria-labelledby="hero-heading"] nav a[aria-current="page"]').map((_, el) => a(el).attr('href')).get();
    expect(current.length).toBe(1);
    expect(current[0]).toMatch(/\/agentic\/?$/);
  });
});
