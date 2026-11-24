// Smoke test: today's main page types load without uncaught exceptions or console errors.
// Limit: fixtures.ts answers every off-origin request (analytics, demo iframes, ...) with an empty stub, so
// errors raised by real third-party scripts are not covered here; only the site's own code is.
import { PAGES, expect, settle, test } from './fixtures';

for (const [name, path] of Object.entries(PAGES)) {
  test(`${name} (${path}) loads without errors`, async ({ page, pageErrors }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await settle(page);
    // Give effects and timers that start after hydration a moment to run.
    await page.waitForTimeout(500);
    expect(pageErrors).toEqual([]);
  });
}
