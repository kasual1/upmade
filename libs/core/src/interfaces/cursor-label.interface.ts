/** A button after the name or status on a cursor label, e.g. the "X" that removes an agent. */
export interface UpmadeCursorLabelAction {
  /** Identifies the button in `cursorLabelAction` events. */
  id: string;
  /** A registered icon name (e.g. `'x'`), SVG markup or an image URL. */
  icon: string;
  /** Tooltip and accessible name. */
  label?: string;
  /**
   * Called when the button is clicked, before the engine emits `cursorLabelAction`. Without it, the built-in
   * `'remove'` action of an agent removes the agent.
   */
  onClick?: (event: UpmadeCursorLabelActionEvent) => void;
}

/** Detail of the `cursorLabelAction` event: a button on a cursor label was clicked. */
export interface UpmadeCursorLabelActionEvent {
  /** `id` of the clicked action. */
  actionId: string;
  /** Whose cursor it is. */
  cursorKind: 'agent' | 'user';
  /** The agent's ID, for an agent's cursor. */
  agentId?: string;
  /** The user's ID, for a collaborator's cursor. */
  userId?: string;
  /** Awareness client ID of the collaborator, for a collaborator's cursor. */
  clientId?: number;
  /** Client rect of the clicked button, e.g. for anchoring a popover. */
  anchorRect: DOMRect;
}

/** The built-in action of agents: an "X" that removes the agent from the editor. Agents show it by default. */
export const UPMADE_REMOVE_AGENT_CURSOR_ACTION: Readonly<UpmadeCursorLabelAction> = Object.freeze({
  id: 'remove',
  icon: 'x',
  label: 'Remove agent',
});
