/**
 * Checks a landing page config for mistakes TypeScript cannot see (plan §5). Pure: returns one message per problem,
 * an empty list for a valid config. tests/landing-config.spec.ts runs it on every page config (with `docsExists`
 * reading docs/ from disk); LandingPage.tsx logs its messages as a warning in development.
 *
 * Rules:
 * - section ids are unique, are slugs (lower-case letters, digits, dashes) and so are the element ids derived from
 *   them (`${id}-heading`, the FAQ's `${id}-q-${i}` / `${id}-a-${i}`): no two collide across the page
 * - exactly one visible hero (the page's only h1)
 * - every agent key (hero agent, feature agents, corner agents) is in LandingPage/agents.ts
 * - every media key is in the media registry
 * - every docs link with a path names a page that exists for React, Vue and Angular (with `ctx.docsExists`)
 * - a showcase's corner agent emits at least one event its media `listens` to (media/manifest.ts), when the media
 *   listens to any: the pairing would otherwise never fire (agents.ts AGENT_EVENTS)
 * - a hero toolbar synced with its agent (`toolbar.syncWithAgent`) only has tools the toolCycle agent emits a
 *   `tool:*` event for: the others could never be selected by the agent, nor jumped to
 */
import { AGENT_EVENTS, LANDING_AGENTS } from "./agents";
import { MEDIA_MANIFEST } from "./media/manifest";
import type { Framework } from "../../utils/frameworkPreference";
import type { LandingPageConfig, LinkRef, SectionConfig } from "./types";

export const DOCS_FRAMEWORKS: readonly Framework[] = ["react", "vue", "angular"];

export interface ValidateContext {
  /** whether docs/<framework>/<path>(.md|.mdx) exists; without it docs paths are not checked */
  docsExists?: (framework: Framework, path: string) => boolean;
  /** the registered agent keys (default: LandingPage/agents.ts) */
  agentKeys?: readonly string[];
  /** the registered media keys (default: media/manifest.ts) */
  mediaKeys?: readonly string[];
  /** the events each agent emits (default: agents.ts AGENT_EVENTS; an agent missing here emits none) */
  agentEvents?: Readonly<Record<string, readonly string[]>>;
  /** the events each media listens to (default: media/manifest.ts `listens`) */
  mediaListens?: Readonly<Record<string, readonly string[]>>;
}

const SLUG = /^[a-z][a-z0-9-]*$/;

/** The element ids a section derives from its id. */
export function derivedIds(section: SectionConfig): string[] {
  const ids = [`${section.id}-heading`];
  if (section.type === "faq") {
    section.items.forEach((_, i) => ids.push(`${section.id}-q-${i}`, `${section.id}-a-${i}`));
  }
  return ids;
}

/** The agent keys a section uses, with where (for messages). */
function agentRefs(section: SectionConfig): Array<{ key: string; where: string }> {
  switch (section.type) {
    case "hero":
      return [{ key: section.agent.key, where: "agent" }];
    case "agentHero":
      return [
        { key: section.crew.center.key, where: "crew.center" },
        ...section.crew.friends.map((a, i) => ({ key: a.key, where: `crew.friends[${i}]` })),
        ...section.crew.back.map((a, i) => ({ key: a.key, where: `crew.back[${i}]` })),
      ];
    case "featureGrid":
      return section.items.map((item, i) => ({ key: item.agent.key, where: `items[${i}].agent` }));
    case "showcase":
      return section.cornerAgent ? [{ key: section.cornerAgent.key, where: "cornerAgent" }] : [];
    case "faq":
      return [];
  }
}

const LINK_KINDS = new Set(["docs", "app", "route", "external"]);

/** Every LinkRef anywhere in a value (CTAs, nav, toggle...), found by shape. */
function collectLinks(value: unknown, out: LinkRef[] = []): LinkRef[] {
  if (Array.isArray(value)) value.forEach((v) => collectLinks(v, out));
  else if (value && typeof value === "object") {
    const kind = (value as { kind?: unknown }).kind;
    if (typeof kind === "string" && LINK_KINDS.has(kind)) out.push(value as LinkRef);
    else Object.values(value).forEach((v) => collectLinks(v, out));
  }
  return out;
}

export function validateLandingConfig(config: LandingPageConfig, ctx: ValidateContext = {}): string[] {
  const errors: string[] = [];
  const agentKeys = new Set(ctx.agentKeys ?? Object.keys(LANDING_AGENTS));
  const mediaKeys = new Set(ctx.mediaKeys ?? Object.keys(MEDIA_MANIFEST));
  const agentEvents: Readonly<Record<string, readonly string[]>> = ctx.agentEvents ?? AGENT_EVENTS;
  const mediaListens: Readonly<Record<string, readonly string[]>> =
    ctx.mediaListens ?? Object.fromEntries(Object.entries(MEDIA_MANIFEST).map(([key, entry]) => [key, entry.listens]));
  const sections = config.sections;

  // ids
  const seen = new Map<string, string>();
  const claim = (id: string, owner: string) => {
    const previous = seen.get(id);
    if (previous) errors.push(`duplicate id "${id}": used by ${previous} and ${owner}`);
    else seen.set(id, owner);
  };
  for (const section of sections) {
    const owner = `section "${section.id}" (${section.type})`;
    if (!SLUG.test(section.id)) errors.push(`${owner}: id must be a slug (lower-case letters, digits and dashes)`);
    claim(section.id, owner);
    for (const id of derivedIds(section)) claim(id, owner);
  }

  // one hero
  const heroes = sections.filter((s) => (s.type === "hero" || s.type === "agentHero") && !s.hidden);
  if (heroes.length !== 1) errors.push(`a page needs exactly one visible hero section, found ${heroes.length}`);

  for (const section of sections) {
    const owner = `section "${section.id}" (${section.type})`;

    // agents and media
    for (const { key, where } of agentRefs(section)) {
      if (!agentKeys.has(key)) errors.push(`${owner}: ${where} "${key}" is not an agent in LandingPage/agents.ts`);
    }
    if (section.type === "showcase" && section.cornerAgent) {
      const entry = (LANDING_AGENTS as Record<string, { body?: unknown }>)[section.cornerAgent.key];
      if (entry && !entry.body) {
        errors.push(`${owner}: corner agent "${section.cornerAgent.key}" needs \`body\` insets in LandingPage/agents.ts (it is placed by its body)`);
      }
    }
    if (section.type === "showcase" && !mediaKeys.has(section.media.key)) {
      errors.push(`${owner}: media "${section.media.key}" is not in the media registry`);
    }

    // agent ↔ media pairings (plan §3.5)
    if (section.type === "showcase" && section.cornerAgent) {
      const listens = mediaListens[section.media.key] ?? [];
      const emits = agentEvents[section.cornerAgent.key] ?? [];
      if (listens.length > 0 && !emits.some((e) => listens.includes(e))) {
        errors.push(
          `${owner}: corner agent "${section.cornerAgent.key}" emits none of the events its media "${section.media.key}" listens to (${listens.join(", ")})`,
        );
      }
    }
    if (section.type === "hero" && section.toolbar?.syncWithAgent) {
      const emitted = new Set((agentEvents[section.agent.key] ?? []).filter((e) => e.startsWith("tool:")).map((e) => e.slice(5)));
      const missing = section.toolbar.tools.filter((tool) => !emitted.has(tool));
      if (missing.length) {
        errors.push(`${owner}: toolbar tools ${missing.map((t) => `"${t}"`).join(", ")} are not "tool:*" events of the "${section.agent.key}" agent`);
      }
    }

    // docs pages
    if (ctx.docsExists) {
      for (const link of collectLinks(section)) {
        if (link.kind !== "docs" || !link.path) continue;
        const path = link.path.replace(/^\/+|\/+$/g, "");
        const missing = DOCS_FRAMEWORKS.filter((fw) => !ctx.docsExists!(fw, path));
        if (missing.length) errors.push(`${owner}: docs page "${path}" does not exist for ${missing.join(", ")}`);
      }
    }
  }

  return errors;
}
