// Shared fixtures for the website suite.
//
// - Every request that leaves the local server is answered with an empty stub (analytics, the live demo
//   iframes on GitHub Pages, ...). The suite then needs no network and the pages render the same each run.
// - `pageErrors` collects uncaught exceptions and console errors of the test's page. Specs assert on it.
import { test as base, expect, type BrowserContext, type Page } from '@playwright/test';

/** Pages that exist on today's site, with the trailing slash the build uses. */
export const PAGES = {
  home: '/',
  agentic: '/agentic/',
  blog: '/blog/',
  docs: '/docs/react/getting-started/quick-start/',
} as const;

const STUB_BODIES: Record<string, { contentType: string; body: string }> = {
  document: { contentType: 'text/html', body: '<!doctype html><title>stub</title>' },
  script: { contentType: 'application/javascript', body: '' },
  stylesheet: { contentType: 'text/css', body: '' },
};

type Fixtures = {
  pageErrors: string[];
};

/**
 * Answers every http(s) request that leaves `baseURL`'s origin with an empty stub of a fitting content
 * type. Used by the default context and by the min-font context (minFont.ts), so both behave the same.
 */
export async function stubExternal(context: BrowserContext, baseURL: string | undefined): Promise<void> {
  const origin = new URL(baseURL ?? 'http://localhost').origin;
  await context.route(
    (url) => url.origin !== origin && (url.protocol === 'http:' || url.protocol === 'https:'),
    (route) => {
      const stub = STUB_BODIES[route.request().resourceType()] ?? { contentType: 'text/plain', body: '' };
      return route.fulfill({ status: 200, contentType: stub.contentType, body: stub.body });
    },
  );
}

export const test = base.extend<Fixtures>({
  context: async ({ context, baseURL }, use) => {
    await stubExternal(context, baseURL);
    await use(context);
  },
  pageErrors: async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`console.error: ${message.text()}`);
    });
    await use(errors);
  },
});

export { expect };

/** Waits until the page has settled: network idle, web fonts loaded and every image decoded. */
export async function settle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images).map((image) =>
        image.complete ? Promise.resolve() : image.decode().catch(() => undefined),
      ),
    );
  });
}

/**
 * Prepares a page for a full-page screenshot: scrolls through it once so lazy images and in-view effects
 * have run, returns to the top and waits for everything to load. Then it waits (no fixed sleep) until
 * scroll-driven UI is back in its initial state, see waitForTopState.
 */
export async function prepareForScreenshot(page: Page): Promise<void> {
  await settle(page);
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y < document.scrollingElement!.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 30)));
    }
    window.scrollTo(0, 0);
  });
  await settle(page);
  await waitForTopState(page);
}

/**
 * Waits until the page is scrolled to the top and its scroll-driven UI has caught up, for several frames in
 * a row: window.scrollY is 0, the landing pages' floating navbar is hidden (the hero's IntersectionObserver
 * has removed `landing-nav-visible` from <html>, see Landing/Hero.tsx and Agentic/Hero.tsx) and no finite CSS
 * transition or animation is still running (the navbar fades out over 0.2 s; endless animations are
 * ignored, `animations: 'disabled'` freezes them for the shot). Requiring consecutive frames guards
 * against an observer entry queued before the jump to the top arriving one frame late.
 */
export async function waitForTopState(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as unknown as { __e2eStableFrames?: number }).__e2eStableFrames = 0;
  });
  await page.waitForFunction(
    () => {
      const w = window as unknown as { __e2eStableFrames?: number };
      const root = document.documentElement;
      const ok =
        window.scrollY === 0 &&
        !root.classList.contains('landing-nav-visible') &&
        document
          .getAnimations()
          .every(
            (animation) =>
              animation.playState !== 'running' || animation.effect?.getComputedTiming().iterations === Infinity,
          );
      w.__e2eStableFrames = ok ? (w.__e2eStableFrames ?? 0) + 1 : 0;
      if (!ok && window.scrollY !== 0) window.scrollTo(0, 0);
      return w.__e2eStableFrames >= 5;
    },
    undefined,
    { polling: 'raf', timeout: 10_000 },
  );
}

/**
 * Opens `path` for a screenshot. Media never plays: HTMLMediaElement.play() becomes a no-op, so videos
 * that autoplay when scrolled into view (the blog list thumbnails) keep showing their poster. Then the
 * page is prepared with prepareForScreenshot.
 */
export async function gotoForScreenshot(page: Page, path: string): Promise<void> {
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = function play() {
      return Promise.resolve();
    };
  });
  await page.goto(path);
  await prepareForScreenshot(page);
}

/**
 * Whether screenshots on this project capture the full page. Full-page shots are taken at the widest and
 * the common phone width (desktop-1440, phone-390); tablet-960 and phone-320 take the viewport only, which
 * still covers the first screen's layout at those widths but keeps the committed baselines small.
 */
export function fullPageFor(projectName: string): boolean {
  return projectName === 'desktop-1440' || projectName === 'phone-390';
}

/** The document's scroll width next to the viewport width. scrollWidth > innerWidth means horizontal scroll. */
export async function horizontalOverflow(page: Page): Promise<{ scrollWidth: number; innerWidth: number }> {
  return page.evaluate(() => ({
    scrollWidth: document.scrollingElement!.scrollWidth,
    innerWidth: window.innerWidth,
  }));
}
