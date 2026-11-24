// Minimum font size in Chromium, like Chrome's "Minimum font size" setting and the clamping that Android
// WebViews (Instagram, Facebook, LinkedIn) apply.
//
// FINDING (M0, Playwright 1.65, Chromium build 1243):
// - Works: a persistent context (chromium.launchPersistentContext) whose user-data-dir holds
//   Default/Preferences = {"webkit":{"webprefs":{"minimum_font_size":24}}}, launched with the FULL Chromium
//   binary (new headless mode). Chromium reads the profile's prefs at start-up; an element styled
//   `font-size:10px` then reports getComputedStyle(...).fontSize === "24px" and lays out at that size.
// - Does not work: the same profile with chrome-headless-shell, the binary Playwright uses by default for
//   headless Chromium. The shell has no profile/prefs service and ignores the file (10px stays 10px).
//   So the fixture always launches full Chromium (channel "chromium", or its executable via browsers.ts).
// - Not needed: `minimum_logical_font_size`, command-line switches or CDP; Page.setFontSizes only sets
//   the standard/fixed defaults, not the minimum.
// min-font.e2e.ts asserts the technique itself, so a Playwright/Chromium upgrade that breaks it fails loudly.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { BrowserContext, Page } from '@playwright/test';
import { chromiumExecutable } from './browsers';
import { test as base, stubExternal } from './fixtures';

export const MIN_FONT_SIZE = 24;

/** Writes a fresh Chromium profile whose prefs enforce `minimumFontSize` and returns its directory. */
export function createMinFontProfile(minimumFontSize = MIN_FONT_SIZE): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'website-e2e-minfont-'));
  fs.mkdirSync(path.join(dir, 'Default'));
  fs.writeFileSync(
    path.join(dir, 'Default', 'Preferences'),
    JSON.stringify({ webkit: { webprefs: { minimum_font_size: minimumFontSize } } }),
  );
  return dir;
}

type MinFontFixtures = {
  /** A context of full Chromium with the minimum font size set, configured like the project's context. */
  minFontContext: BrowserContext;
  /** A page in minFontContext. External requests are stubbed like in the default context. */
  minFontPage: Page;
};

export const test = base.extend<MinFontFixtures>({
  minFontContext: async (
    { playwright, baseURL, viewport, reducedMotion, colorScheme, locale, timezoneId, hasTouch },
    use,
  ) => {
    const userDataDir = createMinFontProfile();
    const executablePath = chromiumExecutable('chromium');
    const context = await playwright.chromium.launchPersistentContext(userDataDir, {
      ...(executablePath ? { executablePath } : { channel: 'chromium' }),
      headless: true,
      baseURL,
      viewport,
      reducedMotion,
      colorScheme,
      locale,
      timezoneId,
      hasTouch,
    });
    await stubExternal(context, baseURL);
    try {
      await use(context);
    } finally {
      await context.close();
      fs.rmSync(userDataDir, { recursive: true, force: true });
    }
  },
  minFontPage: async ({ minFontContext }, use) => {
    const page = minFontContext.pages()[0] ?? (await minFontContext.newPage());
    await use(page);
  },
});

export { expect } from './fixtures';
