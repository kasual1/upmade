import { Component, Host, Prop, State, h } from '@stencil/core';
import {
  UpmadeCore,
  UpmadePath,
  UpmadeLine,
  UpmadePoint,
  UpmadeRemoteCursorState,
  UpmadeSelectionGroup,
  IUpmadeUser,
  UpmadeViewportOverlayHelper,
} from '@upmade/core';
import { CursorArrow, CursorLabel, EdgeIndicator } from '../shared/cursor/cursor-visuals';
import { getSelectionTopLeft } from '../shared/cursor/selection-anchor';

const STALE_THRESHOLD_MS = 10_000;
const REMOVE_THRESHOLD_MS = 30_000;
const CLEANUP_INTERVAL_MS = 3_000;
/** Color of a collaborator whose user state has none. */
const DEFAULT_CURSOR_COLOR = '#6B7280';

@Component({
  tag: 'upmade-awareness-cursors',
  styleUrls: ['../shared/cursor/cursor-visuals.css', 'upmade-awareness-cursors.css'],
  shadow: true,
})
export class UpmadeAwarenessCursors {
  @Prop() core!: UpmadeCore;
  @Prop() showEdgeIndicators: boolean = true;
  @Prop() edgeIndicatorPadding: number = 8;

  @State() remoteCursors: Map<number, UpmadeRemoteCursorState> = new Map();
  @State() objectVersion: number = 0;

  /** IDs of the objects each collaborator has selected, by awareness client ID (from their selection groups). */
  private remoteSelections: Map<number, string[]> = new Map();

  private cleanupIntervalId: ReturnType<typeof setInterval> | undefined;
  private objectChangeRafId: ReturnType<typeof requestAnimationFrame> | null = null;
  private removeAwarenessChangeListener: (() => void) | undefined;
  private removeObjectsChangeListener: (() => void) | undefined;

  componentDidLoad() {
    this.removeAwarenessChangeListener = this.core.store.objects?.onAwarenessChange(states => {
      this.handleAwarenessChange(states);
    });

    this.removeObjectsChangeListener = this.core.store.objects?.onObjectsChange(() => {
      this.handleRemoteObjectChange();
    });

    this.cleanupIntervalId = setInterval(() => {
      this.cleanupStaleCursors();
    }, CLEANUP_INTERVAL_MS);

    if (this.cleanupIntervalId && typeof this.cleanupIntervalId.unref === 'function') {
      this.cleanupIntervalId.unref();
    }
  }

  disconnectedCallback() {
    if (this.removeAwarenessChangeListener) {
      this.removeAwarenessChangeListener();
      this.removeAwarenessChangeListener = undefined;
    }
    if (this.removeObjectsChangeListener) {
      this.removeObjectsChangeListener();
      this.removeObjectsChangeListener = undefined;
    }
    if (this.cleanupIntervalId && typeof globalThis.clearInterval === 'function') {
      globalThis.clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = undefined;
    }
    if (this.objectChangeRafId !== null && typeof globalThis.cancelAnimationFrame === 'function') {
      globalThis.cancelAnimationFrame(this.objectChangeRafId);
      this.objectChangeRafId = null;
    }
  }

  private handleAwarenessChange(states: Map<number, Record<string, unknown>>) {
    const localClientId = this.core.store.objects?.localClientId;
    const now = Date.now();
    const updated = new Map(this.remoteCursors);

    // Track which clientIds are still present
    const activeClientIds = new Set<number>();

    states.forEach((state, clientId) => {
      if (clientId === localClientId) return;
      if (!state.user) return;

      activeClientIds.add(clientId);

      const user = state.user as IUpmadeUser;
      const cursor = state.cursor as { x: number; y: number } | null;
      const activeObjectId = (state.activeObjectId as string) || null;
      const selectionBox = (state.selectionBox as { x: number; y: number; width: number; height: number }) || null;

      const existing = updated.get(clientId);
      const cursorMoved =
        !existing ||
        !existing.cursor !== !cursor ||
        (cursor && existing.cursor && (cursor.x !== existing.cursor.x || cursor.y !== existing.cursor.y));

      updated.set(clientId, {
        clientId,
        user,
        cursor,
        activeObjectId,
        selectionBox,
        lastUpdated: now,
        lastCursorMove: cursorMoved ? now : (existing?.lastCursorMove ?? now),
      });
    });

    // Remove cursors for disconnected clients
    for (const clientId of updated.keys()) {
      if (!activeClientIds.has(clientId)) {
        updated.delete(clientId);
      }
    }

    this.refreshRemoteSelections(updated);
    this.remoteCursors = updated;
  }

  /**
   * Finds the selection group of each collaborator. A group stamped with a client ID belongs to that tab;
   * an older group without one belongs to the user with its user ID.
   */
  private refreshRemoteSelections(cursors: Map<number, UpmadeRemoteCursorState>): void {
    const groups = (this.core.store.objects?.filter?.(object => object instanceof UpmadeSelectionGroup) ?? []) as UpmadeSelectionGroup[];
    const next = new Map<number, string[]>();
    if (groups.length > 0) {
      for (const cursor of cursors.values()) {
        const group = groups.find(
          candidate =>
            candidate.objectIds.length > 0 &&
            (candidate.clientId != null ? candidate.clientId === cursor.clientId : candidate.userId != null && candidate.userId === cursor.user.id),
        );
        if (group) next.set(cursor.clientId, group.objectIds);
      }
    }
    this.remoteSelections = next;
  }

  /** World point where a collaborator's label sits while they have objects selected: above the selection's top-left corner. */
  private getSelectionAnchor(cursor: UpmadeRemoteCursorState): UpmadePoint | null {
    const objectIds = this.remoteSelections.get(cursor.clientId);
    if (!objectIds || objectIds.length === 0) return null;
    const objects = this.core.store.objects;
    if (!objects) return null;
    return getSelectionTopLeft(objectIds.map(id => objects.findById(id)));
  }

  private cleanupStaleCursors() {
    const now = Date.now();
    let changed = false;
    const updated = new Map(this.remoteCursors);

    for (const [clientId, cursor] of updated) {
      if (now - cursor.lastUpdated > REMOVE_THRESHOLD_MS) {
        updated.delete(clientId);
        changed = true;
      } else if (!changed && now - cursor.lastCursorMove > STALE_THRESHOLD_MS) {
        changed = true;
      }
    }

    if (changed) {
      this.remoteCursors = updated;
    }
  }

  private isStale(cursor: UpmadeRemoteCursorState): boolean {
    return Date.now() - cursor.lastCursorMove > STALE_THRESHOLD_MS;
  }

  /**
   * Remote changes move drawing tips and selected objects, and select or deselect objects
   * (selection groups live in the document), so labels and cursors are re-derived.
   */
  private handleRemoteObjectChange(): void {
    if (this.remoteCursors.size === 0) return;

    // Debounce via rAF to batch multiple rapid Yjs updates into a single re-render
    if (this.objectChangeRafId !== null) return;
    this.objectChangeRafId = requestAnimationFrame(() => {
      this.objectChangeRafId = null;
      this.refreshRemoteSelections(this.remoteCursors);
      this.objectVersion++;
    });
  }

  private getActiveObjectTip(objectId: string): { x: number; y: number } | null {
    const obj = this.core.store.objects?.findById(objectId);
    if (!obj) return null;

    if (obj instanceof UpmadePath && !obj.isCompleted) {
      const lastPoint = obj.points[obj.points.length - 1];
      if (!lastPoint) return null;
      return {
        x: (lastPoint[0] - obj.x) / obj.scale + obj.translateX,
        y: (lastPoint[1] - obj.y) / obj.scale + obj.translateY,
      };
    }

    if (obj instanceof UpmadeLine && !obj.isCompleted) {
      return {
        x: (obj.endX - obj.x) / obj.scale + obj.translateX,
        y: (obj.endY - obj.y) / obj.scale + obj.translateY,
      };
    }

    // Shapes normalize their bounding box (x/y always top-left, width/height
    // always positive), so we can't determine which corner the user is actively
    // dragging. Fall back to the throttled awareness cursor position instead.

    return null;
  }

  private worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return UpmadeViewportOverlayHelper.worldToScreen(this.core.store.state, worldX, worldY);
  }

  private isInViewport(screenX: number, screenY: number): boolean {
    return UpmadeViewportOverlayHelper.isInViewport(this.core.store.state, screenX, screenY);
  }

  private getUserDisplayName(user: IUpmadeUser): string {
    if (user.displayName) return user.displayName;
    if (user.firstName || user.lastName) {
      return [user.firstName, user.lastName].filter(Boolean).join(' ');
    }
    return 'Unknown';
  }

  render() {
    // Read reactive viewport state so Stencil re-renders on pan/zoom
    const _scale = this.core.store.state.scale;
    const _tx = this.core.store.state.translateX;
    const _ty = this.core.store.state.translateY;

    // Suppress unused variable warnings — these reads trigger Stencil reactivity
    void _scale;
    void _tx;
    void _ty;
    void this.objectVersion;

    const cursors = Array.from(this.remoteCursors.values());

    return (
      <Host>
        {cursors.map(remoteCursor => {
          if (!remoteCursor.cursor) return null;

          const color = remoteCursor.user.color || DEFAULT_CURSOR_COLOR;
          // While the collaborator has objects selected, the label sits above the selection instead
          const showLabel = !this.getSelectionAnchor(remoteCursor);

          // When a remote user is actively drawing, derive cursor position from
          // the object's latest coordinates (synced via Yjs) instead of the
          // throttled awareness cursor position
          let screen: { x: number; y: number };
          let trackingObject = false;
          if (remoteCursor.activeObjectId) {
            const tip = this.getActiveObjectTip(remoteCursor.activeObjectId);
            if (tip) {
              trackingObject = true;
              screen = this.worldToScreen(tip.x, tip.y);
            } else {
              screen = this.worldToScreen(remoteCursor.cursor.x, remoteCursor.cursor.y);
            }
          } else {
            screen = this.worldToScreen(remoteCursor.cursor.x, remoteCursor.cursor.y);
          }

          const inViewport = this.isInViewport(screen.x, screen.y);
          const stale = this.isStale(remoteCursor);

          if (inViewport) {
            return this.renderCursor(remoteCursor, screen.x, screen.y, color, stale, trackingObject, showLabel);
          }

          if (this.showEdgeIndicators) {
            return this.renderEdgeIndicator(remoteCursor, screen.x, screen.y, color, stale, trackingObject);
          }

          return null;
        })}
        {cursors.map(remoteCursor => {
          // A collaborator's label sits above the top-left corner of their selection, while the cursor stays with the pointer
          const selectionAnchor = this.getSelectionAnchor(remoteCursor);
          if (!selectionAnchor) return null;

          const anchor = this.worldToScreen(selectionAnchor.x, selectionAnchor.y);
          return (
            <div
              key={`selection-label-${remoteCursor.clientId}`}
              class="awareness-selection-label"
              style={{ transform: `translate(${anchor.x}px, ${anchor.y}px)` }}
            >
              <CursorLabel text={this.getUserDisplayName(remoteCursor.user)} icon={remoteCursor.user.cursorIcon} color={remoteCursor.user.color || DEFAULT_CURSOR_COLOR} />
            </div>
          );
        })}
        {cursors.map(remoteCursor => {
          if (!remoteCursor.selectionBox) return null;

          const color = remoteCursor.user.color || DEFAULT_CURSOR_COLOR;
          const box = remoteCursor.selectionBox;
          const topLeft = this.worldToScreen(box.x, box.y);
          const { scale } = this.core.store.state;
          const screenWidth = box.width * scale;
          const screenHeight = box.height * scale;

          return (
            <div
              key={`selection-box-${remoteCursor.clientId}`}
              class="remote-selection-box"
              style={{
                transform: `translate(${topLeft.x}px, ${topLeft.y}px)`,
                width: `${screenWidth}px`,
                height: `${screenHeight}px`,
                backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)`,
                borderColor: `color-mix(in srgb, ${color} 50%, transparent)`,
              }}
            ></div>
          );
        })}
      </Host>
    );
  }

  private renderCursor(
    cursor: UpmadeRemoteCursorState,
    screenX: number,
    screenY: number,
    color: string,
    stale: boolean,
    trackingObject: boolean,
    showLabel: boolean = true,
  ) {
    return (
      <div
        key={`cursor-${cursor.clientId}`}
        class={{ 'awareness-cursor': true, stale, 'tracking-object': trackingObject, 'is-selecting': !showLabel }}
        style={{ transform: `translate(${screenX}px, ${screenY}px)` }}
      >
        <CursorArrow color={color} />
        {showLabel && <CursorLabel text={this.getUserDisplayName(cursor.user)} icon={cursor.user.cursorIcon} color={color} />}
      </div>
    );
  }

  private renderEdgeIndicator(
    cursor: UpmadeRemoteCursorState,
    screenX: number,
    screenY: number,
    color: string,
    stale: boolean,
    trackingObject: boolean,
  ) {
    const clamped = UpmadeViewportOverlayHelper.clampToEdge(this.core.store.state, screenX, screenY, this.edgeIndicatorPadding);
    const displayName = this.getUserDisplayName(cursor.user);

    return (
      <EdgeIndicator
        indicatorKey={`edge-${cursor.clientId}`}
        x={clamped.x}
        y={clamped.y}
        angle={clamped.angle}
        edge={clamped.edge}
        color={color}
        label={UpmadeViewportOverlayHelper.getInitials(displayName)}
        icon={cursor.user.cursorIcon}
        classes={{ stale, 'tracking-object': trackingObject }}
      />
    );
  }
}
