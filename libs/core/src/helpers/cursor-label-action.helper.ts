import type { UpmadeCore } from '../classes/core/core.class';
import type { UpmadeCursorLabelAction, UpmadeCursorLabelActionEvent } from '../interfaces/cursor-label.interface';
import { UPMADE_REMOVE_AGENT_CURSOR_ACTION } from '../interfaces/cursor-label.interface';

/** Marks interactive controls in the engine's overlays (e.g. cursor label buttons): they never start drags or selections. */
export const UPMADE_OVERLAY_CONTROL_ATTRIBUTE = 'data-upmade-overlay-control';

/** Whether the event started on an interactive overlay control. */
export function isOverlayControlEvent(event: { composedPath?: () => EventTarget[] }): boolean {
  return (event.composedPath?.() ?? []).some(
    target => typeof (target as Element).hasAttribute === 'function' && (target as Element).hasAttribute(UPMADE_OVERLAY_CONTROL_ATTRIBUTE),
  );
}

/**
 * Runs a clicked cursor label button: its `onClick`, or for an agent's built-in `'remove'` action without one, the
 * agent's removal. Then the engine emits `cursorLabelAction`.
 */
export function runCursorLabelAction(core: UpmadeCore, action: UpmadeCursorLabelAction, event: UpmadeCursorLabelActionEvent): void {
  try {
    if (action.onClick) {
      action.onClick(event);
    } else if (event.cursorKind === 'agent' && event.agentId && action.id === UPMADE_REMOVE_AGENT_CURSOR_ACTION.id) {
      core.agentManager.remove(event.agentId);
    }
  } catch (error) {
    console.error('[Upmade] A cursor label action failed:', error);
  }
  core.engine?.emitCursorLabelAction?.(event);
}
