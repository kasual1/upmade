import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import SkillTerminal from "../src/components/LandingPage/media/SkillTerminal";
import {
  CHAR_MS,
  LEAD_MS,
  LOOP_MS,
  finalState,
  nextChangeAt,
  sessionAt,
  sessionScale,
  sessionTimes,
} from "../src/components/LandingPage/media/SkillTerminal/session";
import { SKILL_INSTALL_COMMAND } from "../src/components/Brand/links";

const N = SKILL_INSTALL_COMMAND.length;

describe("the skill terminal's session (session.ts)", () => {
  it("keeps the design's timings", () => {
    const t = sessionTimes(N);
    const typed = 250 + N * 35 + 75;
    expect(t).toEqual({
      typed,
      banner: typed + 225,
      question: typed + 650,
      answered: typed + 1100,
      added: typed + 1400,
      prompt: typed + 1600,
      round: typed + 1100 + 2950,
    });
    expect(t.round - t.answered).toBe(LOOP_MS);
  });

  it("starts from an empty prompt and types the command a character at a time", () => {
    expect(sessionAt(N, 0)).toEqual({ typed: 0, typing: true, banner: false, question: false, answered: false, added: false, prompt: false });
    expect(sessionAt(N, LEAD_MS + CHAR_MS - 1).typed).toBe(0);
    expect(sessionAt(N, LEAD_MS + CHAR_MS).typed).toBe(1);
    expect(sessionAt(N, LEAD_MS + 5 * CHAR_MS + 10).typed).toBe(5);
    expect(sessionAt(N, LEAD_MS + N * CHAR_MS)).toMatchObject({ typed: N, typing: true });
  });

  it("reveals the lines in order and ends on the finished session", () => {
    const t = sessionTimes(N);
    expect(sessionAt(N, t.typed)).toMatchObject({ typing: false, banner: false });
    expect(sessionAt(N, t.banner)).toMatchObject({ banner: true, question: false });
    expect(sessionAt(N, t.question)).toMatchObject({ question: true, answered: false });
    expect(sessionAt(N, t.answered)).toMatchObject({ answered: true, added: false });
    expect(sessionAt(N, t.added)).toMatchObject({ added: true, prompt: false });
    expect(sessionAt(N, t.prompt)).toEqual(finalState(N));
    expect(sessionAt(N, t.round - 1)).toEqual(finalState(N));
  });

  it("schedules exactly the moments the state changes, then the round's end", () => {
    const t = sessionTimes(N);
    const moments: number[] = [];
    for (let ms = 0; ms < t.round; ms = nextChangeAt(N, ms)) moments.push(ms);
    expect(moments.length).toBe(1 + N + 6); // the start, each character, then typed, banner, question, answer, added, prompt
    for (let i = 1; i < moments.length; i++) {
      expect(moments[i]).toBeGreaterThan(moments[i - 1]);
      expect(sessionAt(N, moments[i])).not.toEqual(sessionAt(N, moments[i] - 1));
    }
    expect(nextChangeAt(N, t.prompt)).toBe(t.round);
  });

  it("scales the session down to the body, never up", () => {
    expect(sessionScale(600, 454)).toBe(1);
    expect(sessionScale(227, 454)).toBe(0.5);
    expect(sessionScale(227, 681)).toBe(0.3333);
    expect(sessionScale(0, 454)).toBe(1);
    expect(sessionScale(300, 0)).toBe(1);
  });
});

describe("<SkillTerminal> on the server", () => {
  const html = renderToString(createElement(SkillTerminal, { props: { command: SKILL_INSTALL_COMMAND }, subscribe: () => () => {} }));

  it("renders the finished session, decorative, with the command for screen readers", () => {
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("Install the upmade skill for your agent?");
    expect(html).toContain("Added the");
    // the visually hidden alternative, outside the decorative window
    expect(html).toMatch(/<p[^>]*>Install the Upmade skill for your coding agent: <code data-font="mono">npx skills add kasual1\/upmade<\/code><\/p>/);
  });

  it("marks its text as monospace", () => {
    expect(html.match(/data-font="mono"/g)?.length).toBeGreaterThan(10);
  });
});
