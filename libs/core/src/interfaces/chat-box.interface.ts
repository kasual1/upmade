import type { IUpmadeMenuItem } from './menu-item.interface';
import { UpmadeIconName } from '../classes/registries/icon-registry.class';

/**
 * A chip shown above the chat box, naming what the next prompt refers to, such as the selected object
 * or an element picked inside it.
 *
 * Chips are controlled: the chat box renders the array it is given and never changes it. Each chip's
 * remove button emits `chatChipRemove` with the chip; pass a new array without it, or with a changed chip,
 * to update the box. All texts are shown verbatim, they are not translated.
 */
export interface UpmadeChatBoxChip {
  /** Unique, stable identifier, e.g. the id of the referenced object. Used as render key. */
  id: string;
  /** Main text, shown bold, e.g. the referenced object's name. Shortened with an ellipsis first when space runs out, keeping its first letters. */
  label: string;
  /** A narrower part of the label, shown after `›`, e.g. the element picked inside the object. */
  detail?: string;
  /** Muted text shown after the label and detail, e.g. what the user can do next. */
  hint?: string;
  /** Registered icon shown before the label, e.g. `'cursor'`. No icon when omitted. */
  icon?: UpmadeIconName;
  /** The object the chip refers to. A chat session tells the model about it. Not shown. */
  objectId?: string;
  /** CSS selector of the element inside the object the chip refers to. A chat session tells the model about it. Not shown. */
  selector?: string;
}

/** Item of the chat box's "+" menu that adds an image. Shown by default; what it does is up to the app (`chatBoxMenuItemSelect`). */
export const UPMADE_CHAT_BOX_MENU_IMAGE_ITEM: Readonly<IUpmadeMenuItem> = Object.freeze({
  id: 'image',
  label: 'chatBox.menu.image',
  icon: 'image',
});

/** Item of the chat box's "+" menu that adds an agent. Shown by default; what it does is up to the app (`chatBoxMenuItemSelect`). */
export const UPMADE_CHAT_BOX_MENU_AGENT_ITEM: Readonly<IUpmadeMenuItem> = Object.freeze({
  id: 'agent',
  label: 'chatBox.menu.agent',
  icon: 'bot',
});

/** The default items of the chat box's "+" menu. */
export const UPMADE_DEFAULT_CHAT_BOX_MENU_ITEMS: readonly Readonly<IUpmadeMenuItem>[] = Object.freeze([
  UPMADE_CHAT_BOX_MENU_IMAGE_ITEM,
  UPMADE_CHAT_BOX_MENU_AGENT_ITEM,
]);
