// Checks for the docs, restyled to match the landing pages (src/css/docs.css): each framework's docs paint their
// framework-specific UI in the colour of that framework's agent (Angular: the pink squircle, React: the blue circle,
// Vue: the green triangle; the text shades are darker variants that pass WCAG AA on white), the pages load without
// errors or horizontal overflow, and the live demos keep their own styling (they are not restyled yet).
import { PAGES, THIRD_PARTY_ANALYTICS, expect, horizontalOverflow, settle, test } from './fixtures';

const FRAMEWORKS = [
  // framework, a page of its docs, the accent's text shade (links, the active sidebar item) as rgb
  ['angular', PAGES.docsAngular, 'rgb(193, 5, 100)'],
  ['react', PAGES.docs, 'rgb(5, 107, 180)'],
  ['vue', PAGES.docsVue, 'rgb(25, 121, 60)'],
] as const;

test.describe('the docs', () => {
  for (const [framework, path, accentText] of FRAMEWORKS) {
    test(`${framework} (${path}) uses its agent's colour and has no overflow`, async ({ page, pageErrors }, testInfo) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await settle(page);
      expect(pageErrors.filter((error) => !THIRD_PARTY_ANALYTICS.test(error))).toEqual([]);
      await expect(page.locator('html')).toHaveClass(new RegExp(`plugin-id-${framework}`));

      // a link in the text
      const link = page.locator('article .markdown a:not([data-live-demo] *)').first();
      await expect(link).toHaveCSS('color', accentText);

      // the active item of the sidebar (shown from 997px; below that it is in the menu)
      if (testInfo.project.name === 'desktop-1440') {
        const active = page.locator('.theme-doc-sidebar-container .menu__link--active:not(.menu__link--sublist)');
        await expect(active).toHaveCount(1);
        await expect(active).toHaveCSS('color', accentText);
      }

      const { scrollWidth, innerWidth } = await horizontalOverflow(page);
      expect(scrollWidth, `scrollWidth ${scrollWidth} > innerWidth ${innerWidth}`).toBeLessThanOrEqual(innerWidth);
    });

    test(`${framework}'s live demo keeps its own text styling`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop-1440', 'one viewport is enough for computed styles');
      await page.goto(`/docs/${framework}/customization/themes/`);
      await settle(page);
      const demo = page.locator('[data-live-demo]').first();
      await expect(demo).toBeAttached();
      // the docs' text is 17px; the demos keep the size they had before the restyle (1.2rem)
      const rootSize = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
      await expect(demo).toHaveCSS('font-size', `${rootSize * 1.2}px`);
    });
  }
});
