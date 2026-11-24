import { describe, expect, test } from 'vitest';
import config from '../docusaurus.config';
import {
  REPO_SLUG,
  REPO_URL,
  SKILL_INSTALL_COMMAND,
  SKILL_REPO,
  SOCIAL_LINKS,
} from '../src/components/Brand/links';
import { toDocusaurusFooterItem } from '../src/components/LandingPage/chrome/LandingFooter/links';

type FooterColumn = { title: string; items: Array<{ html?: string; label?: string; href?: string; rel?: string }> };
type NavbarItem = { label?: string; href?: string };

const themeConfig = config.themeConfig as {
  footer: { links: FooterColumn[] };
  navbar: { items: NavbarItem[] };
};

describe('Brand/links', () => {
  test('the repository and skill names', () => {
    expect(REPO_SLUG).toBe('kasual1/upmade');
    expect(REPO_URL).toBe('https://github.com/kasual1/upmade');
    expect(SKILL_REPO).toBe(REPO_SLUG);
    expect(SKILL_INSTALL_COMMAND).toBe('npx skills add kasual1/upmade');
  });

  test('social links are absolute https URLs with unique labels', () => {
    expect(new Set(SOCIAL_LINKS.map((link) => link.label)).size).toBe(SOCIAL_LINKS.length);
    for (const link of SOCIAL_LINKS) {
      expect(new URL(link.href).protocol).toBe('https:');
      expect(link.rel).toContain('noopener');
      expect(link.rel).toContain('noreferrer');
    }
  });

  // The footer's Community column is built from SOCIAL_LINKS as {label, href, rel} items; theme/Footer/Links
  // (toDocusaurusFooterItem) must render exactly the markup the raw-HTML items had before.
  test('the footer Community column is built from SOCIAL_LINKS, unchanged', () => {
    const community = themeConfig.footer.links.find((column) => column.title === 'Community');
    expect(community?.items).toEqual(SOCIAL_LINKS.map(({ label, href, rel }) => ({ label, href, rel })));
    expect(community?.items.map((item) => (toDocusaurusFooterItem(item) as { html?: string }).html)).toEqual([
      '<a href="https://x.com/upmade_io" target="_blank" rel="noopener noreferrer" class="footer__link-item">X</a>',
      '<a href="https://www.linkedin.com/in/upmade-io-26721b40b" target="_blank" rel="noopener noreferrer" class="footer__link-item">LinkedIn</a>',
      '<a href="https://mastodon.social/@upmade" target="_blank" rel="me noopener noreferrer" class="footer__link-item">Mastodon</a>',
      '<a href="https://bsky.app/profile/upmade.bsky.social" target="_blank" rel="noopener noreferrer" class="footer__link-item">Bluesky</a>',
      '<a href="https://github.com/kasual1/upmade" target="_blank" rel="noopener noreferrer" class="footer__link-item">GitHub</a>',
      '<a href="https://www.npmjs.com/package/@upmade/core" target="_blank" rel="noopener noreferrer" class="footer__link-item">NPM</a>',
    ]);
  });

  test('the navbar GitHub link points at REPO_URL', () => {
    const github = themeConfig.navbar.items.find((item) => item.label === 'GitHub');
    expect(github?.href).toBe(REPO_URL);
  });
});
