import { useCallback, useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode } from "react";
import clsx from "clsx";
import Icon from "../../../Brand/Icon";
import type { Subscribe } from "../../hooks/useSectionSignal";
import { toolOfEvent } from "../../toolCycle";
import { TOOLS, type ToolKey } from "./tools";
import styles from "./styles.module.css";

export { TOOLS, TOOL_KEYS, type ToolKey } from "./tools";

export interface ToolbarProps {
  /** the tools to show, in order */
  tools: readonly ToolKey[];
  /** the selected tool (controlled); leave out to let the toolbar keep its own selection */
  value?: ToolKey;
  /** the first selection when uncontrolled; the first tool by default ("cursor" in the hero) */
  defaultValue?: ToolKey;
  /** called when a tool is clicked or activated by keyboard */
  onChange?: (tool: ToolKey) => void;
  /**
   * the toolCycle agent's events (a section signal's `subscribe`): each `tool:<name>` of a tool in `tools` selects it
   * (when uncontrolled), so the pill follows the agent. Not called for clicks: those go to `onChange`
   */
  subscribe?: Subscribe;
  /** the toolbar's accessible name */
  label?: string;
  className?: string;
}

/**
 * The editor toolbar of the hero (the design's .toolbar/.tool/.tb-pill): one button per tool and a black pill that
 * slides to the selected one.
 *
 * - `role="toolbar"` with a roving tabindex that rests on the selected tool: Tab reaches the toolbar once, on the
 *   selected tool; arrow keys (and Home/End) move between tools, wrapping at the ends; Enter/Space select. When focus
 *   leaves the toolbar the tab stop goes back to the selected tool. Each tool has an aria-label, a title (tooltip)
 *   and `aria-pressed`.
 * - The pill is placed from a ref per button (never by querying class names), again on resize and once the fonts
 *   are ready. Until it is placed (server HTML, before hydration) the selected tool paints its own background.
 * - With `subscribe` (the hero, `toolbar.syncWithAgent`) the agent's `tool:*` events move the selection, and the pill
 *   slides with it. While focus is inside the toolbar the tab stop stays where the keyboard user put it (the arrow
 *   keys move on from the focused tool, not from the agent's); it goes back to the selected tool when focus leaves.
 */
export default function Toolbar({ tools, value, defaultValue, onChange, subscribe, label = "Canvas tools", className }: ToolbarProps): ReactNode {
  const [own, setOwn] = useState<ToolKey>(defaultValue ?? tools[0]);
  const selected = value ?? own;
  const selectedIndex = Math.max(0, tools.indexOf(selected));
  const [focusIndex, setFocusIndex] = useState(selectedIndex);

  const barRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedRef = useRef(selectedIndex);
  selectedRef.current = selectedIndex;

  const place = useCallback((instant: boolean) => {
    const bar = barRef.current;
    const pill = pillRef.current;
    const button = buttonRefs.current[selectedRef.current];
    if (!bar || !pill || !button) return;
    pill.classList.toggle(styles.instant, instant);
    pill.style.width = `${button.offsetWidth}px`;
    pill.style.height = `${button.offsetHeight}px`;
    pill.style.transform = `translate(${button.offsetLeft}px, ${button.offsetTop}px)`;
    bar.setAttribute("data-pill-placed", "");
    if (instant) {
      void pill.offsetWidth; // apply the jump before transitions come back
      pill.classList.remove(styles.instant);
    }
  }, []);

  // first placement, then on resize and once web fonts have loaded (both can move the buttons)
  useEffect(() => {
    place(true);
    const bar = barRef.current;
    let cancelled = false;
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => place(true));
    if (bar && observer) observer.observe(bar);
    document.fonts?.ready.then(() => !cancelled && place(true));
    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [place]);

  // the agent's tool events select (local state, so only the toolbar renders)
  useEffect(() => {
    if (!subscribe) return;
    return subscribe((name) => {
      const tool = toolOfEvent(name) as ToolKey | null;
      if (tool && tools.includes(tool)) setOwn(tool);
    });
  }, [subscribe, tools]);

  // slide to a new selection; the tab stop follows it (a click, a keyboard selection, the agent or a new controlled
  // value), unless focus is in the toolbar: then it stays on the focused tool (see onBlur)
  useEffect(() => {
    place(false);
    if (!barRef.current?.contains(document.activeElement)) setFocusIndex(selectedIndex);
  }, [selectedIndex, place]);

  // focus left the toolbar: Tab brings it back to the selected tool
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusIndex(selectedRef.current);
  };

  const select = (tool: ToolKey) => {
    if (value === undefined) setOwn(tool);
    onChange?.(tool);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = tools.length - 1;
    const moves: Record<string, number> = {
      ArrowRight: focusIndex === last ? 0 : focusIndex + 1,
      ArrowDown: focusIndex === last ? 0 : focusIndex + 1,
      ArrowLeft: focusIndex === 0 ? last : focusIndex - 1,
      ArrowUp: focusIndex === 0 ? last : focusIndex - 1,
      Home: 0,
      End: last,
    };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setFocusIndex(next);
    buttonRefs.current[next]?.focus();
  };

  return (
    <div ref={barRef} className={clsx(styles.toolbar, className)} role="toolbar" aria-label={label} aria-orientation="horizontal" onKeyDown={onKeyDown} onBlur={onBlur}>
      <span ref={pillRef} className={styles.pill} aria-hidden="true" />
      {tools.map((tool, index) => {
        const { label: toolLabel, icon } = TOOLS[tool];
        const isSelected = index === selectedIndex;
        return (
          <button
            key={tool}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            type="button"
            className={clsx(styles.tool, isSelected && styles.selected)}
            data-tool={tool}
            aria-label={toolLabel}
            aria-pressed={isSelected}
            title={toolLabel}
            tabIndex={index === focusIndex ? 0 : -1}
            onFocus={() => setFocusIndex(index)}
            onClick={() => select(tool)}
          >
            <Icon size={24} strokeWidth={1.5}>
              {icon}
            </Icon>
          </button>
        );
      })}
    </div>
  );
}
