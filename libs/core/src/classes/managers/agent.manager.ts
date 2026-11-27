import type { UpmadeCore } from '../core/core.class';
import { UpmadeAgent, isUpmadeAgent } from '../agent/agent.class';
import type { UpmadeAgentPresence } from '../../interfaces/agent.interface';
import { UpmadeEventHelper } from '../../helpers/event.helper';

/**
 * The agents added to one editor. Behind `editor.addAgent()`, `removeAgent()`, `getAgent()`,
 * `getAgents()` and the `agentsChange` event.
 *
 * An agent belongs to one editor at a time. Agents stay added when the engine is disconnected
 * (Stencil disconnects and reconnects elements that move in the DOM); an agent of an engine that was
 * torn down can be added to another editor, which removes it from the old one.
 */
export class UpmadeAgentManager {
  private readonly _core: UpmadeCore;
  private readonly _agents = new Map<string, UpmadeAgent>();
  private readonly _agentSubscriptions = new Map<string, () => void>();
  private readonly _changeListeners = new Set<() => void>();
  private _changeScheduled = false;
  private _disposed = false;
  /** Element agents come out from behind and go back behind (the editor's chat box), or `null`. */
  private _home: HTMLElement | null = null;
  /** Agents flying home before they are removed, with what resolves once they are gone. */
  private readonly _leaving = new Map<string, { done: Promise<void>; resolve: () => void }>();

  constructor(core: UpmadeCore) {
    this._core = core;
  }

  /** Whether the engine of this core is disconnected. */
  get isDisposed(): boolean {
    return this._disposed;
  }

  /** Called by the engine when it disconnects (`true`) or connects (`false`). @internal */
  setDisposed(disposed: boolean): void {
    this._disposed = disposed;
    if (disposed) {
      // Nothing animates anymore: agents on their way home are removed at once.
      Array.from(this._leaving.keys()).forEach(id => this.finishLeaving(id));
    }
  }

  // ─── Home ───────────────────────────────────────────────────────────────────

  /**
   * The element agents come out from behind when added and go back behind when removed, e.g. the editor's chat box.
   * `null` (the default) keeps agents appearing at the viewport center and disappearing where they are.
   */
  get home(): HTMLElement | null {
    return this._home;
  }

  /** Sets the home element, see `home`. @internal */
  setHome(element: HTMLElement | null): void {
    this._home = element ?? null;
  }

  /**
   * The home element's box, relative to the engine's host element (the coordinates cursors are drawn in), or `null`
   * when there is no home or it is not shown.
   */
  getHomeRect(): { left: number; top: number; right: number; bottom: number } | null {
    const home = this._home;
    const host = this._core.engine?.host;
    if (!home || !host || !home.isConnected || typeof home.getBoundingClientRect !== 'function') {
      return null;
    }
    const rect = home.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return null;
    }
    const origin = host.getBoundingClientRect();
    return { left: rect.left - origin.left, top: rect.top - origin.top, right: rect.right - origin.left, bottom: rect.bottom - origin.top };
  }

  /** The center of the home element in world coordinates, where agents appear and leave; `null` without a home. */
  getHomePoint(): { x: number; y: number } | null {
    const rect = this.getHomeRect();
    const state = this._core.store?.state;
    if (!rect || !state || !(state.scale > 0)) {
      return null;
    }
    const x = (rect.left + rect.right) / 2;
    const y = (rect.top + rect.bottom) / 2;
    return { x: (x - state.translateX) / state.scale, y: (y - state.translateY) / state.scale };
  }

  /** Whether the agent is flying home to be removed. */
  isLeaving(agentOrId: UpmadeAgent | string): boolean {
    return this._leaving.has(typeof agentOrId === 'string' ? agentOrId : agentOrId?.id);
  }

  /** Resolves once the agent is removed (at once when it is not leaving). */
  whenRemoved(agentOrId: UpmadeAgent | string): Promise<void> {
    return this._leaving.get(typeof agentOrId === 'string' ? agentOrId : agentOrId?.id)?.done ?? Promise.resolve();
  }

  /**
   * Adds an agent and shows its cursor. Adding the same agent again does nothing.
   * Throws for anything that is not an `UpmadeAgent`, for a second agent with the same ID, and for an
   * agent that belongs to another editor that is still connected.
   */
  add(agent: UpmadeAgent): UpmadeAgent {
    if (!isUpmadeAgent(agent)) {
      throw new TypeError('addAgent() expects an UpmadeAgent.');
    }
    const existing = this._agents.get(agent.id);
    if (existing === agent) {
      // Added again on its way home: it stays.
      this.stopLeaving(agent.id);
      return agent;
    }
    if (existing) {
      throw new Error(`An agent with the ID "${agent.id}" is already added.`);
    }
    const owner = agent._owner;
    if (owner && owner !== this._core) {
      if (!owner.agentManager.isDisposed) {
        throw new Error(`Agent "${agent.id}" belongs to another editor. Remove it there first.`);
      }
      owner.agentManager.remove(agent);
    }

    agent._attach(this._core);
    this._agents.set(agent.id, agent);
    this._agentSubscriptions.set(agent.id, agent.on('change', () => this.scheduleChange()));
    this.scheduleChange();
    return agent;
  }

  /**
   * Removes an agent: its running action is rolled back, queued actions resolve with `'agent-removed'`, and its
   * cursor and history are dropped. With a home (the editor's chat box), the cursor first flies back behind it, and
   * the agent is removed when it arrives (`whenRemoved()`); it accepts no actions meanwhile. `immediate` removes it at
   * once. Returns `false` if the agent was not added.
   */
  remove(agentOrId: UpmadeAgent | string, options: { immediate?: boolean } = {}): boolean {
    const id = typeof agentOrId === 'string' ? agentOrId : agentOrId?.id;
    const agent = id !== undefined ? this._agents.get(id) : undefined;
    if (!agent || (typeof agentOrId !== 'string' && agentOrId !== agent)) {
      return false;
    }
    if (this._leaving.has(agent.id)) {
      if (options.immediate) this.finishLeaving(agent.id);
      return true;
    }
    const cursor = this._core.agenticCursorManager.get(agent.id);
    const home = !options.immediate && !this._disposed && cursor?.visible ? this.getHomePoint() : null;
    if (!home) {
      this.detach(agent);
      return true;
    }

    let resolve!: () => void;
    const done = new Promise<void>(r => (resolve = r));
    const leaving = { done, resolve };
    this._leaving.set(agent.id, leaving);
    // Stop working and let go of the selection, then fly home.
    this._core.agenticActionManager.cancel(agent.id, 'agent-removed');
    this._core.agenticActionManager.setSelection(agent.id, []);
    this.scheduleChange();
    this._core.agenticCursorManager
      .move(agent.id, home, { speed: agent.speed })
      .catch(() => undefined)
      // Only this exit: it may have been called off (the agent was added again) and started anew.
      .then(() => {
        if (this._leaving.get(agent.id) === leaving) this.finishLeaving(agent.id);
      });
    return true;
  }

  /** Removes an agent that was flying home, if it still is. */
  private finishLeaving(id: string): void {
    const leaving = this._leaving.get(id);
    if (!leaving) return;
    this._leaving.delete(id);
    const agent = this._agents.get(id);
    if (agent) this.detach(agent);
    leaving.resolve();
  }

  /** Keeps an agent that was flying home. */
  private stopLeaving(id: string): void {
    const leaving = this._leaving.get(id);
    if (!leaving) return;
    this._leaving.delete(id);
    this._core.agenticCursorManager.stopAnimation(id);
    this.scheduleChange();
    leaving.resolve();
  }

  private detach(agent: UpmadeAgent): void {
    this._agents.delete(agent.id);
    this._agentSubscriptions.get(agent.id)?.();
    this._agentSubscriptions.delete(agent.id);
    agent._detach();
    this.scheduleChange();
  }


  get(id: string): UpmadeAgent | null {
    return this._agents.get(id) ?? null;
  }

  getAll(): UpmadeAgent[] {
    return Array.from(this._agents.values());
  }

  /** The added agents as shown in the avatar stack. */
  getPresences(): UpmadeAgentPresence[] {
    return this.getAll().map(agent => agent.toPresence());
  }

  /**
   * Subscribes to changes of the agent list and of what the avatar stack shows (name, color, avatar,
   * status, visibility, activity). Coalesced to one call per microtask; never called for plain motion.
   */
  onChange(listener: () => void): () => void {
    this._changeListeners.add(listener);
    return () => this._changeListeners.delete(listener);
  }

  private scheduleChange(): void {
    if (this._changeScheduled) {
      return;
    }
    this._changeScheduled = true;
    queueMicrotask(() => {
      this._changeScheduled = false;
      this._changeListeners.forEach(listener => UpmadeEventHelper.callListener(listener, 'Agents change listener'));
    });
  }
}
