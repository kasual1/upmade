// Baseline screenshots of the landing pages: "/" (the config-driven landing page since the cutover, M9) and
// "/agentic/" (rebuilt on the same kit after M11). Update them on purpose when a landing page changes:
//   npm run e2e:website:update -- home-baseline
// The agents are placeholders while the agents stream finishes them (plan §0), so expect to update them with them.
import { PAGES, expect, fullPageFor, gotoForScreenshot, test } from './fixtures';

test('"/" baseline (the landing page)', async ({ page }, testInfo) => {
  await gotoForScreenshot(page, PAGES.home);
  await expect(page).toHaveScreenshot('home.png', { fullPage: fullPageFor(testInfo.project.name) });
});

test('"/agentic/" baseline (the agentic landing page)', async ({ page }, testInfo) => {
  await gotoForScreenshot(page, PAGES.agentic);
  await expect(page).toHaveScreenshot('agentic.png', { fullPage: fullPageFor(testInfo.project.name) });
});
