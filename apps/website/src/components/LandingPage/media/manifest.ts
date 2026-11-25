/**
 * What the landing page knows about each media key without loading the media components: the props each one takes
 * (MediaPropsMap, which types `media.props` in a showcase's config) and the agent events it consumes (`listens`).
 * Kept free of components and Docusaurus imports so validate.ts and the unit tests can use it; media/registry.ts
 * pairs it with the components.
 *
 * `listens` are hook points (plan §0): the /agent demos do not forward their events yet, so every media runs on its
 * own clock today. The names are the corner agents' animation events (LandingPage/agents.ts AGENT_EVENTS).
 */
import type { Framework } from "../../../utils/frameworkPreference";

/** One framework's snippet for the code typer (content/landing/frameworks.ts). */
export interface CodeFramework {
  id: Framework;
  name: string;
  /** a site path to the framework's logo (resolved against the baseUrl by the media) */
  logo: string;
  /** the framework's brand colour (data, so no hex in the modules) */
  color: string;
  /** the file name shown in the window's title bar */
  file: string;
  code: string;
}

export interface MediaPropsMap {
  /** the DOM based canvas: a canvas calculator, with a slider revealing its DOM */
  domCanvas: {
    /** where the divider starts, 0 (all canvas) to 1 (all DOM); 0.5 by default */
    split?: number;
  };
  /** the code typer: types each framework's snippet in turn */
  codeTyper: {
    frameworks: readonly CodeFramework[];
  };
  /** the star board: a drifting board of GitHub star buttons */
  starBoard: {
    /** where the star buttons link to */
    repoUrl: string;
  };
  /** generative UI: an agent builds a small shop page in a desktop frame, then adds a phone variant */
  framesDemo: Record<string, never>;
  /** the terminal replaying the agent skill's install session */
  skillTerminal: {
    /** the command typed at the prompt, e.g. `npx skills add kasual1/upmade` */
    command: string;
  };
  /** the editor's controls morphing from one theme into the next */
  themes: Record<string, never>;
}

export type MediaKey = keyof MediaPropsMap;

export interface MediaManifestEntry {
  /** the agent events this media reacts to (hook points, nothing emits them yet) */
  listens: readonly string[];
  /** the MediaFrame the showcase puts the media in: its aspect ratio (none: sized by the media) and look */
  frame: { aspectRatio?: string; variant: "panel" | "window" | "none" };
}

export const MEDIA_MANIFEST = {
  // the juggler (its corner agent) has no events
  domCanvas: { listens: [], frame: { aspectRatio: "16 / 11", variant: "panel" } },
  // the framework sign flips 500 ms before each framework's turn (animations/frameworkSign.ts)
  codeTyper: { listens: ["flip"], frame: { variant: "window" } },
  // the cycling glasses go on and off (animations/cyclingGlasses.ts)
  starBoard: { listens: ["glassesOn", "glassesOff"], frame: { aspectRatio: "16 / 11", variant: "panel" } },
  // the bouquet agent presents its flowers (animations/bouquetReveal.ts); the frames demo plays on its own clock
  framesDemo: { listens: [], frame: { aspectRatio: "16 / 11", variant: "panel" } },
  // the lovestruck agent's hearts are its own (the demo's HeartBubbles); the terminal replays on its own clock
  skillTerminal: { listens: [], frame: { variant: "window" } },
  // the hat-swapping agent puts on a new hat: the controls morph into the next theme (animations/hatSwap.ts)
  themes: { listens: ["putOn"], frame: { aspectRatio: "16 / 11", variant: "panel" } },
} as const satisfies { [K in MediaKey]: MediaManifestEntry };

export const MEDIA_KEYS = Object.keys(MEDIA_MANIFEST) as MediaKey[];
