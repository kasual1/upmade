import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import clsx from "clsx";
import Icon from "../../../Brand/Icon";
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
  /** the toolbar's accessible name */
  label?: string;
  className?: string;
}

/**
 * The editor toolbar of the hero (the design's .toolbar/.tool/.tb-pill): one button per tool and a black pill that
 * slides to the selected one.
 *
 * - `role="toolbar"` with a roving tabindex: Tab reaches the toolbar once; arrow keys (and Home/End) move between
 *   tools; Enter/Space select. Each tool has an aria-label and `aria-pressed`.
 * - The pill is placed from a ref per button (never by querying class names), again on resize and once the fonts
 *   are ready. Until it is placed (server HTML, before hydration) the selected tool paints its own background.
 * - Per plan §0 the toolbar is not synced to the toolCycle agent yet: it starts on its first tool and a click only
 *   selects.
 */
export default function Toolbar({ tools, value, defaultValue, onChange, label = "Canvas tools", className }: ToolbarProps): ReactNode {
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

  // slide to a new selection
  useEffect(() => place(false), [selectedIndex, place]);

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
    <div ref={barRef} className={clsx(styles.toolbar, className)} role="toolbar" aria-label={label} aria-orientation="horizontal" onKeyDown={onKeyDown}>
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
