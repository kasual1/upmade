import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { infinitePage } from '../src/content/landing/infinite';
import { agenticPage } from '../src/content/landing/agentic';
import { LANDING_AGENTS } from '../src/components/LandingPage/agents';
import { MEDIA_KEYS } from '../src/components/LandingPage/media/manifest';
import { derivedIds, validateLandingConfig, type ValidateContext } from '../src/components/LandingPage/validate';
import type { LandingPageConfig, SectionConfig } from '../src/components/LandingPage/types';

const websiteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Whether docs/<framework>/<page>.md(x) exists, as Docusaurus would route /docs/<framework>/<page>. */
const docsExists: ValidateContext['docsExists'] = (framework, page) =>
  ['md', 'mdx'].some((ext) => fs.existsSync(path.join(websiteRoot, 'docs', framework, `${page}.${ext}`)));

const ctx: ValidateContext = { docsExists };

/** A copy of the real page with its sections replaced (configs are deeply readonly, so tests build new ones). */
function withSections(sections: readonly SectionConfig[]): LandingPageConfig {
  return { ...infinitePage, sections };
}

const real = infinitePage.sections as readonly SectionConfig[];
const hero = real.find((s) => s.type === 'hero')!;
const faq = real.find((s) => s.type === 'faq')!;
const showcase = real.find((s) => s.type === 'showcase')!;
const features = real.find((s) => s.type === 'featureGrid')!;

describe('the real page configs', () => {
  test('content/landing/infinite.ts is valid', () => {
    expect(validateLandingConfig(infinitePage, ctx)).toEqual([]);
  });

  test('every agent it uses is an /agent demo the landing adapter knows', () => {
    const used = real.flatMap((s) =>
      s.type === 'hero'
        ? [s.agent.key]
        : s.type === 'featureGrid'
          ? s.items.map((i) => i.agent.key)
          : s.type === 'showcase' && s.cornerAgent
            ? [s.cornerAgent.key]
            : [],
    );
    expect(used.length).toBeGreaterThan(0);
    for (const key of used) expect(Object.keys(LANDING_AGENTS), key).toContain(key);
  });

  test('has the design sections in order', () => {
    expect(real.map((s) => s.id)).toEqual(['hero', 'features', 'dom-canvas', 'get-started', 'performance', 'faq']);
  });

  test('content/landing/agentic.ts is valid, with the Agentic design sections in order', () => {
    expect(validateLandingConfig(agenticPage, ctx)).toEqual([]);
    expect(agenticPage.sections.map((s) => `${s.type}:${s.id}`)).toEqual([
      'agentHero:hero', 'featureGrid:features', 'showcase:genui', 'showcase:skill', 'showcase:customizable', 'faq:faq',
    ]);
  });
});

describe('validateLandingConfig rules', () => {
  test('duplicate section ids', () => {
    const errors = validateLandingConfig(withSections([...real, { ...faq, hidden: true }]), ctx);
    expect(errors.some((e) => e.includes('duplicate id "faq"'))).toBe(true);
  });

  test('a section id that collides with a derived id', () => {
    // a showcase called "faq-q-0" collides with the FAQ's first question id
    const errors = validateLandingConfig(withSections([...real, { ...showcase, id: 'faq-q-0' }]), ctx);
    expect(errors.some((e) => e.includes('duplicate id "faq-q-0"'))).toBe(true);
  });

  test('derived ids colliding between sections', () => {
    // a section "x" derives "x-heading", which a section with the id "x-heading" also claims
    const errors = validateLandingConfig(
      withSections([...real, { ...features, id: 'x' }, { ...showcase, id: 'x-heading' }]),
      ctx,
    );
    expect(errors.some((e) => e.includes('duplicate id "x-heading"'))).toBe(true);
  });

  test('derivedIds lists the heading and every FAQ question and answer', () => {
    expect(derivedIds(faq)).toEqual(['faq-heading', ...faq.items.flatMap((_, i) => [`faq-q-${i}`, `faq-a-${i}`])]);
    expect(derivedIds(showcase)).toEqual([`${showcase.id}-heading`]);
  });

  test('ids must be slugs', () => {
    const errors = validateLandingConfig(withSections([...real, { ...showcase, id: 'Bad Id' }]), ctx);
    expect(errors.some((e) => e.includes('must be a slug'))).toBe(true);
  });

  test('no hero', () => {
    const errors = validateLandingConfig(withSections(real.filter((s) => s.type !== 'hero')), ctx);
    expect(errors).toContain('a page needs exactly one visible hero section, found 0');
  });

  test('two heroes', () => {
    const errors = validateLandingConfig(withSections([...real, { ...hero, id: 'hero-2' }]), ctx);
    expect(errors).toContain('a page needs exactly one visible hero section, found 2');
  });

  test('a hidden hero does not count', () => {
    const errors = validateLandingConfig(withSections(real.map((s) => (s.type === 'hero' ? { ...s, hidden: true } : s))), ctx);
    expect(errors).toContain('a page needs exactly one visible hero section, found 0');
  });

  test('an unknown corner agent', () => {
    const bad = { ...showcase, cornerAgent: { ...showcase.cornerAgent!, key: 'nope' } } as unknown as SectionConfig;
    const errors = validateLandingConfig(withSections(real.map((s) => (s === showcase ? bad : s))), ctx);
    expect(errors.some((e) => e.includes('cornerAgent "nope" is not an agent'))).toBe(true);
  });

  test('a corner agent without body insets', () => {
    const bad = { ...showcase, cornerAgent: { ...showcase.cornerAgent!, key: 'squircle' } } as unknown as SectionConfig;
    const errors = validateLandingConfig(withSections(real.map((s) => (s === showcase ? bad : s))), ctx);
    expect(errors.some((e) => e.includes('corner agent "squircle" needs `body` insets'))).toBe(true);
  });

  test('an unknown feature agent', () => {
    const bad = { ...features, items: [{ ...features.items[0], agent: { key: 'nope' } }] } as unknown as SectionConfig;
    const errors = validateLandingConfig(withSections(real.map((s) => (s === features ? bad : s))), ctx);
    expect(errors.some((e) => e.includes('items[0].agent "nope" is not an agent'))).toBe(true);
  });

  test('an unknown hero agent (checked against the registered keys)', () => {
    const errors = validateLandingConfig(infinitePage, { ...ctx, agentKeys: Object.keys(LANDING_AGENTS).filter((k) => k !== 'toolCycle') });
    expect(errors.some((e) => e.includes('agent "toolCycle" is not an agent'))).toBe(true);
  });

  test('an unknown media key', () => {
    const bad = { ...showcase, media: { key: 'nope' } } as unknown as SectionConfig;
    const errors = validateLandingConfig(withSections(real.map((s) => (s === showcase ? bad : s))), ctx);
    expect(errors.some((e) => e.includes('media "nope" is not in the media registry'))).toBe(true);
    expect(MEDIA_KEYS.sort()).toEqual(['codeTyper', 'domCanvas', 'framesDemo', 'skillTerminal', 'starBoard', 'themes']);
  });

  test('a docs page missing for a framework', () => {
    const bad = { ...showcase, cta: { label: 'Nope', link: { kind: 'docs', path: 'advanced/does-not-exist' } } } as SectionConfig;
    const errors = validateLandingConfig(withSections(real.map((s) => (s === showcase ? bad : s))), ctx);
    expect(errors.some((e) => e.includes('docs page "advanced/does-not-exist" does not exist for react, vue, angular'))).toBe(true);
  });

  test('docs links anywhere in a section are checked (hero nav)', () => {
    const bad = {
      ...hero,
      nav: { ...hero.nav, links: [...hero.nav.links, { label: 'X', link: { kind: 'docs', path: 'nowhere' } }] },
    } as SectionConfig;
    const errors = validateLandingConfig(withSections(real.map((s) => (s === hero ? bad : s))), ctx);
    expect(errors.some((e) => e.includes('docs page "nowhere"'))).toBe(true);
  });

  test('docs paths are only checked with docsExists', () => {
    const bad = { ...showcase, cta: { label: 'Nope', link: { kind: 'docs', path: 'nowhere' } } } as SectionConfig;
    expect(validateLandingConfig(withSections(real.map((s) => (s === showcase ? bad : s))))).toEqual([]);
  });
});

describe('validateLandingConfig: agent ↔ media pairings (plan §3.5, M11)', () => {
  const typerShowcase = real.find((s) => s.type === 'showcase' && s.media.key === 'codeTyper')!;
  const domShowcase = real.find((s) => s.type === 'showcase' && s.media.key === 'domCanvas')!;

  test('a corner agent that emits none of the events its media listens to', () => {
    // the juggler has no events, the code typer listens to the sign's "flip"
    const bad = { ...typerShowcase, cornerAgent: { key: 'juggler', corner: 'br' } } as unknown as SectionConfig;
    const errors = validateLandingConfig(withSections(real.map((s) => (s === typerShowcase ? bad : s))), ctx);
    expect(errors).toContain(
      'section "get-started" (showcase): corner agent "juggler" emits none of the events its media "codeTyper" listens to (flip)',
    );
  });

  test('a corner agent whose events were renamed (checked against the given events)', () => {
    const errors = validateLandingConfig(infinitePage, { ...ctx, agentEvents: { frameworkSign: ['flipped'], cyclingGlasses: ['glassesOn'] } });
    expect(errors.some((e) => e.includes('corner agent "frameworkSign" emits none of the events'))).toBe(true);
    expect(errors.some((e) => e.includes('cyclingGlasses'))).toBe(false); // one matching event is enough
  });

  test('a media that listens to nothing takes any corner agent', () => {
    const quiet = { ...domShowcase, cornerAgent: { key: 'frameworkSign', corner: 'bl' } } as unknown as SectionConfig;
    expect(validateLandingConfig(withSections(real.map((s) => (s === domShowcase ? quiet : s))), ctx)).toEqual([]);
  });

  test('a synced hero toolbar with a tool the toolCycle agent never uses', () => {
    const errors = validateLandingConfig(infinitePage, {
      ...ctx,
      agentEvents: { toolCycle: ['tool:cursor', 'tool:pen', 'tool:eraser', 'tool:arrow', 'tool:type', 'tool:image'] },
    });
    expect(errors).toContain('section "hero" (hero): toolbar tools "shapeRectangle" are not "tool:*" events of the "toolCycle" agent');
  });

  test('an unsynced toolbar may show any tool', () => {
    if (hero.type !== 'hero') throw new Error('no hero');
    const unsynced = { ...hero, toolbar: { ...hero.toolbar!, syncWithAgent: false } } as SectionConfig;
    const errors = validateLandingConfig(withSections(real.map((s) => (s === hero ? unsynced : s))), { ...ctx, agentEvents: { toolCycle: [] } });
    expect(errors.filter((e) => e.includes('toolbar'))).toEqual([]);
  });
});
