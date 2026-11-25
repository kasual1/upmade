// Checks for the landing page at "/" (the config-driven LandingPage). Until the cutover (M9) they ran against the
// /landing-next/ preview. Every check is enabled (none is fixme); the milestone that enabled each is listed here:
//   - no pageerror / console errors                         (M3)
//   - no horizontal overflow at all four project widths     (M3, M4 onwards)
//   - FAQ accordion keyboard flow, find-in-page opens items (M5)
//   - agents do not flash misaligned before hydration       (M4)
//   - toolbar keyboard flow                                 (M7)
//   - navbar shown only after scrolling past the hero       (M7)
//   - one h1, one footer (the landing footer), FAQ answers and unique ids in the served HTML, indexable and in the
//     sitemap, and the old /landing-next/ preview is gone                                                    (M9)
//   - with the minimum font size (minFont.ts), each media frame keeps its size and its content in its box
import { THIRD_PARTY_ANALYTICS, expect, horizontalOverflow, mediaFrames, scrollThrough, settle, test } from './fixtures';
import { expect as minFontExpect, test as minFontTest } from './minFont';

const LANDING = '/';

test.describe('"/" (the landing page)', () => {
  test('loads without errors', async ({ page, pageErrors }) => {
    const response = await page.goto(LANDING);
    expect(response?.status()).toBe(200);
    await settle(page);
    // Scroll through once so the agents, timers and media that start in view run too.
    await scrollThrough(page);
    // Give effects and timers that start after hydration a moment to run.
    await page.waitForTimeout(500);
    expect(pageErrors.filter((error) => !THIRD_PARTY_ANALYTICS.test(error))).toEqual([]);
  });

  test('is server-rendered with one h1 and the page structure', async ({ browser, baseURL }) => {
    // with scripts off, the page is what the server sent
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
    const page = await context.newPage();
    await page.goto(LANDING);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main[data-lp-page]')).toHaveCount(1);
    // indexable: no robots noindex (the /landing-next/ preview had one)
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
    for (const id of ['hero', 'features', 'dom-canvas', 'get-started', 'performance', 'faq']) {
      await expect(page.locator(`section[aria-labelledby="${id}-heading"] #${id}-heading`)).toHaveCount(1);
    }
    // one footer, the landing footer (the Docusaurus footer is not rendered on the landing page)
    await expect(page.locator('footer')).toHaveCount(1);
    await expect(page.locator('.footer')).toHaveCount(0);
    // every id is unique
    const duplicateIds = await page.evaluate(() => {
      const ids = Array.from(document.querySelectorAll('[id]'), (el) => el.id);
      return ids.filter((id, i) => ids.indexOf(id) !== i);
    });
    expect(duplicateIds).toEqual([]);
    // every FAQ answer is in the HTML (closed answers stay rendered), matching the FAQPage JSON-LD
    const faq = await page.evaluate(() => {
      const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'), (s) => JSON.parse(s.textContent ?? 'null'));
      const page = ld.find((entry) => entry?.['@type'] === 'FAQPage');
      const norm = (t: string) => t.replace(/\s+/g, ' ').trim();
      const answers = Array.from(document.querySelectorAll('section[aria-labelledby="faq-heading"] [role="region"]'), (r) => norm(r.textContent ?? ''));
      return {
        jsonLd: (page?.mainEntity ?? []).map((q: { acceptedAnswer: { text: string } }) => norm(q.acceptedAnswer.text)),
        answers,
      };
    });
    expect(faq.answers.length).toBeGreaterThan(0);
    expect(faq.answers).toEqual(faq.jsonLd);
    await context.close();
  });

  test('agents do not flash misaligned before hydration (scripts held back)', async ({ page }) => {
    // M4: the server HTML shows each agent where it ends up; composite agents (layers placed by script) stay hidden
    // until mounted. The scripts are held back so the server HTML can be measured while it is on screen.
    let release!: () => void;
    const released = new Promise<void>((resolve) => (release = resolve));
    await page.route(/\.js(\?|$)/, async (route) => {
      await released;
      await route.continue();
    });
    // each agent's box size, and where its drawing sits in that box (the rig's alignment; where the box is on the
    // page can still move a little, e.g. the code window above an agent reserves its height only once measured)
    const agents = () =>
      page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLElement>('[data-agent-slot]'), (slot) => {
          const layer = slot.lastElementChild as HTMLElement;
          const demo = layer.firstElementChild as HTMLElement | null;
          const s = slot.getBoundingClientRect();
          const d = demo?.getBoundingClientRect();
          return {
            agent: slot.dataset.agent,
            slot: [s.width, s.height].map(Math.round),
            shown: getComputedStyle(layer).visibility !== 'hidden',
            demo: d && [d.left - s.left, d.top - s.top, d.width, d.height].map(Math.round),
          };
        }),
      );
    await page.goto(LANDING, { waitUntil: 'commit' });
    await page.waitForSelector('footer', { state: 'attached' });
    await page.evaluate(() => document.fonts.ready);
    const before = await agents();
    release();
    await settle(page);
    const after = await agents();
    expect(before.length).toBeGreaterThan(0);
    expect(before.map((a) => a.agent)).toEqual(after.map((a) => a.agent));
    const near = (a?: number[], b?: number[]) => !!a && !!b && a.every((v, i) => Math.abs(v - b[i]) <= 1);
    before.forEach((a, i) => {
      expect(near(a.slot, after[i].slot), `${a.agent} box ${a.slot} -> ${after[i].slot}`).toBe(true);
      // what shows before hydration is drawn where it will be (an agent rendered only after mounting shows nothing yet)
      if (a.shown && a.demo) expect(near(a.demo, after[i].demo), `${a.agent} drawing ${a.demo} -> ${after[i].demo}`).toBe(true);
    });
  });

  test('is in the sitemap, and the /landing-next/ preview is gone', async ({ request, baseURL }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBe(true);
    const sitemap = await response.text();
    expect(sitemap).toContain('<urlset');
    expect(sitemap).toMatch(/<loc>[^<]*\/<\/loc>/); // the site root
    expect(sitemap).not.toContain('landing-next');
    const preview = await request.get(new URL('/landing-next/', baseURL).toString(), { maxRedirects: 0 });
    expect(preview.status()).toBe(404);
  });

  test('has no horizontal overflow', async ({ page }) => {
    await page.goto(LANDING);
    await settle(page);
    await scrollThrough(page);
    await settle(page);
    const { scrollWidth, innerWidth } = await horizontalOverflow(page);
    expect(scrollWidth, `scrollWidth ${scrollWidth} > innerWidth ${innerWidth}`).toBeLessThanOrEqual(innerWidth);
  });

  test('FAQ accordion works by keyboard', async ({ page }) => {
    // M5: Tab to a question, Enter/Space toggles it, aria-expanded follows, the answer is shown, one open at a time.
    await page.goto(LANDING);
    await settle(page);
    const faq = page.locator('section[aria-labelledby="faq-heading"]');
    const questions = faq.locator('h3 > button[aria-expanded]');
    const count = await questions.count();
    expect(count).toBeGreaterThan(1);
    await expect(faq.locator('button[aria-expanded="true"]')).toHaveCount(0);
    // clicking the (unfocusable) heading sets the focus navigation start point; Tab goes to the first question
    await faq.locator('#faq-heading').click();
    await page.keyboard.press('Tab');
    const first = questions.nth(0);
    const second = questions.nth(1);
    await expect(first).toBeFocused();
    const answerOf = async (question: typeof first) => page.locator(`[id="${await question.getAttribute('aria-controls')}"]`);
    const firstAnswer = await answerOf(first);
    const secondAnswer = await answerOf(second);
    await expect(firstAnswer).toHaveAttribute('role', 'region');
    await page.keyboard.press('Enter');
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await expect(firstAnswer).not.toHaveAttribute('inert', /.*/);
    await expect(firstAnswer).toBeVisible();
    // Tab moves from the open question past its answer (it holds no controls) to the next question
    await page.keyboard.press('Tab');
    await expect(second).toBeFocused();
    await page.keyboard.press('Space');
    await expect(second).toHaveAttribute('aria-expanded', 'true');
    await expect(secondAnswer).not.toHaveAttribute('inert', /.*/);
    // only one open at a time: opening the second closed the first
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    // a closed answer is inert while it collapses, then hidden until found (find-in-page still finds it)
    await expect(firstAnswer).toHaveAttribute('hidden', 'until-found');
    await expect(firstAnswer).not.toHaveAttribute('inert', /.*/);
    await expect(faq.locator('button[aria-expanded="true"]')).toHaveCount(1);
    // Enter on the open question closes it
    await page.keyboard.press('Enter');
    await expect(second).toHaveAttribute('aria-expanded', 'false');
    await expect(faq.locator('button[aria-expanded="true"]')).toHaveCount(0);
    // find-in-page (beforematch, fired by the browser on a match in a hidden="until-found" answer) opens the item
    await expect(secondAnswer).toHaveAttribute('hidden', 'until-found');
    await secondAnswer.evaluate((answer) => answer.dispatchEvent(new Event('beforematch')));
    await expect(second).toHaveAttribute('aria-expanded', 'true');
    await expect(secondAnswer).not.toHaveAttribute('hidden', /.*/);
  });

  test('toolbar works by keyboard', async ({ page }) => {
    // M7: one tab stop on the selected tool; arrows/Home/End move focus; Enter/Space select (aria-pressed).
    // (reduced motion: the agent is still, so a click only selects; the jump is checked with motion below)
    await page.goto(LANDING);
    await settle(page);
    const toolbar = page.getByRole('toolbar', { name: 'Canvas tools' });
    const tool = (name: string) => toolbar.getByRole('button', { name, exact: true });
    await expect(tool('Select')).toHaveAttribute('aria-pressed', 'true');
    // Tab from the page toggle (the last control before the toolbar) lands on the selected tool
    await page.locator('section[aria-labelledby="hero-heading"] a[href*="agentic"]').focus();
    await page.keyboard.press('Tab');
    await expect(tool('Select')).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(tool('Pen')).toBeFocused();
    await expect(tool('Pen')).toHaveAttribute('aria-pressed', 'false');
    await page.keyboard.press('Enter');
    await expect(tool('Pen')).toHaveAttribute('aria-pressed', 'true');
    await expect(tool('Select')).toHaveAttribute('aria-pressed', 'false');
    await page.keyboard.press('End');
    await expect(tool('Image')).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(tool('Select')).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Space');
    await expect(tool('Image')).toHaveAttribute('aria-pressed', 'true');
    // leaving and coming back returns to the selected tool
    await page.keyboard.press('Home');
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(tool('Image')).toBeFocused();
    await expect(toolbar.locator('button[tabindex="0"]')).toHaveCount(1);
  });

  test('navbar appears only after scrolling past the hero', async ({ page }) => {
    // M7: the navbar is hidden at the top and shown once the hero header has left the viewport.
    await page.goto(LANDING);
    await settle(page);
    const html = page.locator('html');
    const navbar = page.locator('.navbar').first();
    await expect(html).not.toHaveClass(/landing-nav-visible/);
    await expect(html).toHaveAttribute('data-landing-nav-animated', '');
    await expect(navbar).toBeHidden();
    await page.evaluate(() => {
      const header = document.querySelector('section[aria-labelledby="hero-heading"] header')!;
      window.scrollTo(0, header.getBoundingClientRect().bottom + window.scrollY + 10);
    });
    await expect(html).toHaveClass(/landing-nav-visible/);
    await expect(navbar).toBeVisible();
    // the navbar shows the landing pages' logo (the pink agent and "upmade.io"), not the docs brand
    await expect(navbar.locator('.navbar__inner a.navbar__brand[aria-label="upmade.io home"] [data-part="outline"]')).toHaveCount(1);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(html).not.toHaveClass(/landing-nav-visible/);
    await expect(navbar).toBeHidden();
  });
});

test.describe('"/" with motion', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('the toolbar follows the toolCycle agent, and a click jumps the agent to that tool', async ({ page }) => {
    // M11: the agent's tool:* events select the tool; a click restarts the agent at the clicked tool's turn, after
    // which its next turn (the following tool) comes about one turn later
    test.setTimeout(60_000);
    await page.goto(LANDING);
    await settle(page);
    const toolbar = page.getByRole('toolbar', { name: 'Canvas tools' });
    const pressed = toolbar.locator('button[aria-pressed="true"]');
    await expect(pressed).toHaveAccessibleName('Select');
    await expect(pressed).toHaveAccessibleName('Pen', { timeout: 8_000 }); // the agent's first turn is the pen
    await toolbar.getByRole('button', { name: 'Text', exact: true }).click();
    await expect(pressed).toHaveAccessibleName('Text');
    await expect(pressed).toHaveAccessibleName('Image', { timeout: 10_000 }); // the agent carried on from the text turn
  });
});

minFontTest.describe('"/" with a minimum font size', () => {
  // Plan §3.7: media lay their content out on a ScaledStage, so clamped small type cannot push it out of its frame.
  minFontTest('each media frame keeps its content inside its box', async ({ page, minFontPage }) => {
    await page.goto(LANDING);
    await settle(page);
    await scrollThrough(page);
    const reference = await mediaFrames(page);
    await minFontPage.goto(LANDING);
    await settle(minFontPage);
    await scrollThrough(minFontPage);
    // the profile pref really applies (min-font.e2e.ts checks the technique itself)
    minFontExpect(await minFontPage.evaluate(() => getComputedStyle(document.querySelector('[data-scaled-stage]')!).fontSize)).toBe('24px');
    const clamped = await mediaFrames(minFontPage);
    minFontExpect(clamped.length).toBe(reference.length);
    minFontExpect(clamped.length).toBeGreaterThan(0);
    clamped.forEach((frame, i) => {
      minFontExpect(frame.outside, `${frame.frame}: content outside the frame`).toEqual([]);
      // a frame sized by its aspect ratio keeps its size whatever the font size
      if (reference[i].aspect) {
        minFontExpect(Math.abs(frame.width - reference[i].width), `${frame.frame} width`).toBeLessThanOrEqual(1);
        minFontExpect(Math.abs(frame.height - reference[i].height), `${frame.frame} height`).toBeLessThanOrEqual(1);
      }
    });
  });
});
