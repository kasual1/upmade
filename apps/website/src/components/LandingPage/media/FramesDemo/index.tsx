import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useInView } from "../../hooks/useInView";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import ScaledStage from "../../primitives/ScaledStage";
import type { MediaComponentProps } from "../registry";
import {
  BUTTON,
  FINAL_STATE,
  FRAMES,
  LOOP_MS,
  SHOP_UNIT,
  SHOP_W,
  SOLO_SHIFT,
  STAGE_H,
  STAGE_W,
  START_STATE,
  STEPS,
  TITLEBAR,
  cursorPoint,
  shopScale,
  type BuildState,
  type Device,
} from "./frames";
import styles from "./styles.module.css";

const flag = (on: boolean) => (on ? "true" : undefined);

const STAGE_STYLE = {
  "--solo-shift": `${SOLO_SHIFT}px`,
  "--titlebar-h": `${TITLEBAR.height}px`,
  "--titlebar-gap": `${TITLEBAR.gap}px`,
  "--titlebar-pad": `${TITLEBAR.padding}px`,
  "--button": `${BUTTON}px`,
} as CSSProperties;

function frameStyle(device: Device): CSSProperties {
  const { left, top, width, height } = FRAMES[device];
  const { k, height: shopHeight } = shopScale(device);
  return {
    left,
    top,
    width,
    height,
    "--shop-w": `${SHOP_W[device]}px`,
    "--shop-h": `${shopHeight}px`,
    "--shop-k": String(k),
    "--u": `${SHOP_UNIT[device]}px`,
  } as CSSProperties;
}

/** the cursor's transform; off screen it hangs 40 real px below the stage (60 virtual px when unscaled) */
function cursorTransform(target: BuildState["target"]): string {
  const { x, y } = cursorPoint(target, 0);
  return target === "offscreen" ? `translate(${x}px, calc(${y}px + 40px / var(--k, 1)))` : `translate(${x}px, ${y}px)`;
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/** the shop's product photo: the blue vase with the bouquet in it (the design's inline SVG, colours as tokens) */
function Vase() {
  return (
    <svg viewBox="30.5 12 32 40.5" className={styles.vase}>
      <path className={styles.fGreen} d="M43.80 29.40Q39.88 26.42 35.28 28.20Q39.21 31.18 43.80 29.40Z" stroke="currentColor" strokeWidth=".75" strokeLinejoin="round"/>
      <path className={styles.fGreen} d="M49.20 29.40Q53.79 31.18 57.72 28.20Q53.12 26.42 49.20 29.40Z" stroke="currentColor" strokeWidth=".75" strokeLinejoin="round"/>
      <path className={styles.fGreen} d="M44.60 21.20Q43.54 16.94 39.32 15.73Q40.38 19.99 44.60 21.20Z" stroke="currentColor" strokeWidth=".75" strokeLinejoin="round"/>
      <path className={styles.fGreen} d="M48.40 20.80Q52.62 19.59 53.68 15.33Q49.46 16.54 48.40 20.80Z" stroke="currentColor" strokeWidth=".75" strokeLinejoin="round"/>
      <path d="M45.4 31L44.2 25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path className={styles.sGreen} d="M45.4 31L44.2 25" strokeWidth=".6" strokeLinecap="round"/>
      <path d="M46.5 31L46.6 24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path className={styles.sGreen} d="M46.5 31L46.6 24" strokeWidth=".6" strokeLinecap="round"/>
      <path d="M47.6 31L49 25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path className={styles.sGreen} d="M47.6 31L49 25" strokeWidth=".6" strokeLinecap="round"/>
      <g className={styles.fPaper} stroke="currentColor" strokeWidth=".75">
      <circle cx="42.31" cy="22.79" r="1.6"/>
      <circle cx="40.84" cy="24.15" r="1.6"/>
      <circle cx="38.93" cy="23.56" r="1.6"/>
      <circle cx="38.49" cy="21.61" r="1.6"/>
      <circle cx="39.96" cy="20.25" r="1.6"/>
      <circle cx="41.87" cy="20.84" r="1.6"/>
      </g>
      <circle className={styles.fYellow} cx="40.40" cy="22.20" r="1.15" stroke="currentColor" strokeWidth=".75"/>
      <g className={styles.fPetal} stroke="currentColor" strokeWidth=".75">
      <circle cx="53.53" cy="23.83" r="1.65"/>
      <circle cx="51.15" cy="23.45" r="1.65"/>
      <circle cx="50.77" cy="21.07" r="1.65"/>
      <circle cx="52.92" cy="19.98" r="1.65"/>
      <circle cx="54.62" cy="21.68" r="1.65"/>
      </g>
      <circle className={styles.fPaper} cx="52.60" cy="22.00" r="1.19" stroke="currentColor" strokeWidth=".75"/>
      <g className={styles.fPink} stroke="currentColor" strokeWidth=".75">
      <circle cx="43.40" cy="14.30" r="1.7"/>
      <circle cx="45.40" cy="15.75" r="1.7"/>
      <circle cx="44.63" cy="18.10" r="1.7"/>
      <circle cx="42.16" cy="18.10" r="1.7"/>
      <circle cx="41.40" cy="15.75" r="1.7"/>
      </g>
      <circle className={styles.fPaper} cx="43.40" cy="16.40" r="1.22" stroke="currentColor" strokeWidth=".75"/>
      <g className={styles.fPaper} stroke="currentColor" strokeWidth=".75">
      <circle cx="51.79" cy="16.80" r="1.6"/>
      <circle cx="50.62" cy="18.42" r="1.6"/>
      <circle cx="48.63" cy="18.22" r="1.6"/>
      <circle cx="47.81" cy="16.40" r="1.6"/>
      <circle cx="48.98" cy="14.78" r="1.6"/>
      <circle cx="50.97" cy="14.98" r="1.6"/>
      </g>
      <circle className={styles.fYellow} cx="49.80" cy="16.60" r="1.15" stroke="currentColor" strokeWidth=".75"/>
      <g className={styles.fPaper} stroke="currentColor" strokeWidth=".75">
      <circle cx="48.62" cy="22.10" r="1.85"/>
      <circle cx="46.65" cy="23.30" r="1.85"/>
      <circle cx="44.64" cy="22.20" r="1.85"/>
      <circle cx="44.58" cy="19.90" r="1.85"/>
      <circle cx="46.55" cy="18.70" r="1.85"/>
      <circle cx="48.56" cy="19.80" r="1.85"/>
      </g>
      <circle className={styles.fYellow} cx="46.60" cy="21.00" r="1.33" stroke="currentColor" strokeWidth=".75"/>
      <g className={styles.fPetal} stroke="currentColor" strokeWidth=".75">
      <circle cx="44.81" cy="25.88" r="1.4"/>
      <circle cx="43.05" cy="26.94" r="1.4"/>
      <circle cx="41.50" cy="25.60" r="1.4"/>
      <circle cx="42.30" cy="23.70" r="1.4"/>
      <circle cx="44.35" cy="23.88" r="1.4"/>
      </g>
      <circle className={styles.fPaper} cx="43.20" cy="25.20" r="1.01" stroke="currentColor" strokeWidth=".75"/>
      <g className={styles.fPink} stroke="currentColor" strokeWidth=".75">
      <circle cx="51.92" cy="24.85" r="1.4"/>
      <circle cx="51.06" cy="26.72" r="1.4"/>
      <circle cx="49.02" cy="26.49" r="1.4"/>
      <circle cx="48.61" cy="24.47" r="1.4"/>
      <circle cx="50.40" cy="23.46" r="1.4"/>
      </g>
      <circle className={styles.fPaper} cx="50.20" cy="25.20" r="1.01" stroke="currentColor" strokeWidth=".75"/>
      <ellipse cx="46.5" cy="50.3" rx="9.5" ry="1.5" fill="currentColor" opacity=".1"/>
      <path className={styles.fVase} d="M43.5 29.5H49.5V31.6C49.5 32.6 50.2 33 51.2 33.6C54.6 35.5 55.6 39 54.8 42.6C54 46.6 51 49.6 47.6 49.6H45.4C42 49.6 39 46.6 38.2 42.6C37.4 39 38.4 35.5 41.8 33.6C42.8 33 43.5 32.6 43.5 31.6Z" stroke="currentColor" strokeWidth="1.15" strokeLinejoin="round"/>
      <path className={styles.sBand} d="M39.6 40.4H53.4" strokeWidth=".9" strokeLinecap="round"/>
      <path className={styles.sPaper} d="M41 37.4Q41.4 35.4 43.2 34.8" fill="none" strokeWidth=".8" strokeLinecap="round" opacity=".75"/>
      <path d="M42.6 29.5H50.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function Swatches() {
  return (
    <div className={styles.swatches}>
      <i className={styles.swatchBlue} />
      <i className={styles.swatchSand} />
      <i className={styles.swatchSlate} />
    </div>
  );
}

/** the product copy, shared by both pages */
function Product() {
  return (
    <>
      <span className={styles.tag}>New · Stoneware</span>
      <div className={styles.title}>The blue vase.</div>
      <p className={styles.desc}>Hand-thrown stoneware, glazed in a deep ocean blue. 24&nbsp;cm tall.</p>
      <Swatches />
      <div className={styles.buy}>
        <span className={styles.price}>$48</span>
        <span className={styles.btn}>Add to cart</span>
      </div>
      <div className={styles.note}>Free shipping · 30-day returns</div>
    </>
  );
}

function DesktopShop() {
  return (
    <>
      <div className={styles.nav}>
        <span className={styles.logo}>
          <i className={styles.mark} />
          Bloom
        </span>
        <span className={styles.links}>
          <span>Shop</span>
          <span>Journal</span>
          <span>About</span>
        </span>
        <span className={styles.cart}>Cart (1)</span>
      </div>
      <div className={styles.hero}>
        <div>
          <Product />
        </div>
        <div className={styles.photo}>
          <Vase />
        </div>
      </div>
    </>
  );
}

function PhoneShop() {
  return (
    <>
      <div className={styles.nav}>
        <span className={styles.logo}>
          <i className={styles.mark} />
          Bloom
        </span>
        <span className={styles.menu} />
      </div>
      <div className={styles.photo}>
        <Vase />
      </div>
      <Product />
    </>
  );
}

interface FrameProps {
  device: Device;
  title: string;
  width?: string;
  active: boolean;
  hidden?: boolean;
  pressed?: boolean;
  built: boolean;
  children: ReactNode;
}

/** a frame on the mock canvas: Upmade's object titlebar as a chip above it, the generated page (or its loading panel) */
function Frame({ device, title, width, active, hidden = false, pressed = false, built, children }: FrameProps) {
  return (
    <div
      className={styles.frame}
      style={frameStyle(device)}
      data-device={device}
      data-active={flag(active)}
      data-hidden={flag(hidden)}
    >
      <div className={styles.titlebar}>
        <span className={styles.play}>
          <PlayIcon />
        </span>
        <span>{title}</span>
        {width && <span className={styles.width}>{width}</span>}
        <span className={styles.add} data-pressed={flag(pressed)}>
          <PlusIcon />
        </span>
      </div>
      <div className={styles.page}>
        <div className={styles.shop}>
          <div className={styles.build} data-built={flag(built)}>
            {children}
          </div>
        </div>
        <div className={styles.loading} data-done={flag(built)} />
      </div>
    </div>
  );
}

/**
 * "Build generative UI" (the design's .frames-demo): an agent generates a small shop page for the blue vase in a
 * desktop frame (a grey loading panel with a sweeping glare, then the page pops in); its black arrow cursor flies to
 * the add button in the frame's titlebar and presses it, a phone frame appears and generates the same page, and the
 * view recentres on both. Then the round starts over. Decorative: hidden from assistive technology (the showcase's
 * copy describes it).
 *
 * - Laid out on a 1000 x 687.5 ScaledStage ("cover"; the design's cqw are 10 virtual px), with the shop pages at
 *   their own readable widths (800 / 300 px) scaled to their frames, so no text is shrunk with font-size and a
 *   browser's minimum font size cannot break the layout (plan §3.7). Outlines divide by the stage's --k to keep
 *   the design's real widths.
 * - The server renders the finished state (both frames built), which is also what reduced motion shows. The rounds
 *   play only while the demo is in view; leaving the view cancels the pending steps, coming back starts a new round.
 */
export default function FramesDemo(_: MediaComponentProps<"framesDemo">): ReactNode {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const inView = useInView(rootRef, { rootMargin: "0px", threshold: 0.3 });
  const [state, setState] = useState<BuildState>(FINAL_STATE);

  useEffect(() => {
    if (reducedMotion) {
      setState(FINAL_STATE);
      return;
    }
    if (!inView) return;
    let timers: number[] = [];
    const clear = () => {
      timers.forEach(window.clearTimeout);
      timers = [];
    };
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const run = () => {
      clear();
      setState(START_STATE);
      for (const { ms, patch } of STEPS) at(ms, () => setState((current) => ({ ...current, ...patch })));
      at(LOOP_MS, run);
    };
    run();
    return clear;
  }, [inView, reducedMotion]);

  return (
    <div ref={rootRef} className={styles.root} aria-hidden="true" data-frames-demo="">
      <ScaledStage width={STAGE_W} height={STAGE_H} fit="cover" fill>
        <div className={styles.world} style={STAGE_STYLE} data-solo={flag(!state.phone)}>
          <Frame device="desktop" title="Desktop" width="1200" active={!state.phone} pressed={state.pressed} built={state.built}>
            <DesktopShop />
          </Frame>
          <Frame device="phone" title="Phone" active={state.phone} hidden={!state.phone} built={state.phoneBuilt}>
            <PhoneShop />
          </Frame>
          <div
            className={styles.cursor}
            style={{ transform: cursorTransform(state.target) }}
            data-hidden={flag(state.target === "offscreen")}
            data-pressed={flag(state.pressed)}
          >
            <svg viewBox="0 0 24 24">
              <path d="M3 2l7.5 19 2.6-7.6L21 10.6z" />
            </svg>
          </div>
        </div>
      </ScaledStage>
    </div>
  );
}
