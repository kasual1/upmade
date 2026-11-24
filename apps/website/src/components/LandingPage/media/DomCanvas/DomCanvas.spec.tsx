import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import DomCanvas from "./index";

const subscribe = () => () => {};

describe("DomCanvas (server render)", () => {
  const html = renderToStaticMarkup(<DomCanvas subscribe={subscribe} />);

  test("renders the calculator and the slider on the server", () => {
    expect(html).toContain('aria-label="Calculator on the canvas"');
    expect(html).toMatch(/role="slider"/);
    expect(html).toContain('aria-valuenow="50"');
    expect(html).toContain('aria-valuemin="0"');
    expect(html).toContain('aria-valuemax="100"');
    expect(html).toContain('aria-valuetext="50% canvas, 50% DOM"');
    expect(html).toContain('tabindex="0"');
  });

  test("the markup is hidden from assistive technology and mirrors the display", () => {
    expect(html).toMatch(/<div [^>]*aria-hidden="true"[^>]*>.*app-calculator/s);
    expect(html).toMatch(/value<\/span>.*&quot;<span[^>]*data-font="mono">0<\/span>&quot;/s);
  });

  test("every text-bearing span of the markup is mono", () => {
    const source = html.slice(html.indexOf('aria-hidden="true"'));
    const spans = source.match(/<span[^>]*>[^<]+<\/span>/g) ?? [];
    expect(spans.length).toBeGreaterThan(20);
    for (const span of spans.filter((s) => !/>(DOM)</.test(s))) expect(span).toContain('data-font="mono"');
  });

  test("the split prop sets where the divider starts", () => {
    const quarter = renderToStaticMarkup(<DomCanvas subscribe={subscribe} props={{ split: 0.25 }} />);
    expect(quarter).toContain('aria-valuenow="25"');
    expect(quarter).toContain('aria-valuetext="25% canvas, 75% DOM"');
    expect(quarter).toContain("--split:0.25");
  });
});
