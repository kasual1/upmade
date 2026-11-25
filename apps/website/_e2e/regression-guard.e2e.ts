// Regression guard: screenshots of the pages the landing overhaul must not change visually (the blog index
// and one docs page): full page at 1440 and 390, viewport only at 960 and 320 (fullPageFor).
// The baselines were taken in M0 against the site before the overhaul. A diff here means a change leaked
// out of the landing pages; fix the leak, don't update. (/agentic/ was guarded too until it was rebuilt on the
// landing kit; it now has its own baseline in home-baseline.e2e.ts, like "/".)
//
// What each page covers: /blog/ renders the sitewide footer (.footer, .footer__link-item, ...).
// Docs pages render no site footer (src/theme/Footer returns null under /docs); the docs shot instead
// covers the navbar, the docs sidebar, the content column and its DocsFootnote (src/theme/DocItem/Paginator).
// So a leak into the sitewide footer is caught by the blog shots, not the docs ones.
//
// Stabilised with reducedMotion: 'reduce' (config), CSS animations disabled, media playback disabled
// (gotoForScreenshot), a scroll pass that loads lazy content and a wait for the scroll-driven UI to return
// to its top-of-page state (waitForTopState). The tolerance is a few pixels (config), so colour, underline
// or spacing changes in sitewide chrome fail too. Elements that would still animate from JS are masked,
// see MASKS (none were needed in M0: repeated runs gave identical pixels).
import { PAGES, expect, fullPageFor, gotoForScreenshot, test } from './fixtures';

// No retry here (the suite allows one elsewhere): an intermittent leak into these pages must fail, not pass as flaky.
test.describe.configure({ retries: 0 });

const GUARDED = {
  blog: PAGES.blog,
  docs: PAGES.docs,
} as const;

/**
 * Selectors masked per page: content that moves or changes on its own between runs. Intentionally empty
 * today; it is the place to add a mask if a later change makes a guarded page nondeterministic.
 */
const MASKS: Record<keyof typeof GUARDED, string[]> = {
  blog: [],
  docs: [],
};

for (const [name, path] of Object.entries(GUARDED) as [keyof typeof GUARDED, string][]) {
  test(`${name} (${path}) looks unchanged`, async ({ page }, testInfo) => {
    await gotoForScreenshot(page, path);
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: fullPageFor(testInfo.project.name),
      mask: MASKS[name].map((selector) => page.locator(selector)),
    });
  });
}
