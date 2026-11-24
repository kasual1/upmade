// Asserts that the min-font technique of minFont.ts works: with the profile pref, Chromium clamps a 10px
// font to MIN_FONT_SIZE; without it (the default context) the font stays 10px.
// Later milestones use `minFontPage` to check that each MediaFrame's content stays inside its box.
import type { Page } from '@playwright/test';
import { PAGES } from './fixtures';
import { MIN_FONT_SIZE, expect, test } from './minFont';

async function measureTenPixelText(page: Page) {
  await page.goto(PAGES.blog);
  return page.evaluate(() => {
    const probe = document.createElement('span');
    probe.textContent = 'Minimum font probe';
    probe.style.cssText = 'font-size:10px;line-height:normal;display:inline-block;position:absolute;top:0;left:0';
    document.body.append(probe);
    const result = { fontSize: getComputedStyle(probe).fontSize, height: probe.getBoundingClientRect().height };
    probe.remove();
    return result;
  });
}

test.describe('minimum font size technique', () => {
  // The technique is browser-level, not width-dependent: one project is enough.
  test.skip(({ viewport }) => viewport?.width !== 1440, 'runs on desktop-1440 only');

  test('the default context keeps 10px text at 10px', async ({ page }) => {
    const { fontSize, height } = await measureTenPixelText(page);
    expect(fontSize).toBe('10px');
    expect(height).toBeLessThan(16);
  });

  test(`the min-font context clamps 10px text to ${MIN_FONT_SIZE}px`, async ({ minFontPage }) => {
    const { fontSize, height } = await measureTenPixelText(minFontPage);
    expect(fontSize).toBe(`${MIN_FONT_SIZE}px`);
    expect(height).toBeGreaterThanOrEqual(MIN_FONT_SIZE);
  });
});
