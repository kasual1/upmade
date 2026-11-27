import { IUpmadeUser } from './user.interface';

export interface UpmadeRemoteCursorState {
  clientId: number;
  user: IUpmadeUser;
  cursor: { x: number; y: number } | null;
  /** What the collaborator is doing, shown in place of their name on the label; `null` when nothing. */
  status: string | null;
  activeObjectId: string | null;
  selectionBox: { x: number; y: number; width: number; height: number } | null;
  lastUpdated: number;
  lastCursorMove: number;
}
