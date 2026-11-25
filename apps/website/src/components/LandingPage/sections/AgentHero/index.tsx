import { useEffect, useRef, type ReactNode } from "react";
import clsx from "clsx";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { REPO_SLUG, REPO_URL } from "../../../Brand/links";
import AgentSlot from "../../primitives/AgentSlot";
import Button from "../../primitives/Button";
import SegmentedToggle from "../../primitives/SegmentedToggle";
import type { AgentHeroSection } from "../../types";
import HeroTop from "../Hero/HeroTop";
import heroStyles from "../Hero/styles.module.css";
import { startAgentHero } from "./choreography";
import styles from "./styles.module.css";

/**
 * The agentic hero (the "Agentic" design's hero, L546-564 and its script L671-1042): the shared hero header
 * (HeroTop), the page toggle, the server-rendered h1 and subtitle, a crew of five agents, the chat box and the CTAs,
 * under a mocked canvas board.
 *
 * Everything that is content (h1, subtitle, the chat form, the CTAs) is server-rendered. The board, the agent's
 * cursor and the demo run in the browser only: `startAgentHero` (choreography.ts) drives them imperatively from
 * refs once mounted and cleans up on unmount. The agents are the /agent placeholders (plan §0), by key through
 * AgentSlot; the center one's eyes follow the pointer (the family demos do) and it morphs into the cursor.
 */
export default function AgentHero({ config }: { config: AgentHeroSection }): ReactNode {
  const { id, nav, toggle, title, subtitle, crew, chat, ctas } = config;
  const { siteConfig } = useDocusaurusContext();
  const inputId = `${id}-chat-input`;

  const heroRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const centerRef = useRef<HTMLSpanElement>(null);
  const runnerRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sendRef = useRef<HTMLButtonElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const ellLRef = useRef<HTMLSpanElement>(null);
  const ellRRef = useRef<HTMLSpanElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<SVGSVGElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);
  const arrowPathRef = useRef<SVGPathElement>(null);
  const whoRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);

  const shareUrl = siteConfig.url.replace(/\/$/, "") + siteConfig.baseUrl;
  const demoKey = chat.demo.join("\n");

  useEffect(() => {
    const r = {
      hero: heroRef.current,
      copy: copyRef.current,
      title: titleRef.current,
      subtitle: subRef.current,
      center: centerRef.current,
      form: formRef.current,
      input: inputRef.current,
      send: sendRef.current,
      caret: caretRef.current,
      ellLeft: ellLRef.current,
      ellRight: ellRRef.current,
      board: boardRef.current,
      layer: layerRef.current,
      links: linksRef.current,
      cursor: cursorRef.current,
      arrow: arrowRef.current,
      arrowPath: arrowPathRef.current,
      who: whoRef.current,
      status: statusRef.current,
    };
    if (Object.values(r).some((v) => !v)) return;
    const runners = runnerRefs.current.filter((x): x is HTMLSpanElement => !!x);
    return startAgentHero({ ...(r as { [K in keyof typeof r]: NonNullable<(typeof r)[K]> }), runners }, {
      agentName: chat.agentName,
      demo: chat.demo,
      repoUrl: REPO_URL,
      repoSlug: REPO_SLUG,
      shareUrl,
      cls: styles,
    });
    // the demo restarts only when its script changes
  }, [demoKey, chat.agentName, shareUrl]);

  const runner = (k: number) => (el: HTMLSpanElement | null) => {
    runnerRefs.current[k] = el;
  };

  return (
    <section
      ref={heroRef}
      aria-labelledby={`${id}-heading`}
      data-section="agentHero"
      data-section-id={id}
      className={clsx(heroStyles.hero, styles.hero)}
    >
      <HeroTop nav={nav} />

      {/* the mocked canvas: the agent's cursor and what it places (added by the choreography) */}
      <div ref={boardRef} className={styles.board}>
        <svg ref={linksRef} className={styles.links} aria-hidden="true" />
        <div ref={layerRef} className={styles.layer} />
        <div ref={cursorRef} className={styles.cursor} aria-hidden="true">
          <svg ref={arrowRef} className={styles.arrowhead} viewBox="0 0 24 24">
            <path ref={arrowPathRef} d="M3 2l7.5 19 2.6-7.6L21 10.6z" />
          </svg>
          <span ref={whoRef} className={styles.who}>
            <AgentSlot agent={crew.center.key} className={styles.whoAgent} />
            {chat.agentName}
          </span>
        </div>
      </div>

      <div ref={copyRef} className={heroStyles.copy}>
        {toggle && <SegmentedToggle items={toggle} />}
        <h1 ref={titleRef} id={`${id}-heading`} className={clsx(heroStyles.title, styles.title)}>
          {title}
        </h1>
        <p ref={subRef} className={clsx(heroStyles.subtitle, styles.sub)}>
          {subtitle}
        </p>

        <span className={styles.crew}>
          <span ref={runner(0)} className={clsx(styles.back, styles.left)}>
            <AgentSlot agent={crew.back[0].key} label={crew.back[0].label} className={styles.fill} />
          </span>
          <span ref={runner(1)} className={clsx(styles.friend, styles.left)}>
            <AgentSlot agent={crew.friends[0].key} label={crew.friends[0].label} className={styles.fill} />
          </span>
          <span ref={centerRef} className={styles.center}>
            <AgentSlot agent={crew.center.key} label={crew.center.label} className={styles.fill} />
          </span>
          <span ref={runner(2)} className={clsx(styles.friend, styles.right)}>
            <AgentSlot agent={crew.friends[1].key} label={crew.friends[1].label} className={styles.fill} />
          </span>
          <span ref={runner(3)} className={clsx(styles.back, styles.right)}>
            <AgentSlot agent={crew.back[1].key} label={crew.back[1].label} className={styles.fill} />
          </span>
        </span>

        <form ref={formRef} className={styles.chat} aria-label={chat.label}>
          <label className={styles.sr} htmlFor={inputId}>
            {chat.placeholder ?? chat.label}
          </label>
          <span ref={caretRef} className={styles.fakeCaret} aria-hidden="true" />
          <span ref={ellLRef} className={clsx(styles.ell, styles.ellL)} aria-hidden="true">
            …
          </span>
          <span ref={ellRRef} className={clsx(styles.ell, styles.ellR)} aria-hidden="true">
            …
          </span>
          <input
            ref={inputRef}
            id={inputId}
            className={styles.input}
            type="text"
            placeholder={chat.placeholder}
            autoComplete="off"
            enterKeyHint="send"
          />
          <button ref={sendRef} type="submit" className={styles.send} aria-label="Send" disabled>
            <svg className={styles.sendIcon} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 19V5" />
              <path d="m5 12 7-7 7 7" />
            </svg>
            <svg className={styles.restartIcon} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
        </form>
        {/* what the agent did, for screen readers */}
        <p ref={statusRef} className={styles.sr} role="status" aria-live="polite" />

        <div className={heroStyles.ctas}>
          {ctas.map((cta) => (
            <Button key={cta.label} cta={cta} />
          ))}
        </div>
      </div>
    </section>
  );
}
