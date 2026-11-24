import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import SectionIntro from "../../primitives/SectionIntro";
import SectionShell from "../../primitives/SectionShell";
import type { FaqSection } from "../../types";
import { splitCodeSpans } from "./answer";
import styles from "./styles.module.css";

/** An answer's text with its `code` spans as <code> (mono). */
function Answer({ text }: { text: string }): ReactNode {
  return (
    <>
      {splitCodeSpans(text).map((part, i) =>
        part.code ? (
          <code key={i} data-font="mono" className={styles.code}>
            {part.text}
          </code>
        ) : (
          part.text
        ),
      )}
    </>
  );
}

/** How long a closing answer stays inert (and findable-hidden only afterwards), so the .35s collapse plays out. */
const CLOSE_MS = 400;

/**
 * The FAQ accordion (the design's .faq, plan §3.8). Each question is an h3 > button (aria-expanded, aria-controls)
 * that toggles its answer region; one answer is open at a time and clicking the open one closes it. Every answer is in
 * the server-rendered HTML: a closed one is collapsed with grid-template-rows:0fr (so the .35s open animation runs)
 * and made `inert` in the server output, so it is neither focusable nor read. After hydration a closed answer is
 * `hidden="until-found"` instead (set from an effect: React renders a string `hidden` as a boolean), so find-in-page
 * still finds its text and its `beforematch` opens it; while one is collapsing it stays `inert` until the animation
 * ends. The FAQPage JSON-LD is added by LandingPage (seo.ts) when the config sets `jsonLd`.
 */
export default function Faq({ config }: { config: FaqSection }): ReactNode {
  const { id, heading, intro, items } = config;
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);
  /** the answer that is collapsing right now (still rendered, inert, until CLOSE_MS has passed) */
  const [closingIndex, setClosingIndex] = useState<number | null>(null);
  const answerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const openRef = useRef<number | null>(null);

  const open = useCallback((next: number | null) => {
    const cur = openRef.current;
    if (cur === next) return;
    openRef.current = next;
    setOpenIndex(next);
    setClosingIndex(cur);
  }, []);
  const toggle = useCallback(
    (i: number) => open(openRef.current === i ? null : i),
    [open],
  );

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (closingIndex === null) return;
    const timer = window.setTimeout(() => setClosingIndex(null), CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [closingIndex]);

  // closed (and done collapsing) answers: hidden until found; find-in-page's beforematch opens one
  useEffect(() => {
    if (!hydrated) return;
    const cleanups = answerRefs.current.map((el, i) => {
      if (!el) return () => {};
      if (i === openIndex || i === closingIndex) el.removeAttribute("hidden");
      else el.setAttribute("hidden", "until-found");
      const onMatch = () => open(i);
      el.addEventListener("beforematch", onMatch);
      return () => el.removeEventListener("beforematch", onMatch);
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [hydrated, openIndex, closingIndex, open, items.length]);

  return (
    <SectionShell
      id={id}
      type="faq"
      width="narrow"
      innerClassName={styles.inner}
    >
      <SectionIntro id={id} heading={heading} body={intro} align="center" />
      <div className={styles.list}>
        {items.map((item, i) => {
          const isOpen = openIndex === i;
          const qId = `${id}-q-${i}`;
          const aId = `${id}-a-${i}`;
          // React 19 renders a boolean `inert`; the repo's @types/react (18) does not declare it, hence the spread.
          // Server output and a collapsing answer: inert; a closed one after hydration: hidden="until-found" (effect).
          const inert = !isOpen && (!hydrated || closingIndex === i) ? { inert: true } : {};
          return (
            <div key={qId} className={clsx(styles.item, isOpen && styles.open)}>
              <h3 className={styles.heading}>
                <button
                  type="button"
                  id={qId}
                  className={styles.q}
                  aria-expanded={isOpen}
                  aria-controls={aId}
                  onClick={() => toggle(i)}
                >
                  <span>{item.q}</span>
                  <span className={styles.icon} aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                      <path d="M12 6v12M6 12h12" />
                    </svg>
                  </span>
                </button>
              </h3>
              <div
                id={aId}
                ref={(el) => {
                  answerRefs.current[i] = el;
                }}
                role="region"
                aria-labelledby={qId}
                className={styles.a}
                {...inert}
              >
                <div className={styles.clip}>
                  <p className={styles.text}>
                    <Answer text={item.a} />
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}
