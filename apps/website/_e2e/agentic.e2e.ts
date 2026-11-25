// Checks for the agentic landing page at "/agentic/" (src/content/landing/agentic.ts on the LandingPage kit):
//   - no pageerror / console errors, server-rendered structure, unique ids, FAQ answers matching the JSON-LD
//   - no horizontal overflow at all four project widths
//   - navbar shown only after scrolling past the hero
//   - the chat demo works by keyboard: the scripted prompts run on Enter and the agent builds the GitHub card
//   - with the minimum font size (minFont.ts), each media frame keeps its content in its box
import { PAGES, THIRD_PARTY_ANALYTICS, expect, horizontalOverflow, mediaFrames, scrollThrough, settle, test } from './fixtures';
import { expect as minFontExpect, test as minFontTest } from './minFont';

const AGENTIC = PAGES.agentic;

test.describe('"/agentic/" (the agentic landing page)', () => {
  test('loads without errors', async ({ page, pageErrors }) => {
    const response = await page.goto(AGENTIC);
    expect(response?.status()).toBe(200);
    await settle(page);
    await scrollThrough(page);
    await page.waitForTimeout(500);
    expect(pageErrors.filter((error) => !THIRD_PARTY_ANALYTICS.test(error))).toEqual([]);
  });

  test('is server-rendered with one h1 and the page structure', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
    const page = await context.newPage();
    await page.goto(AGENTIC);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Agentic Canvas Development Kit');
    await expect(page.locator('main[data-lp-page]')).toHaveCount(1);
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
    for (const id of ['hero', 'features', 'genui', 'skill', 'customizable', 'faq']) {
      await expect(page.locator(`section[aria-labelledby="${id}-heading"] #${id}-heading`)).toHaveCount(1);
    }
    // the chat box is in the server HTML
    await expect(page.locator('section[aria-labelledby="hero-heading"] form input')).toHaveCount(1);
    await expect(page.locator('footer')).toHaveCount(1);
    await expect(page.locator('.footer')).toHaveCount(0);
    const duplicateIds = await page.evaluate(() => {
      const ids = Array.from(document.querySelectorAll('[id]'), (el) => el.id);
      return ids.filter((id, i) => ids.indexOf(id) !== i);
    });
    expect(duplicateIds).toEqual([]);
    const faq = await page.evaluate(() => {
      const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'), (s) => JSON.parse(s.textContent ?? 'null'));
      const entry = ld.find((e) => e?.['@type'] === 'FAQPage');
      const norm = (t: string) => t.replace(/\s+/g, ' ').trim();
      return {
        jsonLd: (entry?.mainEntity ?? []).map((q: { acceptedAnswer: { text: string } }) => norm(q.acceptedAnswer.text)),
        answers: Array.from(document.querySelectorAll('section[aria-labelledby="faq-heading"] [role="region"]'), (r) => norm(r.textContent ?? '')),
      };
    });
    expect(faq.answers.length).toBe(5);
    expect(faq.answers).toEqual(faq.jsonLd);
    await context.close();
  });

  test('has no horizontal overflow', async ({ page }) => {
    await page.goto(AGENTIC);
    await settle(page);
    await scrollThrough(page);
    const { scrollWidth, innerWidth } = await horizontalOverflow(page);
    expect(scrollWidth, `scrollWidth ${scrollWidth} > innerWidth ${innerWidth}`).toBeLessThanOrEqual(innerWidth);
  });

  test('navbar appears only after scrolling past the hero', async ({ page }) => {
    await page.goto(AGENTIC);
    await settle(page);
    const html = page.locator('html');
    const navbar = page.locator('.navbar').first();
    await expect(html).not.toHaveClass(/landing-nav-visible/);
    await expect(navbar).toBeHidden();
    await page.evaluate(() => {
      const header = document.querySelector('section[aria-labelledby="hero-heading"] header')!;
      window.scrollTo(0, header.getBoundingClientRect().bottom + window.scrollY + 10);
    });
    await expect(html).toHaveClass(/landing-nav-visible/);
    await expect(navbar).toBeVisible();
    await expect(navbar.locator('.navbar__inner a.navbar__brand[aria-label="upmade.io home"] [data-part="outline"]')).toHaveCount(1);
  });

  test('the chat demo works by keyboard and builds the GitHub card', async ({ page }) => {
    // reduced motion (the suite's default) places each result at once, so the flow is quick and deterministic
    await page.goto(AGENTIC);
    await settle(page);
    const hero = page.locator('section[aria-labelledby="hero-heading"]');
    const input = hero.locator('form input');
    const send = hero.locator('form button[type="submit"]');
    await input.focus();
    // the three scripted prompts: each is put in the box and runs on Enter
    for (const prompt of ['Welcome', 'This is upmade.io', 'GitHub']) {
      await expect(input).toHaveValue(new RegExp(prompt));
      await page.keyboard.press('Enter');
    }
    // the card the agent generated (the header's GitHub icon links to the same URL, so scope to the card)
    const card = hero.locator('[aria-label^="GitHub card"]');
    await expect(card).toHaveCount(1, { timeout: 15_000 });
    await expect(card.locator('a[href="https://github.com/kasual1/upmade"]')).toHaveCount(1);
    await expect(hero.getByText('This is upmade.io', { exact: false }).first()).toBeVisible();
    // after the last prompt the send button restarts the demo
    await expect(send).toHaveAttribute('aria-label', 'Restart demo', { timeout: 10_000 });
    // a free-text "clear" removes the board objects and brings the title back
    await input.focus();
    await input.fill('clear');
    await page.keyboard.press('Enter');
    await expect(card).toHaveCount(0, { timeout: 10_000 });
    // the title is back (cleared, it is laid out but at opacity 0, which toBeVisible() would not catch)
    await expect.poll(() => page.locator('h1').evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  });
});

test.describe('"/agentic/" with motion', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('pressing Enter twice on every prompt never runs a step twice', async ({ page }) => {
    // Enter twice in a row whenever a prompt waits in the box: the second press can land while the step still plays
    // or while the next prompt is being typed (that sends it early, by design); every step must still run once
    test.setTimeout(90_000);
    await page.goto(AGENTIC);
    await settle(page);
    const hero = page.locator('section[aria-labelledby="hero-heading"]');
    const input = hero.locator('form input');
    const send = hero.locator('form button[type="submit"]');
    const card = hero.locator('[aria-label^="GitHub card"]');
    await input.focus();
    const until = Date.now() + 60_000;
    while ((await card.count()) === 0 && Date.now() < until) {
      const ready = (await input.inputValue()).trim() !== '' && (await send.getAttribute('aria-label')) === 'Send' && (await send.isEnabled());
      if (ready) {
        await page.keyboard.press('Enter');
        await page.keyboard.press('Enter');
      }
      await page.waitForTimeout(120);
    }
    await expect(card).toHaveCount(1);
    await page.waitForTimeout(3000); // anything queued twice would have run by now
    await expect(card).toHaveCount(1);
    await expect(hero.locator('[aria-label^="Text: This is upmade.io"]')).toHaveCount(1);
    await expect(hero.locator('[aria-label^="Hand-drawn “Welcome”"]')).toHaveCount(1);
  });
});

minFontTest.describe('"/agentic/" with a minimum font size', () => {
  minFontTest('each media frame keeps its content inside its box', async ({ page, minFontPage }) => {
    await page.goto(AGENTIC);
    await settle(page);
    await scrollThrough(page);
    const reference = await mediaFrames(page);
    await minFontPage.goto(AGENTIC);
    await settle(minFontPage);
    await scrollThrough(minFontPage);
    const clamped = await mediaFrames(minFontPage);
    minFontExpect(clamped.length).toBe(reference.length);
    minFontExpect(clamped.length).toBe(3);
    clamped.forEach((frame, i) => {
      minFontExpect(frame.outside, `${frame.frame}: content outside the frame`).toEqual([]);
      if (reference[i].aspect) {
        minFontExpect(Math.abs(frame.width - reference[i].width), `${frame.frame} width`).toBeLessThanOrEqual(1);
        minFontExpect(Math.abs(frame.height - reference[i].height), `${frame.frame} height`).toBeLessThanOrEqual(1);
      }
    });
  });
});
