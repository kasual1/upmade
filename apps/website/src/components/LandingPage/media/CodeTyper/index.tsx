import { useEffect, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import { useInView } from "../../hooks/useInView";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { CodeFramework } from "../manifest";
import type { MediaComponentProps } from "../registry";
import { tokenizeLine, type TokenKind } from "./highlight";
import { codeScale } from "./scale";
import { FLIP_LEAD_MS, SETTLE_MS, turnMs, typingTimes } from "./typing";
import styles from "./styles.module.css";

export { tokenizeLine, type CodeToken, type TokenKind } from "./highlight";

const TOKEN_CLASS: Record<TokenKind, string> = {
  string: styles.string,
  keyword: styles.keyword,
  decorator: styles.decorator,
  tag: styles.tag,
};

/** stable fallback, so a missing `frameworks` prop never retriggers the effects that depend on it */
const EMPTY: readonly CodeFramework[] = [];

interface TyperState {
  /** index into the frameworks */
  index: number;
  /** how many characters of its snippet show */
  typed: number;
  /** typing (the caret stays solid) or done (the caret blinks) */
  typing: boolean;
}

/** One snippet, as far as it is typed: numbered lines, highlighted, with the caret after the last character. */
function CodeLines({ code, typing, className }: { code: string; typing: boolean; className?: string }): ReactNode {
  const lines = code.split("\n");
  return (
    <div className={clsx(styles.code, className)} data-font="mono">
      {lines.map((line, i) => (
        <div key={i} className={styles.line} data-font="mono">
          <span className={styles.number} data-font="mono">
            {i + 1}
          </span>
          <span className={styles.text} data-font="mono">
            {tokenizeLine(line).map((token, j) => (
              <span key={j} className={token.kind && TOKEN_CLASS[token.kind]} data-font="mono">
                {token.text}
              </span>
            ))}
            {i === lines.length - 1 && <span className={clsx(styles.caret, !typing && styles.blink)} />}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * "Easy to get started": a developer window in the agents' art style that types each framework's snippet in turn
 * (React → Vue → Angular), with the file name in its title bar, line numbers and a pink caret that blinks once a
 * snippet is done. Ported from Landing/Sections.tsx (CodeWindow, highlight) and the design's script.
 *
 * - Clock: the framework sign's documented turns (typing.ts, 6170 / 6824 / 9348 ms) on the typer's own timers, which
 *   run only while the window is on screen. `subscribe` is the hook point for the final sign (plan §0): a `flip`
 *   event hands the clock to the sign (the typer then starts the next framework 500 ms after each flip and keeps no
 *   turn timer of its own). Nothing emits it yet.
 * - Size: the code is laid out at a real 14px font and scaled by a transform to the design's size for the window's
 *   width (scale.ts), so minimum font size settings cannot push it out of the window (plan §3.7). The body's height
 *   is reserved for the longest snippet, so typing never moves the page.
 * - Server and reduced motion: the first (React) snippet, fully typed and still.
 * - Screen readers: the window is decorative (aria-hidden); a visually hidden copy of the first snippet carries the
 *   code for them and for search engines.
 */
export default function CodeTyper({ props, subscribe }: MediaComponentProps<"codeTyper">): ReactNode {
  const frameworks: readonly CodeFramework[] = props?.frameworks ?? EMPTY;
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  /** once the sign's `flip` arrives, the sign is the clock and the typer keeps no turn timer (survives re-entry) */
  const drivenRef = useRef(false);
  const reduced = useReducedMotion();
  const inView = useInView(rootRef, { rootMargin: "0px 0px -15% 0px" });
  const [state, setState] = useState<TyperState>(() => ({
    index: 0,
    typed: frameworks[0]?.code.length ?? 0,
    typing: false,
  }));
  /** after hydration: only then does "off screen" (inView false) mean anything; the server output blinks */
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // fit the code to the window (scale.ts); the layer's size depends only on the window's width, so no loop
  useEffect(() => {
    const root = rootRef.current;
    const body = bodyRef.current;
    const layer = layerRef.current;
    if (!root || !body || !layer || typeof ResizeObserver === "undefined") return;
    let alive = true;
    const measure = () => {
      const width = root.clientWidth;
      if (!alive || width === 0) return; // hidden: keep the last fit
      const windowWidth = root.parentElement?.offsetWidth ?? width;
      const k = codeScale(windowWidth);
      root.style.setProperty("--k", String(k));
      layer.style.width = `${width / k}px`;
      body.style.height = `${Math.ceil(layer.offsetHeight * k)}px`;
    };
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(layer);
    document.fonts?.ready.then(measure, () => {});
    return () => {
      alive = false;
      observer.disconnect();
    };
  }, []);

  // reduced motion: back to the still first snippet
  useEffect(() => {
    if (!reduced) return;
    indexRef.current = 0;
    setState({ index: 0, typed: frameworks[0]?.code.length ?? 0, typing: false });
  }, [reduced, frameworks]);

  // the clock: types while on screen; leaving the screen stops it, coming back restarts the current framework
  useEffect(() => {
    if (!inView || reduced || frameworks.length === 0) return;
    let typingTimer = 0;
    let turnTimer = 0;

    const run = (index: number) => {
      window.clearTimeout(typingTimer);
      window.clearTimeout(turnTimer);
      indexRef.current = index;
      const { code } = frameworks[index];
      const times = typingTimes(code);
      const start = performance.now();
      let typed = 0;
      setState({ index, typed: 0, typing: true });

      // one timer at a time, scheduled against the turn's start so it never drifts (and catches up if throttled)
      const step = () => {
        const elapsed = performance.now() - start;
        while (typed < times.length && times[typed] <= elapsed) typed++;
        setState({ index, typed, typing: true });
        if (typed < times.length) {
          typingTimer = window.setTimeout(step, times[typed] - elapsed);
        } else {
          const end = times.length ? times[times.length - 1] : 0;
          typingTimer = window.setTimeout(
            () => setState({ index, typed: code.length, typing: false }),
            Math.max(0, end + SETTLE_MS - elapsed),
          );
        }
      };
      typingTimer = window.setTimeout(step, times.length ? times[0] : 0);
      if (!drivenRef.current) turnTimer = window.setTimeout(startNext, turnMs(frameworks[index]));
    };
    const startNext = () => run((indexRef.current + 1) % frameworks.length);

    const unsubscribe = subscribe((name) => {
      if (name !== "flip") return;
      drivenRef.current = true;
      window.clearTimeout(turnTimer);
      turnTimer = window.setTimeout(startNext, FLIP_LEAD_MS);
    });
    run(indexRef.current);

    return () => {
      unsubscribe();
      window.clearTimeout(typingTimer);
      window.clearTimeout(turnTimer);
    };
  }, [inView, reduced, frameworks, subscribe]);

  const framework = frameworks[state.index] ?? frameworks[0];
  const first = frameworks.find((f) => f.id === "react") ?? frameworks[0];

  return (
    <div ref={rootRef} className={styles.root} data-code-typer="">
      <div className={styles.window} aria-hidden="true">
        <div className={styles.bar}>
          <i className={styles.dotPink} />
          <i className={styles.dotYellow} />
          <i className={styles.dotGreen} />
          {framework && (
            <span className={styles.file} data-font="mono">
              {framework.file}
            </span>
          )}
        </div>
        <div ref={bodyRef} className={styles.body}>
          <div ref={layerRef} className={styles.layer}>
            {/* every snippet in full, invisible, so the body is as tall as the longest one at any width */}
            {frameworks.map((f) => (
              <CodeLines key={f.id} code={f.code} typing className={styles.ghost} />
            ))}
            {framework && (
              <CodeLines
                code={framework.code.slice(0, state.typed)}
                typing={state.typing || (hydrated && !inView) /* no caret blink off screen (after hydration) */}
                className={styles.live}
              />
            )}
          </div>
        </div>
      </div>
      {first && (
        <figure className={styles.srOnly}>
          <figcaption>{`${first.name} quick start, ${first.file}:`}</figcaption>
          <pre data-font="mono">
            <code data-font="mono">{first.code}</code>
          </pre>
        </figure>
      )}
    </div>
  );
}
