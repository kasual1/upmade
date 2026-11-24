import type { ComponentType, ReactNode } from "react";
import clsx from "clsx";
import { useSectionSignal } from "../../hooks/useSectionSignal";
import { MEDIA, type MediaComponentProps, type MediaEntry } from "../../media/registry";
import type { MediaKey } from "../../media/manifest";
import MediaFrame from "../../primitives/MediaFrame";
import SectionIntro from "../../primitives/SectionIntro";
import SectionShell from "../../primitives/SectionShell";
import type { ShowcaseSection } from "../../types";
import styles from "./styles.module.css";

/**
 * A showcase: copy (h2, body, CTA) beside a media in a MediaFrame with an optional corner agent; `reversed` puts the
 * media on the right. Stacks at 960px (media first).
 *
 * The section owns the signal between its agent and its media (useSectionSignal): `subscribe` goes to the media;
 * `emit` will go to the corner agent once the final agents forward their events (plan §0), so today media run on
 * their own clocks. Shared by M6a/b/c; the layout and copy styling are finished there.
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
      >
        <Media props={media.props} subscribe={signal.subscribe} />
      </MediaFrame>
      <SectionIntro id={id} heading={heading} body={body} cta={cta} />
    </SectionShell>
  );
}
