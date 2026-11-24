// Checks for the new landing page, previewed at /landing-next/ until the cutover (M9), when they move to "/".
// The preview exists since M3; the checks still marked fixme are enabled by the milestones listed here:
//   - no pageerror / console errors                         (M3)
//   - no horizontal overflow at all four project widths     (M3, M4 onwards)
//   - FAQ accordion keyboard flow                           (M5)
//   - toolbar keyboard flow                                 (M7)
//   - navbar shown only after scrolling past the hero       (M7)
import { expect, horizontalOverflow, settle, test } from './fixtures';

const LANDING_NEXT = '/landing-next/';

test.describe('/landing-next/ (new landing page preview)', () => {
  test('loads without errors', async ({ page, pageErrors }) => {
    const response = await page.goto(LANDING_NEXT);
    expect(response?.status()).toBe(200);
    await settle(page);
    // Give effects and timers that start after hydration a moment to run.
    await page.waitForTimeout(500);
    expect(pageErrors).toEqual([]);
  });

  test('is server-rendered with one h1 and the page structure', async ({ browser, baseURL }) => {
    // with scripts off, the page is what the server sent
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
    const page = await context.newPage();
    await page.goto(LANDING_NEXT);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main[data-lp-page]')).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
    for (const id of ['hero', 'features', 'dom-canvas', 'get-started', 'performance', 'faq']) {
      await expect(page.locator(`section[aria-labelledby="${id}-heading"] #${id}-heading`)).toHaveCount(1);
    }
    await context.close();
  });

  test('has no horizontal overflow', async ({ page }) => {
    await page.goto(LANDING_NEXT);
    await settle(page);
    const { scrollWidth, innerWidth } = await horizontalOverflow(page);
    expect(scrollWidth, `scrollWidth ${scrollWidth} > innerWidth ${innerWidth}`).toBeLessThanOrEqual(innerWidth);
  });

  test.fixme('FAQ accordion works by keyboard', async () => {
    // M5: Tab to the first question, Enter/Space toggles it, aria-expanded follows, the answer is shown.
  });

  test.fixme('toolbar works by keyboard', async () => {
    // M7: Tab into the toolbar, activate a tool by keyboard, the hero jumps to that tool's turn.
  });

  test.fixme('navbar appears only after scrolling past the hero', async () => {
    // M7: the navbar is hidden at the top and shown once the hero header has left the viewport.
  });
});
