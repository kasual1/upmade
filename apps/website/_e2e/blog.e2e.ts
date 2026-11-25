// Checks for the blog, restyled to match the landing pages (src/css/blog.css, theme/BlogListPage, BlogArchivePage,
// BlogPostItem, Navbar → BlogHeader, Footer → LandingFooter): each page type loads without errors (the post page
// once crashed when the header stopped rendering a `.navbar`, which Docusaurus' table of contents measures), has one
// h1, the landing header and footer, and no horizontal overflow; posts keep their table of contents on wide screens.
import { PAGES, THIRD_PARTY_ANALYTICS, expect, horizontalOverflow, scrollThrough, settle, test } from './fixtures';

const BLOG_PAGES = [
  ['list', PAGES.blog],
  ['post', PAGES.blogPost],
  ['archive', PAGES.blogArchive],
] as const;

test.describe('the blog', () => {
  for (const [name, path] of BLOG_PAGES) {
    test(`${name} (${path}) loads without errors, with the landing header and footer`, async ({ page, pageErrors }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await settle(page);
      await scrollThrough(page);
      await page.waitForTimeout(300);
      expect(pageErrors.filter((error) => !THIRD_PARTY_ANALYTICS.test(error))).toEqual([]);
      await expect(page.locator('h1')).toHaveCount(1);
      // the header: the new logo (the pink agent and "upmade.io") and the nav
      await expect(page.locator('header a[aria-label="upmade.io home"] [data-part="outline"]').first()).toBeVisible();
      await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
      // one footer, the landing footer; no Docusaurus footer and no wordmark
      await expect(page.locator('footer.footer')).toHaveCount(0);
      await expect(page.locator('[data-wordmark], .blog-footer-wordmark')).toHaveCount(0);
      await expect(page.locator('footer a[aria-label="upmade.io home"]')).toHaveCount(1);
      const { scrollWidth, innerWidth } = await horizontalOverflow(page);
      expect(scrollWidth, `scrollWidth ${scrollWidth} > innerWidth ${innerWidth}`).toBeLessThanOrEqual(innerWidth);
    });
  }

  test('a post keeps its table of contents beside the text on wide screens', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-1440', 'the table of contents is shown from 997px');
    await page.goto(PAGES.blogPost);
    await settle(page);
    const toc = page.locator('.table-of-contents').first();
    await expect(toc).toBeVisible();
    const [article, list] = await Promise.all([page.locator('main article').boundingBox(), toc.boundingBox()]);
    // beside the article, not wrapped below it
    expect(list!.y).toBeLessThan(article!.y + 200);
    expect(list!.x).toBeGreaterThan(article!.x + article!.width);
  });
});
