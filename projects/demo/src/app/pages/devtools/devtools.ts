import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { type PanelPosition, Panel } from 'ng-flow';

import { DevtoolsChangeLogger } from './change-logger';
import { DevtoolsNodeInspector } from './node-inspector';

/**
 * DevTools overlay. The Angular port of React Flow's `ReactFlowDevTools`.
 *
 * Projects a `<ng-flow-panel>` with two toggle buttons (Node Inspector / Change Logger) and
 * conditionally mounts the two overlay tools. Must be placed inside `<ng-flow>` so its
 * children resolve the flow store. Styling mirrors the React example's `style.css`.
 */
@Component({
  selector: 'app-devtools',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Panel, DevtoolsChangeLogger, DevtoolsNodeInspector],
  host: { class: 'react-flow__devtools' },
  template: `
    <ng-flow-panel [position]="position()">
      <button
        type="button"
        title="Toggle Node Inspector"
        [class.active]="nodeInspectorActive()"
        (click)="nodeInspectorActive.set(!nodeInspectorActive())"
      >
        Node Inspector
      </button>
      <button
        type="button"
        title="Toggle Change Logger"
        [class.active]="changeLoggerActive()"
        (click)="changeLoggerActive.set(!changeLoggerActive())"
      >
        Change Logger
      </button>
    </ng-flow-panel>
    @if (changeLoggerActive()) {
      <app-devtools-change-logger />
    }
    @if (nodeInspectorActive()) {
      <app-devtools-node-inspector />
    }
  `,
  styles: [
    `
      :host {
        --border-radius: 4px;
        --highlight-color: rgba(238, 58, 115, 1);
        --font: monospace, sans-serif;

        border-radius: var(--border-radius);
        font-size: 11px;
        font-family: var(--font);
      }

      :host ::ng-deep button {
        background: white;
        border: none;
        padding: 5px 15px;
        color: #222;
        font-weight: bold;
        font-size: 12px;
        cursor: pointer;
        font-family: var(--font);
        background-color: #f4f4f4;
      }

      :host ::ng-deep button:hover {
        background: var(--highlight-color);
        color: white;
      }

      :host ::ng-deep button.active {
        background: var(--highlight-color);
        color: white;
      }

      :host ::ng-deep button:first-child {
        border-radius: var(--border-radius) 0 0 var(--border-radius);
        border-right: 1px solid #ddd;
      }

      :host ::ng-deep button:last-child {
        border-radius: 0 var(--border-radius) var(--border-radius) 0;
      }

      :host ::ng-deep .react-flow__devtools-changelogger {
        pointer-events: none;
        position: relative;
        top: 50px;
        left: 20px;
        font-family: var(--font);
      }

      :host ::ng-deep .react-flow__devtools-title {
        font-weight: bold;
        margin-bottom: 5px;
      }

      :host ::ng-deep .react-flow__devtools-nodeinspector {
        pointer-events: none;
        font-family: monospace, sans-serif;
        font-size: 10px;
      }

      :host ::ng-deep .react-flow__devtools-nodeinfo {
        top: 5px;
      }
    `,
  ],
})
export class Devtools {
  /** Where the toggle panel sits; mirrors React's `position` prop (default `top-left`). */
  readonly position = input<PanelPosition>('top-left');

  protected readonly nodeInspectorActive = signal(false);
  protected readonly changeLoggerActive = signal(false);
}
