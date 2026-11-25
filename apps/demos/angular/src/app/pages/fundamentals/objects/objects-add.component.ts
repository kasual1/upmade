import {
  ChangeDetectionStrategy,
  Component,
  signal,
  ViewChild,
} from '@angular/core';
import {
  UpmadeEditor,
  EditorIsReadyEvent,
  UpmadeBaseObject,
  UpmadeShape,
  UpmadePath,
  UpmadeWorkspace,
  ShapeType,
} from '@upmade/angular-editor';
import { angularThemeLight } from '../../../const/angular-theme-light';
import { angularThemeDark } from '../../../const/angular-theme-dark';
import { createSeedObjects } from '../../../const/seed-objects';
import { ToolbarComponent } from '../../../components/toolbar.component';

@Component({
  selector: 'app-objects-add',
  imports: [UpmadeEditor, ToolbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-toolbar>
      <button (click)="addRectangle()">Add Rectangle</button>
      <button (click)="addEllipse()">Add Ellipse</button>
      <button (click)="addPath()">Add Path</button>
    </app-toolbar>
    <upmade-editor
      editorId="objects-add"
      [theme]="'light'"
      [themes]="themes"
      [workspaces]="workspaces()"
      [isPanningEnabled]="false"
      [isZoomingEnabled]="false"
      [isMoreMenuVisible]="false"
      [isWorkspaceManagerVisible]="false"
      (isReady)="onReady($event)"
    ></upmade-editor>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        font-family: Roboto, sans-serif;
      }
      upmade-editor {
        flex: 1;
      }
    `,
  ],
})
export class ObjectsAddComponent {
  @ViewChild(UpmadeEditor) editor!: UpmadeEditor;

  themes = [angularThemeLight, angularThemeDark];

  workspaces = signal([new UpmadeWorkspace({ objects: createSeedObjects() })]);

  objects = signal<UpmadeBaseObject[]>([]);

  async onReady(_event: CustomEvent<EditorIsReadyEvent>) {
    this.objects.set(await this.editor.getAllObjects());
  }

  async addRectangle() {
    const shape = new UpmadeShape({
      translateX: this.randomOffset(),
      translateY: this.randomOffset(),
      width: 120,
      height: 80,
      shapeType: ShapeType.Rectangle,
      fillColor: { light: '#d7eeff', dark: '#2b5674' },
      strokeColor: { light: '#6fc3ff', dark: '#6fc3ff' },
      strokeWidth: 3,
    });
    await this.editor.addObject(shape);
    this.objects.set(await this.editor.getAllObjects());
  }

  async addEllipse() {
    const shape = new UpmadeShape({
      translateX: this.randomOffset(),
      translateY: this.randomOffset(),
      width: 100,
      height: 100,
      shapeType: ShapeType.Ellipse,
      fillColor: { light: '#ffd5ea', dark: '#7a2e55' },
      strokeColor: { light: '#ff6ab5', dark: '#ff6ab5' },
      strokeWidth: 3,
    });
    await this.editor.addObject(shape);
    this.objects.set(await this.editor.getAllObjects());
  }

  async addPath() {
    const path = new UpmadePath({
      points: [
        [0, 0, 0.5],
        [20, -15, 0.5],
        [40, -30, 0.5],
        [60, -20, 0.5],
        [80, -10, 0.5],
        [100, -25, 0.5],
        [120, -40, 0.5],
      ],
      translateX: this.randomOffset(),
      translateY: this.randomOffset(),
      strokeWidth: 6,
      fill: { light: '#ff9f5a', dark: '#ffb47e' },
    });
    await this.editor.addObject(path);
    this.objects.set(await this.editor.getAllObjects());
  }

  private randomOffset(): number {
    return Math.floor(Math.random() * 200) - 100;
  }
}