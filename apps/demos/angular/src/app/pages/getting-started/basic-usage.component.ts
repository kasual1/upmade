import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  ViewChild,
} from '@angular/core';
import {
  InMemorySyncProvider,
  UpmadeBaseObject,
  UpmadeEditor,
  UpmadeSyncConfig,
  UpmadeText,
  UpmadeWorkspace,
} from '@upmade/angular-editor';
import { angularThemeLight } from '../../const/angular-theme-light';
import { angularThemeDark } from '../../const/angular-theme-dark';
import { createSeedObjects } from '../../const/seed-objects';

@Component({
  selector: 'app-basic-usage',
  imports: [UpmadeEditor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="toolbar">
      <button
        [class.active]="activeTool() === 'brush'"
        (click)="setBrushTool()"
      >
        Brush
      </button>
      <button
        [class.active]="activeTool() === 'selection'"
        (click)="setSelectTool()"
      >
        Select
      </button>
      <button (click)="addText()">Add Text</button>
      <button (click)="undoAction()">Undo</button>
      <button (click)="zoomIn()">Zoom In</button>
      <button (click)="zoomOut()">Zoom Out</button>
      <span class="status">{{ statusLine() }}</span>
    </header>

    <upmade-editor
      editorId="basic-usage"
      #editor
      [syncConfig]="syncConfig"
      [workspaces]="workspaces()"
      [theme]="'light'"
      [themes]="themes"
      [loginConfig]="undefined"
      [isPanningEnabled]="false"
      [isZoomingEnabled]="false"
      [isMoreMenuVisible]="false"
      [isWorkspaceManagerVisible]="false"
      [isToolbarVisible]="false"
      (isReady)="onReady()"
      (objectsChange)="onObjectsChange($event)"
    ></upmade-editor>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        font-family: Roboto, sans-serif;
        background: #fafafa;
      }

      .toolbar {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        padding: 8px 12px;
        border-bottom: 2px solid #0a0a0a;
        background: #fafaf8;
      }

      button {
        padding: 6px 12px;
        border: 2px solid #0a0a0a;
        border-radius: 999px;
        background: #ffffff;
        color: #0a0a0a;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
  font-weight: 600;
}

      button:hover {
        background: #ffe1f0;
        color: #333333;
        border-color: #ff6ab5;
      }

      button.active {
        background: #ff6ab5;
        color: #ffffff;
        border-color: #ff6ab5;
      }

      .status {
        margin-left: auto;
        font-size: 12px;
        color: #555555;
        font-weight: 500;
        white-space: nowrap;
      }

      upmade-editor {
        flex: 1;
        min-height: 0;
        display: block;
      }
    `,
  ],
})
export class BasicUsageComponent {
  @ViewChild(UpmadeEditor) editor!: UpmadeEditor;

  syncConfig: UpmadeSyncConfig = {
    providers: [InMemorySyncProvider],
  };
  themes = [angularThemeLight, angularThemeDark];

  workspaces = signal([new UpmadeWorkspace({ objects: createSeedObjects() })]);

  isReady = signal<boolean>(false);
  activeTool = signal<'brush' | 'selection'>('selection');
  objectsCount = signal<number>(0);

  statusLine = computed(() => {
    if (!this.isReady()) {
      return 'Loading editor...';
    }

    return `Objects: ${this.objectsCount()} | Tool: ${this.activeTool()}`;
  });

  async onReady() {
    this.isReady.set(true);
  }

  onObjectsChange(
    event: CustomEvent<UpmadeBaseObject<HTMLElement | SVGElement>[]>,
  ) {
    this.objectsCount.set(event.detail.length);
  }

  async setBrushTool() {
    this.activeTool.set('brush');
    await this.editor.setActiveTool('brush');
  }

  async setSelectTool() {
    this.activeTool.set('selection');
    await this.editor.setActiveTool('selection');
  }

  async addText() {
    const text = new UpmadeText({
      text: 'Programmatic text!',
      translateX: 0,
      translateY: 0,
      fontSize: 24,
      fontFamily: 'Arial',
      fontColor: { light: '#ff0000', dark: '#ff4d6d' },
    });

    await this.editor.addObject(text);
    await this.editor.selectObjects([text]);
  }

  async undoAction() {
    await this.editor.undo();
  }

  async zoomIn() {
    await this.editor.zoomIn()
  }

  async zoomOut() {
    await this.editor.zoomOut()
  }
}
