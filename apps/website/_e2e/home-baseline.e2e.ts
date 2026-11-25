// Baseline screenshots of the landing pages: "/" (the config-driven landing page since the cutover, M9),
// "/agentic/" (rebuilt on the same kit after M11), the blog (restyled to match: the list, a post, the archive) and
// one docs page per framework (restyled to match, in the colour of each framework's agent; the docs were guarded as
// unchanged by regression-guard.e2e.ts until then).
// Update them on purpose when one of them changes:
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

for (const [name, path] of [
  ['blog', PAGES.blog],
  ['blog-post', PAGES.blogPost],
  ['blog-archive', PAGES.blogArchive],
] as const) {
  test(`"${path}" baseline (the blog)`, async ({ page }, testInfo) => {
    await gotoForScreenshot(page, path);
    // the post plays its videos (autoplay), which never hold still for a screenshot: they are masked
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: fullPageFor(testInfo.project.name),
      mask: [page.locator('main video')],
    });
  });
}

for (const [name, path] of [
  ['docs-react', PAGES.docs],
  ['docs-vue', PAGES.docsVue],
  ['docs-angular', PAGES.docsAngular],
] as const) {
  test(`"${path}" baseline (the docs)`, async ({ page }, testInfo) => {
    await gotoForScreenshot(page, path);
    // the live demos (the editor) are not part of the docs' styling and render a canvas: they are masked
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: fullPageFor(testInfo.project.name),
      mask: [page.locator('[data-live-demo]')],
    });
  });
}
