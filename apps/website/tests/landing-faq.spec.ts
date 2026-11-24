import { describe, expect, it } from "vitest";
import { splitCodeSpans } from "../src/components/LandingPage/sections/Faq/answer";
import { FAQ_ITEMS } from "../src/content/landing/faq";
import { stripBackticks } from "../src/components/LandingPage/seo";

describe("splitCodeSpans", () => {
  it("returns plain text as one part", () => {
    expect(splitCodeSpans("Yes. It is free.")).toEqual([
      { code: false, text: "Yes. It is free." },
    ]);
  });

  it("returns nothing for an empty answer", () => {
    expect(splitCodeSpans("")).toEqual([]);
  });

  it("makes each backtick pair a code part", () => {
    expect(
      splitCodeSpans("Hide it with `isWatermarkVisible` or `false`."),
    ).toEqual([
      { code: false, text: "Hide it with " },
      { code: true, text: "isWatermarkVisible" },
      { code: false, text: " or " },
      { code: true, text: "false" },
      { code: false, text: "." },
    ]);
  });

  it("handles code at the start and end", () => {
    expect(splitCodeSpans("`a` and `b`")).toEqual([
      { code: true, text: "a" },
      { code: false, text: " and " },
      { code: true, text: "b" },
    ]);
  });

  it("drops an empty pair and merges the text around it", () => {
    expect(splitCodeSpans("x `` y")).toEqual([{ code: false, text: "x  y" }]);
  });

  it("drops an unmatched backtick, like the JSON-LD does", () => {
    expect(splitCodeSpans("a `b` c ` d")).toEqual([
      { code: false, text: "a " },
      { code: true, text: "b" },
      { code: false, text: " c  d" },
    ]);
  });

  it("keeps markup-like text as text (answers hold no HTML)", () => {
    expect(splitCodeSpans("<b>bold</b> `<x-tag>`")).toEqual([
      { code: false, text: "<b>bold</b> " },
      { code: true, text: "<x-tag>" },
    ]);
  });

  it("loses no characters but the backtick pairs (the JSON-LD text matches the visible text)", () => {
    for (const s of [
      ...FAQ_ITEMS.map((i) => i.a),
      "a `b` c ` d",
      "use `foo` and `bar`",
      "odd ` tick",
    ]) {
      expect(
        splitCodeSpans(s)
          .map((p) => p.text)
          .join(""),
        s,
      ).toBe(stripBackticks(s));
    }
  });
});
