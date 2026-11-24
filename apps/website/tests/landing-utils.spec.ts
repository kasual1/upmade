import { describe, expect, test } from 'vitest';
import { buildFaqJsonLd, buildSoftwareAppJsonLd, jsonLdText, stripBackticks } from '../src/components/LandingPage/seo';
import { resolveLink, type LinkContext } from '../src/components/LandingPage/links';
import { FAQ_ITEMS } from '../src/content/landing/faq';
import { NPM_URL, REPO_URL } from '../src/components/Brand/links';

describe('buildFaqJsonLd', () => {
  test('one Question per item, with its answer', () => {
    const data = buildFaqJsonLd({ items: FAQ_ITEMS });
    expect(data['@type']).toBe('FAQPage');
    expect(data.mainEntity).toHaveLength(FAQ_ITEMS.length);
    data.mainEntity.forEach((entry, i) => {
      expect(entry).toEqual({
        '@type': 'Question',
        name: FAQ_ITEMS[i].q,
        acceptedAnswer: { '@type': 'Answer', text: FAQ_ITEMS[i].a },
      });
    });
  });

  test('strips backticks from code spans', () => {
    const data = buildFaqJsonLd({ items: [{ q: 'What does `addObject` do?', a: 'Call `addObject(obj)`, then `` ` ``.' }] });
    expect(data.mainEntity[0].name).toBe('What does addObject do?');
    expect(data.mainEntity[0].acceptedAnswer.text).not.toContain('`');
    expect(stripBackticks('use `isWatermarkVisible`')).toBe('use isWatermarkVisible');
  });

  test('serialises as parseable JSON that cannot close its script tag', () => {
    const text = jsonLdText(buildFaqJsonLd({ items: [{ q: 'a</script><b>', a: 'x' }] }));
    expect(text).not.toContain('</script>');
    expect(JSON.parse(text).mainEntity[0].name).toBe('a</script><b>');
  });
});

describe('buildSoftwareAppJsonLd', () => {
  test('describes the library with its repository and package', () => {
    const data = buildSoftwareAppJsonLd({ url: 'https://upmade.io/', description: 'd' });
    expect(data).toMatchObject({ '@type': 'SoftwareApplication', name: 'Upmade', url: 'https://upmade.io/', description: 'd' });
    expect(data.sameAs).toEqual([REPO_URL, NPM_URL]);
  });
});

describe('resolveLink', () => {
  const ctx: LinkContext = { framework: 'react', appUrl: 'https://app.upmade.io' };

  test('docs: the preferred framework\'s quick start, or a page', () => {
    expect(resolveLink({ kind: 'docs' }, ctx)).toEqual({ href: '/docs/react/getting-started/quick-start', external: false });
    expect(resolveLink({ kind: 'docs' }, { ...ctx, framework: 'vue' }).href).toBe('/docs/vue/getting-started/quick-start');
    expect(resolveLink({ kind: 'docs', path: 'advanced/dynamic-objects' }, { ...ctx, framework: 'angular' })).toEqual({
      href: '/docs/angular/advanced/dynamic-objects',
      external: false,
    });
    expect(resolveLink({ kind: 'docs', path: '/examples/performance-showcase/' }, ctx).href).toBe('/docs/react/examples/performance-showcase');
  });

  test('app: the app URL, with an optional path', () => {
    expect(resolveLink({ kind: 'app' }, ctx)).toEqual({ href: 'https://app.upmade.io', external: true });
    expect(resolveLink({ kind: 'app', path: 'new' }, { ...ctx, appUrl: 'https://app.upmade.io/' }).href).toBe('https://app.upmade.io/new');
  });

  test('route: baseUrl-aware', () => {
    const withBaseUrl = (p: string) => `/upmade${p}`;
    expect(resolveLink({ kind: 'route', to: '/agentic' }, ctx)).toEqual({ href: '/agentic', external: false });
    expect(resolveLink({ kind: 'route', to: '/agentic' }, { ...ctx, withBaseUrl }).href).toBe('/upmade/agentic');
    expect(resolveLink({ kind: 'route', to: 'blog' }, { ...ctx, withBaseUrl }).href).toBe('/upmade/blog');
    expect(resolveLink({ kind: 'docs' }, { ...ctx, withBaseUrl }).href).toBe('/upmade/docs/react/getting-started/quick-start');
  });

  test('external: as it is, never prefixed', () => {
    const withBaseUrl = (p: string) => `/upmade${p}`;
    expect(resolveLink({ kind: 'external', href: REPO_URL }, { ...ctx, withBaseUrl })).toEqual({ href: REPO_URL, external: true });
  });
});
