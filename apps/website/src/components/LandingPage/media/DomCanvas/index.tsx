import {
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import ScaledStage from "../../primitives/ScaledStage";
import type { MediaComponentProps } from "../registry";
import Calculator from "./Calculator";
import { calculatorReducer, INITIAL_CALCULATOR_STATE, type CalculatorAction } from "./calculator-state";
import styles from "./styles.module.css";

/** The virtual size the calculator and the markup are laid out at (the design's 560px wide frame, 16:11). */
const STAGE_W = 560;
const STAGE_H = 385;
/** Arrow keys move the divider by this many percent. */
const KEY_STEP = 5;
/** How far the divider leans from its middle to either end, as a share of the width (--tilt: 10cqw). */
const TILT = 0.1;

/** Room (px) kept between a focused key and the divider, so its focus ring shows too. */
const FOCUS_ROOM = 8;

/** The divider knob's radius, border included (.knob: 42px, plus a little). */
const KNOB_R = 24;

const clamp = (value: number) => Math.min(100, Math.max(0, value));

type Attributes = ReadonlyArray<readonly [name: string, value: ReactNode]>;

/** A token of the markup: every text-bearing element carries data-font="mono" (the global Inter rule skips only it). */
function Token({ kind, children }: { kind: "punct" | "tag" | "attr" | "string" | "value"; children: ReactNode }) {
  return (
    <span className={styles[kind]} data-font="mono">
      {children}
    </span>
  );
}

function Attrs({ attrs }: { attrs: Attributes }) {
  return attrs.map(([name, value], index) => (
    <span key={name} data-font="mono">
      {index > 0 && " "}
      <Token kind="attr">{name}</Token>
      <Token kind="punct">=</Token>
      <Token kind="string">"{value}"</Token>
    </span>
  ));
}

/** An opening tag; `unclosed` leaves off the `>` so its attributes can continue on the next line. */
function OpenTag({ name, attrs, unclosed }: { name: string; attrs?: Attributes; unclosed?: boolean }) {
  return (
    <>
      <Token kind="punct">&lt;</Token>
      <Token kind="tag">{name}</Token>
      {attrs && (
        <>
          {" "}
          <Attrs attrs={attrs} />
        </>
      )}
      {!unclosed && <Token kind="punct">&gt;</Token>}
    </>
  );
}

function CloseTag({ name }: { name: string }) {
  return (
    <>
      <Token kind="punct">&lt;/</Token>
      <Token kind="tag">{name}</Token>
      <Token kind="punct">&gt;</Token>
    </>
  );
}

/** A numbered line of markup (the number is a CSS counter); the indent is in ch of the mono font. */
function Line({ indent = 0, children }: { indent?: number; children: ReactNode }) {
  return (
    <div className={styles.line} data-font="mono">
      <span className={styles.lineText} data-font="mono" style={{ paddingLeft: `${indent * 2}ch` }}>
        {children}
      </span>
    </div>
  );
}

/**
 * The DOM based canvas demo (plan §2 row 4): a working calculator on the canvas, and behind it the markup that puts
 * it there. A tilted divider wipes between the two; only its knob is grabbable, so keys next to the line stay
 * clickable. Every key press writes the display into the markup and flashes that line. A key that gets keyboard
 * focus while the markup covers it moves the divider right until it shows (focus is never hidden, WCAG 2.4.11).
 *
 * The calculator and the markup are laid out at a fixed virtual size in ScaledStages (real fonts of 12px or more,
 * scaled down with the frame, plan §3.7); the badges stay at their real size. `--tilt` is the only cqw (geometry).
 */
export default function DomCanvas({ props }: MediaComponentProps<"domCanvas">): ReactNode {
  const [state, dispatch] = useReducer(calculatorReducer, INITIAL_CALCULATOR_STATE);
  const [split, setSplit] = useState(() => clamp(Math.round((props?.split ?? 0.5) * 100)));
  const rootRef = useRef<HTMLDivElement>(null);
  const valueLineRef = useRef<HTMLDivElement>(null);

  // every press flashes the markup line that holds the value (as the design does); restarted by re-adding the class,
  // which React does not manage (the line's className never changes)
  const press: Dispatch<CalculatorAction> = (action) => {
    dispatch(action);
    const line = valueLineRef.current;
    if (!line) return;
    line.classList.remove(styles.flash);
    void line.offsetWidth;
    line.classList.add(styles.flash);
  };

  // drags are relative to where the knob was grabbed, so a knob held inside the frame at either end
  // (see .knob in styles.module.css) does not jump when grabbed
  const dragRef = useRef<{ x: number; split: number } | null>(null);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, split };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const rect = rootRef.current?.getBoundingClientRect();
    if (!drag || !rect || rect.width <= 0 || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    // the split runs TILT past each edge so the slanted line can clear the frame at either end
    const dx = (event.clientX - drag.x) / rect.width;
    setSplit(clamp(drag.split + (dx / (1 + 2 * TILT)) * 100));
  };

  const onPointerEnd = () => {
    dragRef.current = null;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = {
      ArrowLeft: split - KEY_STEP,
      ArrowDown: split - KEY_STEP,
      ArrowRight: split + KEY_STEP,
      ArrowUp: split + KEY_STEP,
      PageDown: split - 2 * KEY_STEP,
      PageUp: split + 2 * KEY_STEP,
      Home: 0,
      End: 100,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setSplit(clamp(next));
  };

  // keyboard focus never hides under the markup (WCAG 2.4.11): a calculator control that gets focus while the divider
  // covers it pushes the divider right until the whole control (and its ring) is on the canvas side
  const onCanvasFocus = (event: FocusEvent<HTMLDivElement>) => {
    const root = rootRef.current;
    if (!root || event.target === event.currentTarget) return;
    const box = root.getBoundingClientRect();
    const rect = event.target.getBoundingClientRect();
    if (box.width <= 0 || box.height <= 0) return;
    const tilt = TILT * box.width;
    // the divider at height y sits at x + tilt * (1 - 2y / H); it is furthest left at the control's bottom edge
    const right = rect.right - box.left + FOCUS_ROOM;
    const bottom = Math.min(box.height, Math.max(0, rect.bottom - box.top + FOCUS_ROOM));
    let x = right - tilt + (2 * tilt * bottom) / box.height;
    // the knob (KNOB_R, see .knob) sits on the divider at mid-height: keep a control level with it clear of it too
    const top = rect.top - box.top - FOCUS_ROOM;
    if (top < box.height / 2 + KNOB_R && bottom > box.height / 2 - KNOB_R) x = Math.max(x, right + KNOB_R);
    const needed = Math.ceil(((x + tilt) / (box.width + 2 * tilt)) * 100);
    setSplit((current) => (needed > current ? clamp(needed) : current));
  };

  const now = Math.round(split);

  return (
    <div ref={rootRef} className={styles.root} style={{ "--split": split / 100 } as CSSProperties}>
      <div className={styles.canvas} onFocus={onCanvasFocus}>
        <span className={styles.badge}>Canvas</span>
        <div className={styles.stageBox}>
          <ScaledStage width={STAGE_W} height={STAGE_H}>
            <div className={styles.center}>
              <Calculator state={state} dispatch={press} label="Calculator on the canvas" />
            </div>
          </ScaledStage>
        </div>
      </div>
      <div className={styles.source} aria-hidden="true">
        <span className={`${styles.badge} ${styles.badgeDark}`}>DOM</span>
        <div className={styles.stageBox}>
          <ScaledStage width={STAGE_W} height={STAGE_H}>
            <div className={styles.center}>
              <div className={styles.code} data-font="mono">
                <Line>
                  <OpenTag name="html" />
                </Line>
                <Line indent={1}>
                  <OpenTag name="head" />
                </Line>
                <Line indent={2}>
                  <OpenTag name="script" attrs={[["src", "upmade.js"]]} />
                  <CloseTag name="script" />
                </Line>
                <Line indent={1}>
                  <CloseTag name="head" />
                </Line>
                <Line indent={1}>
                  <OpenTag name="body" />
                </Line>
                <Line indent={2}>
                  <OpenTag name="upmade-editor" attrs={[["theme", "light"]]} />
                </Line>
                <Line indent={3}>
                  <OpenTag name="upmade-dynamic-object" unclosed />
                </Line>
                <Line indent={4}>
                  <Attrs
                    attrs={[
                      ["x", "120"],
                      ["y", "80"],
                    ]}
                  />
                  <Token kind="punct">&gt;</Token>
                </Line>
                <div ref={valueLineRef} className={`${styles.line} ${styles.highlight}`} data-font="mono">
                  <span className={styles.lineText} data-font="mono" style={{ paddingLeft: "8ch" }}>
                    <OpenTag name="app-calculator" attrs={[["value", <Token kind="value">{state.display}</Token>]]} />
                  </span>
                </div>
                <Line indent={4}>
                  <CloseTag name="app-calculator" />
                </Line>
                <Line indent={3}>
                  <CloseTag name="upmade-dynamic-object" />
                </Line>
                <Line indent={2}>
                  <CloseTag name="upmade-editor" />
                </Line>
                <Line indent={1}>
                  <CloseTag name="body" />
                </Line>
                <Line>
                  <CloseTag name="html" />
                </Line>
              </div>
            </div>
          </ScaledStage>
        </div>
      </div>
      <div
        className={styles.handle}
        role="slider"
        tabIndex={0}
        aria-label="Canvas and DOM split"
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={now}
        aria-valuetext={`${now}% canvas, ${100 - now}% DOM`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onKeyDown={onKeyDown}
      >
        <span className={styles.knob}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="m9 7-5 5 5 5" />
            <path d="m15 7 5 5-5 5" />
          </svg>
        </span>
      </div>
    </div>
  );
}
