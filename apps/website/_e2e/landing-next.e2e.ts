// Placeholder checks for the new landing page, previewed at /landing-next/ until the cutover (M9), when
// they move to "/". Skipped until the preview route exists (M3); later milestones enable them one by one:
//   - no pageerror / console errors                         (M3)
//   - no horizontal overflow at all four project widths     (M3, M4 onwards)
//   - FAQ accordion keyboard flow                           (M5)
//   - toolbar keyboard flow                                 (M7)
//   - navbar shown only after scrolling past the hero       (M7)
import { expect, horizontalOverflow, settle, test } from './fixtures';

const LANDING_NEXT = '/landing-next/';
const NOT_YET = 'the /landing-next/ preview does not exist yet (added in M3)';

test.describe('/landing-next/ (new landing page preview)', () => {
  test.skip(true, NOT_YET);

  test('loads without errors', async ({ page, pageErrors }) => {
    const response = await page.goto(LANDING_NEXT);
    expect(response?.status()).toBe(200);
    await settle(page);
    expect(pageErrors).toEqual([]);
  });

  test('has no horizontal overflow', async ({ page }) => {
    await page.goto(LANDING_NEXT);
    await settle(page);
    const { scrollWidth, innerWidth } = await horizontalOverflow(page);
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  });

  test('FAQ accordion works by keyboard', async () => {
    // M5: Tab to the first question, Enter/Space toggles it, aria-expanded follows, the answer is shown.
  });

  test('toolbar works by keyboard', async () => {
    // M7: Tab into the toolbar, activate a tool by keyboard, the hero jumps to that tool's turn.
  });

  test('navbar appears only after scrolling past the hero', async () => {
    // M7: the navbar is hidden at the top and shown once the hero header has left the viewport.
  });
});
