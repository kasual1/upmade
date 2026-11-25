// Baseline screenshot of "/", the config-driven landing page since the cutover (M9). Until then it held the
// pre-overhaul landing page. Update it on purpose when the landing page changes:
//   npm run e2e:website:update -- home-baseline
// The agents are placeholders while the agents stream finishes them (plan §0), so expect to update it with them.
import { PAGES, expect, fullPageFor, gotoForScreenshot, test } from './fixtures';

test('"/" baseline (the landing page)', async ({ page }, testInfo) => {
  await gotoForScreenshot(page, PAGES.home);
  await expect(page).toHaveScreenshot('home.png', { fullPage: fullPageFor(testInfo.project.name) });
});
