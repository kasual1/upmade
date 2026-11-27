import { FunctionalComponent, h } from '@stencil/core';
import {
  UPMADE_OVERLAY_CONTROL_ATTRIBUTE,
  UpmadeCursorLabelAction,
  UpmadeIconRegistry,
  UpmadeOverlayEdge,
  UpmadeViewportOverlayHelper,
} from '@upmade/core';

/** Arrow-shaped pointer used by remote and agentic cursors. */
export const CursorArrow: FunctionalComponent<{ color: string }> = ({ color }) => (
  <svg class="cursor-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 3L19 12L12 13L9 20L5 3Z" fill={color} stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round" />
  </svg>
);

interface CursorLabelProps {
  /** The name. */
  text: string;
  /** What the user or agent is doing, e.g. `'Thinking…'`; shown in place of the name while set. */
  status?: string | null;
  /** SVG markup or image URL shown before the text. When omitted or not usable, a circle in `color` is shown instead. */
  icon?: string | null;
  /** Color of the user or agent, for the default icon: a filled circle. No icon without one. */
  color?: string;
  /** Buttons after the name or status. */
  actions?: readonly UpmadeCursorLabelAction[];
  /** Called when one of `actions` is clicked, with the clicked button. */
  onAction?: (action: UpmadeCursorLabelAction, button: HTMLElement) => void;
  classes?: Record<string, boolean>;
  style?: Record<string, string>;
}

/**
 * Label rendered next to a cursor arrow: a white pill with an icon before the name, by default a circle in the
 * cursor's color. While a status is set, it shows in place of the name (the dot pulses), then the name comes back.
 * A custom icon is drawn as an image (never as markup), so icons from collaborators cannot run scripts.
 */
export const CursorLabel: FunctionalComponent<CursorLabelProps> = ({ text, status, icon, color, actions, onAction, classes, style }) => {
  const iconSrc = UpmadeViewportOverlayHelper.getCursorIconSrc(icon);
  const showDot = !iconSrc && !!color;
  const statusText = status || null;
  return (
    <span
      class={{ 'cursor-label': true, 'has-icon': !!iconSrc, 'has-dot': showDot, 'has-status': !!statusText, 'has-actions': !!actions?.length, ...classes }}
      style={style}
      title={statusText ? (text ? `${text}: ${statusText}` : statusText) : undefined}
    >
      {iconSrc && <img class="cursor-label-icon" src={iconSrc} alt="" aria-hidden="true" draggable={false} />}
      {showDot && <span class="cursor-label-icon cursor-label-dot" style={{ backgroundColor: color }} aria-hidden="true"></span>}
      {/* Re-keyed between name and status, so the switch fades in; a new status text keeps the element. */}
      <span key={statusText ? 'status' : 'name'} class="cursor-label-text">
        {statusText ?? text}
      </span>
      {actions?.map(action => (
        renderActionButton(action, onAction)
      ))}
    </span>
  );
};

/**
 * A button after the label text. The label itself never takes the pointer; its buttons do, and are marked as
 * overlay controls so pressing them never starts a drag or a selection on the canvas.
 */
function renderActionButton(action: UpmadeCursorLabelAction, onAction?: (action: UpmadeCursorLabelAction, button: HTMLElement) => void) {
  // A registered icon is drawn as markup (it is trusted and follows the text color); anything else as an image.
  const isRegistered = UpmadeIconRegistry.has(action.icon);
  const iconSrc = isRegistered ? null : UpmadeViewportOverlayHelper.getCursorIconSrc(action.icon);
  return (
    <button
      key={`action-${action.id}`}
      type="button"
      class="cursor-label-action"
      data-action-id={action.id}
      title={action.label}
      aria-label={action.label ?? action.id}
      {...{ [UPMADE_OVERLAY_CONTROL_ATTRIBUTE]: '' }}
      onPointerDown={(event: PointerEvent) => event.stopPropagation()}
      onClick={(event: MouseEvent) => {
        event.stopPropagation();
        const button = event.currentTarget as HTMLElement;
        // Pointer clicks should not leave focus on the button, or canvas shortcuts stop working.
        if (event.detail > 0) button.blur();
        onAction?.(action, button);
      }}
    >
      {isRegistered && <upmade-icon name={action.icon} size={14}></upmade-icon>}
      {iconSrc && <img class="cursor-label-action-icon" src={iconSrc} alt="" aria-hidden="true" draggable={false} />}
    </button>
  );
}

interface EdgeIndicatorProps {
  /** Stable vdom key for the indicator element. */
  indicatorKey: string;
  x: number;
  y: number;
  /** Direction towards the off-screen cursor, in radians. */
  angle: number;
  edge: UpmadeOverlayEdge;
  color: string;
  label: string;
  /** Icon of the cursor's label, shown before the initials. */
  icon?: string | null;
  classes?: Record<string, boolean>;
}

/** Distance from the indicator's center to the near side of its label. */
const EDGE_LABEL_OFFSET = 12;

/** Indicator pinned to the viewport edge, pointing towards an off-screen cursor. */
export const EdgeIndicator: FunctionalComponent<EdgeIndicatorProps> = ({ indicatorKey, x, y, angle, edge, color, label, icon, classes }) => {
  const arrowDeg = (angle * 180) / Math.PI + 90;

  // The label is centered on the indicator: move it into the viewport by half its own size plus the offset, so a
  // wider label (an icon, two initials) never covers the arrow.
  let labelTransform = 'none';
  if (edge === 'left') {
    labelTransform = `translateX(calc(50% + ${EDGE_LABEL_OFFSET}px))`;
  } else if (edge === 'right') {
    labelTransform = `translateX(calc(-50% - ${EDGE_LABEL_OFFSET}px))`;
  } else if (edge === 'top') {
    labelTransform = `translateY(calc(50% + ${EDGE_LABEL_OFFSET}px))`;
  } else if (edge === 'bottom') {
    labelTransform = `translateY(calc(-50% - ${EDGE_LABEL_OFFSET}px))`;
  }

  return (
    <div key={indicatorKey} class={{ 'edge-indicator': true, ...classes }} style={{ transform: `translate(${x}px, ${y}px)` }}>
      <svg class={{ 'edge-arrow': true, ...classes }} width="16" height="16" viewBox="0 0 16 16" style={{ transform: `rotate(${arrowDeg}deg)` }}>
        <path d="M8 1L14 13H2L8 1Z" fill={color} stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round" />
      </svg>
      <CursorLabel text={label} icon={icon} color={color} classes={{ 'edge-label': true }} style={{ transform: labelTransform }} />
    </div>
  );
};
