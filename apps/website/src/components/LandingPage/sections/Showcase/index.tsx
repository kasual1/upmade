import type { ComponentType, ReactNode } from "react";
import clsx from "clsx";
import { useSectionSignal } from "../../hooks/useSectionSignal";
import { MEDIA, type MediaComponentProps, type MediaEntry } from "../../media/registry";
import type { MediaKey } from "../../media/manifest";
import MediaFrame, { type FrameGutter } from "../../primitives/MediaFrame";
import SectionIntro from "../../primitives/SectionIntro";
import SectionShell from "../../primitives/SectionShell";
import type { ShowcaseSection } from "../../types";
import styles from "./styles.module.css";

/**
 * The Infinite design's fixed padding around its code window (`.code-media`: `0 28px 34px 0`, `0 14px 28px 0` at 620px
 * and below), kept on its corner agent's side whatever the agent's reach. Only the code typer has it: panels and the
 * Agentic design's terminal have none, their agents just hang off.
 */
const WINDOW_GUTTER: FrameGutter = { side: 28, bottom: 34, sidePhone: 14, bottomPhone: 28 };

/**
 * A showcase: copy (h2, body, CTA) beside a media in a MediaFrame with an optional corner agent; `reversed` puts the
 * media on the right. Stacks at 960px (media first).
 *
 * The section owns the signal between its agent and its media (useSectionSignal, plan §3.5): the corner agent's
 * events go to `emit`, and the media gets `subscribe` (the sign's "flip" drives the code typer, the glasses'
 * "glassesOn"/"glassesOff" the star board, the hat swap's "putOn" the themes). It is generic: every corner agent's
 * events reach every media, which picks the names it `listens` to. `emit` is called inside the agent's frame
 * (`flushSync`), so it stays imperative: no React state in between.
 */
export default function Showcase({ config }: { config: ShowcaseSection }): ReactNode {
  const { id, heading, body, cta, reversed, media, cornerAgent } = config;
  const signal = useSectionSignal();
  const entry: MediaEntry<MediaKey> = MEDIA[media.key] as MediaEntry<MediaKey>;
  const Media = entry.Component as ComponentType<MediaComponentProps<MediaKey>>;

  return (
    <SectionShell id={id} type="showcase" innerClassName={clsx(styles.grid, reversed && styles.reversed)}>
      <MediaFrame
        className={styles.media}
        aspectRatio={entry.frame.aspectRatio}
        variant={entry.frame.variant}
        cornerAgent={cornerAgent}
        onAgentEvent={cornerAgent ? signal.emit : undefined}
        minGutter={media.key === "codeTyper" ? WINDOW_GUTTER : undefined}
      >
        <Media props={media.props} subscribe={signal.subscribe} />
      </MediaFrame>
      <SectionIntro id={id} heading={heading} body={body} cta={cta} />
    </SectionShell>
  );
}
