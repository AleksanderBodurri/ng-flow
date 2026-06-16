import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  addEdge,
  type Connection,
  type Edge,
  NgFlow,
  type Node,
  type OnConnect,
  Panel,
  useEdgesState,
  useNodesState,
} from 'ng-flow';

import { SelectionLogger } from './selection-logger';

const initialNodes: Node[] = [
  { id: '1', type: 'default', data: { label: 'Node 1' }, position: { x: 250, y: 5 } },
  { id: '2', type: 'default', data: { label: 'Node 2' }, position: { x: 250, y: 100 } },
];

const initialEdges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }];

/**
 * React `UseOnSelectionChange` example. Two `SelectionLogger` subscribers are rendered inside the
 * flow; the second one is conditionally mounted (toggled by a button). A second button toggles
 * `elementsSelectable`. Mounting/unmounting the second logger registers/unregisters its
 * `useOnSelectionChange` handler automatically.
 */
@Component({
  selector: 'app-use-on-selection-change',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Panel, SelectionLogger],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="ns.nodes()"
      [edges]="es.edges()"
      [onNodesChange]="ns.onNodesChange"
      [onEdgesChange]="es.onEdgesChange"
      [onConnect]="onConnect"
      [elementsSelectable]="elementsSelectable()"
    >
      <ng-flow-panel position="top-left">
        <button type="button" (click)="toggleSecondLogger()">
          {{ secondLoggerActive() ? 'Disable' : 'Enable' }} Logger 2
        </button>
        <button type="button" (click)="toggleSelectable()">toggle selectable</button>
      </ng-flow-panel>

      <app-selection-logger id="Logger 1" />
      @if (secondLoggerActive()) {
        <app-selection-logger id="Logger 2" />
      }
    </ng-flow>
  `,
})
export class UseOnSelectionChangePage {
  protected readonly ns = useNodesState(initialNodes);
  protected readonly es = useEdgesState(initialEdges);

  protected readonly elementsSelectable = signal(true);
  protected readonly secondLoggerActive = signal(true);

  protected readonly onConnect: OnConnect = (params: Connection) =>
    this.es.setEdges((els) => addEdge(params, els));

  protected toggleSecondLogger(): void {
    this.secondLoggerActive.update((v) => !v);
  }

  protected toggleSelectable(): void {
    this.elementsSelectable.update((v) => !v);
  }
}
