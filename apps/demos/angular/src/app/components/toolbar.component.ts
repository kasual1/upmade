import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'app-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `<ng-content></ng-content>`,
  styles: [
    `
      app-toolbar {
        display: flex;
        position: relative;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: #fafaf8;
        border-bottom: 2px solid #0a0a0a;
        flex-wrap: wrap;
      }

      app-toolbar:has(> app-info-panel-toggle) {
        padding-right: 52px;
      }

      app-toolbar > app-info-panel-toggle {
        position: absolute;
        top: 8px;
        right: 12px;
      }

      app-toolbar > button {
        padding: 6px 12px;
        border: 2px solid #0a0a0a;
        border-radius: 999px;
        background: #fff;
        cursor: pointer;
        font-size: 13px;
  font-weight: 600;
}

      app-toolbar > button:hover:not(:disabled) {
        background: #ffe7f3;
        color: #0a0a0a;
        border-color: #0a0a0a;
      }

      app-toolbar > button.active {
        background: #c10564;
        color: #fff;
        border-color: #0a0a0a;
      }

      app-toolbar > button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      app-toolbar > .label {
        font-size: 13px;
        font-weight: 500;
      }

      app-toolbar > .status {
        font-size: 12px;
        color: #555;
      }

      app-toolbar > .separator {
        width: 1px;
        height: 20px;
        background: #ddd;
      }

      app-toolbar > input {
        width: 70px;
        padding: 4px 8px;
        border: 2px solid #0a0a0a;
        border-radius: 10px;
        font-size: 13px;
      }
    `,
  ],
})
export class ToolbarComponent {}