// Baseline screenshot of TODAY's "/" (the page before the landing overhaul).
//
// This one is expected to change: at the cutover milestone (M9) "/" becomes the new landing page. Then
// update these baselines on purpose with
//   npm run e2e:website:update -- home-baseline
// (or replace this spec with the new page's screenshots). Until then it guards "/" against accidental
// changes from the groundwork milestones.
import { PAGES, expect, fullPageFor, gotoForScreenshot, test } from './fixtures';

test('"/" baseline (pre-overhaul landing page)', async ({ page }, testInfo) => {
  await gotoForScreenshot(page, PAGES.home);
  await expect(page).toHaveScreenshot('home.png', { fullPage: fullPageFor(testInfo.project.name) });
});
