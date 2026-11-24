/**
 * The media a showcase can show, by key: `MEDIA = { domCanvas, codeTyper, starBoard }`. A static map (no
 * require.context), so it renders on the server and works on any bundler. Each entry pairs the component with its
 * manifest (manifest.ts: the props type, the agent events it `listens` to, its frame). Adding a media: create
 * media/<Name>/, add its props to MediaPropsMap and its manifest entry, then one line here; `satisfies` fails the
 * typecheck until every key has a component.
 */
import type { ComponentType } from "react";
import type { Subscribe } from "../hooks/useSectionSignal";
import { MEDIA_MANIFEST, type MediaKey, type MediaManifestEntry, type MediaPropsMap } from "./manifest";
import DomCanvas from "./DomCanvas";
import CodeTyper from "./CodeTyper";
import StarBoard from "./StarBoard";

export { MEDIA_KEYS, MEDIA_MANIFEST, type CodeFramework, type MediaKey, type MediaPropsMap } from "./manifest";

/** What every media component receives. */
export interface MediaComponentProps<K extends MediaKey> {
  /** the showcase config's `media.props` */
  props?: MediaPropsMap[K];
  /**
   * the section signal (hooks/useSectionSignal): the corner agent's events, for the media to react to imperatively.
   * A hook point (plan §0): nothing emits yet, so media must run correctly on their own clocks without it.
   */
  subscribe: Subscribe;
}

export interface MediaEntry<K extends MediaKey> extends MediaManifestEntry {
  Component: ComponentType<MediaComponentProps<K>>;
}

export const MEDIA = {
  domCanvas: { ...MEDIA_MANIFEST.domCanvas, Component: DomCanvas },
  codeTyper: { ...MEDIA_MANIFEST.codeTyper, Component: CodeTyper },
  starBoard: { ...MEDIA_MANIFEST.starBoard, Component: StarBoard },
} satisfies { [K in MediaKey]: MediaEntry<K> };
