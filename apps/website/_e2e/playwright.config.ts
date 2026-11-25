// Playwright suite for the website (apps/website). Run it from apps/website:
//
//   npm run e2e:website           # builds the site, serves build/ and runs every spec
//   npm run e2e:website:update    # the same, rewriting the screenshot baselines
//
// The web server serves the production build (`docusaurus serve`), never the dev server, so the pages are
// the ones that ship. Environment:
//   WEBSITE_E2E_PORT=4173         port for `docusaurus serve`
//   WEBSITE_E2E_SKIP_BUILD=1      serve the existing build/ instead of running `npm run build` first
//   WEBSITE_E2E_REUSE_SERVER=1    use a server that already listens on the port
//   WEBSITE_E2E_OUT_DIR=<dir>     build into / serve from <dir> (relative to apps/website) instead of build/
//
// Running several suites at once (parallel agents, a dev rebuilding while the suite runs): the port is fixed
// and reuseExistingServer is off, so a second run on the same port fails with "already used"; give each run
// its own WEBSITE_E2E_PORT. All runs also share build/ by default. If another process rebuilds it mid-run,
// the server answers 404 and screenshots come out as a viewport-sized 404 page. Give each run its own
// WEBSITE_E2E_OUT_DIR (e.g. build-e2e-<name>, add it to .gitignore's build-e2e-* pattern) to avoid that.
//
// Note: `npm run build` runs the blog thumbnail step, which can rewrite a blog post's front matter and its
// PNG under static/img/blog/. Don't commit those changes by accident.
import { defineConfig, devices } from '@playwright/test';
import { chromiumExecutable } from './browsers';

const PORT = Number(process.env.WEBSITE_E2E_PORT ?? 4173);
const BASE_URL = `http://localhost:${PORT}`;
const SKIP_BUILD = process.env.WEBSITE_E2E_SKIP_BUILD === '1';
const OUT_DIR = process.env.WEBSITE_E2E_OUT_DIR;
const BUILD_CMD = OUT_DIR ? `npm run build -- --out-dir ${OUT_DIR}` : 'npm run build';
const SERVE_CMD = `npx docusaurus serve --port ${PORT} --no-open${OUT_DIR ? ` --dir ${OUT_DIR}` : ''}`;
const headlessShell = chromiumExecutable('headless-shell');

const chrome = {
  ...devices['Desktop Chrome'],
  deviceScaleFactor: 1,
  launchOptions: headlessShell ? { executablePath: headlessShell } : {},
};

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // One retry: under CPU load (several workers at once) a screenshot can catch a frame-late observer or a
  // sub-pixel text shift (seen on the docs, blog and landing shots, never twice in a row). A real visual change
  // fails both tries, so it is still caught; Playwright reports a pass on retry as "flaky".
  retries: 1,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60_000,
  outputDir: './test-results',
  reporter: [['line'], ['html', { open: 'never', outputFolder: './playwright-report' }]],
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFileName}/{arg}-{projectName}-{platform}{ext}',
  expect: {
    // Repeated runs give identical pixels, so the comparison is strict on both axes:
    // - threshold: 0 makes any change of a pixel's colour count. Playwright's default (0.2, a YIQ distance)
    //   ignores moderate colour changes, e.g. footer link text going from #0a0a0a to #333333 passed.
    // - maxDiffPixels: 10 allows a handful of differing pixels, not a ratio: a ratio on 4000 px tall shots
    //   let footer colour/underline changes pass.
    // Override per call if a spec needs it.
    toHaveScreenshot: { threshold: 0, maxDiffPixels: 10, animations: 'disabled', caret: 'hide', scale: 'css' },
  },
  use: {
    baseURL: BASE_URL,
    trace: 'off',
    screenshot: 'only-on-failure',
    reducedMotion: 'reduce',
    colorScheme: 'light',
    locale: 'en-US',
    timezoneId: 'UTC',
  },
  projects: [
    { name: 'desktop-1440', use: { ...chrome, viewport: { width: 1440, height: 900 } } },
    { name: 'tablet-960', use: { ...chrome, viewport: { width: 960, height: 1024 } } },
    { name: 'phone-390', use: { ...chrome, viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: false } },
    { name: 'phone-320', use: { ...chrome, viewport: { width: 320, height: 640 }, hasTouch: true, isMobile: false } },
  ],
  webServer: {
    command: SKIP_BUILD ? SERVE_CMD : `${BUILD_CMD} && ${SERVE_CMD}`,
    cwd: '..',
    url: BASE_URL,
    reuseExistingServer: process.env.WEBSITE_E2E_REUSE_SERVER === '1',
    timeout: 300_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
