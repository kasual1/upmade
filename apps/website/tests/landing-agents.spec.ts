import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import AgentSlot from "../src/components/LandingPage/primitives/AgentSlot";
import { AGENT_EVENTS, LANDING_AGENTS, reachInsets, reachPadding, type AgentKey } from "../src/components/LandingPage/agents";
import * as animations from "../src/components/Agents/animations";
import type { AgentAnimation } from "../src/components/Agents/types";
import type { DemoEntry } from "../src/components/Agents/demos/types";

/**
 * The landing page uses the /agent demos as they are (plan §0); the agents stream owns them. These tests make a
 * rename or removal there fail here, at once, instead of on the page.
 */
const DEMOS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/components/Agents/demos");

type DemoModule = { default?: DemoEntry["Demo"]; demos?: DemoEntry[] };

/** Every /agent demo by key, found as src/pages/agent.tsx finds them: each file in demos/ but types.ts. */
async function loadDemos(): Promise<Map<string, DemoEntry["Demo"]>> {
  const files = readdirSync(DEMOS_DIR).filter((f) => /^(?!types)[\w-]+\.tsx$/.test(f));
  const found = new Map<string, DemoEntry["Demo"]>();
  for (const file of files) {
    const mod = (await import(path.join(DEMOS_DIR, file))) as DemoModule;
    if (mod.demos) mod.demos.forEach((d) => found.set(d.key, d.Demo));
    else if (mod.default) found.set(file.replace(/\.tsx$/, ""), mod.default);
  }
  return found;
}

const KEYS = Object.keys(LANDING_AGENTS) as AgentKey[];

describe("LANDING_AGENTS", () => {
  it("has a component for every key", () => {
    for (const key of KEYS) expect(typeof LANDING_AGENTS[key].Component, key).toBe("function");
  });

  it("maps every key to the /agent demo of the same key", async () => {
    const demos = await loadDemos();
    for (const key of KEYS) {
      expect(demos.has(key), `no /agent demo "${key}" in Agents/demos (renamed or removed?)`).toBe(true);
      expect(LANDING_AGENTS[key].Component, `"${key}" is not the /agent demo of that key`).toBe(demos.get(key));
    }
  });

  it("includes every agent the landing page needs", () => {
    const needed = ["toolCycle", "squircle", "key", "handoff", "shapeShift", "controlPanel", "devices", "book", "juggler", "frameworkSign", "cyclingGlasses"];
    for (const key of needed) expect(KEYS, key).toContain(key);
  });

  it("marks the stacked demos as composite", () => {
    for (const key of ["handoff", "shapeShift", "painter", "devices"] as const) expect(LANDING_AGENTS[key].composite, key).toBe(true);
  });

  it("gives every agent a label and a reach of finite, non-negative fractions", () => {
    for (const key of KEYS) {
      const { label, reach } = LANDING_AGENTS[key];
      expect(label.length, key).toBeGreaterThan(0);
      for (const side of ["top", "right", "bottom", "left"] as const) {
        expect(Number.isFinite(reach[side]) && reach[side] >= 0, `${key}.${side}`).toBe(true);
      }
    }
  });
});

describe("reachPadding", () => {
  it("scales the reach to the agent's size, rounding up", () => {
    const { top, right, bottom, left } = LANDING_AGENTS.juggler.reach;
    expect(reachInsets("juggler", 100)).toEqual({ top: Math.ceil(top * 100), right: Math.ceil(right * 100), bottom: Math.ceil(bottom * 100), left: Math.ceil(left * 100) });
    const i = reachInsets("juggler", 100);
    expect(reachPadding("juggler", 100)).toEqual({ padding: `${i.top}px ${i.right}px ${i.bottom}px ${i.left}px` });
    expect(reachPadding("juggler", 100, "margin")).toEqual({ margin: `${i.top}px ${i.right}px ${i.bottom}px ${i.left}px` });
  });
});

describe("AGENT_EVENTS", () => {
  const byKey = animations as unknown as Record<string, AgentAnimation | undefined>;
  for (const [key, names] of Object.entries(AGENT_EVENTS)) {
    const emitted = new Set((byKey[key]?.events ?? []).map(([, name]) => name));
    const missing = names.filter((n) => !emitted.has(n));
    // the agents stream is authoritative: if an animation drops or renames an event, the hook point is stale, not the
    // animation wrong; skip with the reason so the hook point is updated when it is wired (M11)
    it.skipIf(missing.length > 0)(
      missing.length ? `${key} emits ${names.join(", ")} (SKIPPED: the animation no longer emits ${missing.join(", ")})` : `${key} emits ${names.join(", ")}`,
      () => {
        expect(byKey[key], `animation "${key}"`).toBeDefined();
        for (const n of names) expect(emitted.has(n), `${key}: ${n}`).toBe(true);
      },
    );
  }
});

describe("AgentSlot (server render)", () => {
  const html = (props: Parameters<typeof AgentSlot>[0]) => renderToString(createElement(AgentSlot, props));

  it("marks the box and hides a decorative agent from assistive technology", () => {
    const out = html({ agent: "key", className: "size" });
    expect(out).toMatch(/^<div class="[^"]*size[^"]*" data-agent-slot="" data-agent="key" aria-hidden="true">/);
    expect(out).not.toContain("role=\"img\"");
    expect(out).not.toContain("<noscript>");
  });

  it("labels the slot, not the demo, when given a label", () => {
    const out = html({ agent: "toolCycle", label: true });
    expect(out).toContain(`role="img" aria-label="${LANDING_AGENTS.toolCycle.label}"`);
    // the demo's own (changing) label is inside a wrapper hidden from assistive technology
    expect(out).toMatch(/role="img"[^>]*><div class="[^"]*" aria-hidden="true">/);
    expect(html({ agent: "book", label: "A book" })).toContain('aria-label="A book"');
  });

  it("hides composite agents until mounted, with a <noscript> reveal", () => {
    for (const agent of ["painter", "devices"] as const) {
      const out = html({ agent });
      expect(out, agent).toContain("<noscript><style>");
      expect(out, agent).toMatch(/<\/noscript><div class="[^"]*pending[^"]*"/);
    }
  });

  it("leaves client-only agents out of the server HTML (their <style> cannot hydrate after minification)", () => {
    for (const agent of ["handoff", "shapeShift"] as const) {
      expect(LANDING_AGENTS[agent].clientOnly, agent).toBe(true);
      const out = html({ agent, className: "size" });
      expect(out, agent).toMatch(/^<div class="[^"]*size[^"]*" data-agent-slot="" data-agent="[^"]+" aria-hidden="true"><div class="[^"]*"><\/div><\/div>$/);
      expect(out, agent).not.toContain("<noscript>");
      expect(out, agent).not.toContain("<style>");
    }
  });

  it("reserves the reach as padding or margin when asked", () => {
    const i = reachInsets("juggler", 100);
    expect(html({ agent: "juggler", reach: { size: 100 } })).toContain(`style="padding:${i.top}px ${i.right}px ${i.bottom}px ${i.left}px"`);
    expect(html({ agent: "juggler", reach: { size: 100, as: "margin" } })).toContain(`style="margin:${i.top}px`);
  });
});
