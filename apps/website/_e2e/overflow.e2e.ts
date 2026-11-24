// No horizontal scroll on "/" at any project width (1440, 960, 390, 320).
// Today's "/" passes at all four widths (checked in M0); the new landing page must keep it that way.
import { PAGES, expect, horizontalOverflow, settle, test } from './fixtures';

test('"/" has no horizontal overflow', async ({ page }) => {
  await page.goto(PAGES.home);
  await settle(page);
  const { scrollWidth, innerWidth } = await horizontalOverflow(page);
  expect(scrollWidth, `scrollWidth ${scrollWidth} > innerWidth ${innerWidth}`).toBeLessThanOrEqual(innerWidth);
});
