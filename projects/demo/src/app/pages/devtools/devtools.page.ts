import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  addEdge,
  type Connection,
  type Edge,
  NgFlow,
  type Node,
  type OnConnect,
  useEdgesState,
  useNodesState,
} from 'ng-flow';

import { Devtools } from './devtools';

const initNodes: Node[] = [
  { id: '1a', type: 'input', data: { label: 'Node 1' }, position: { x: 250, y: 5 } },
  { id: '2a', data: { label: 'Node 2' }, position: { x: 100, y: 100 } },
  { id: '3a', data: { label: 'Node 3' }, position: { x: 400, y: 100 } },
  { id: '4a', data: { label: 'Node 4' }, position: { x: 400, y: 200 } },
];

const initEdges: Edge[] = [
  { id: 'e1-2', source: '1a', target: '2a' },
  { id: 'e1-3', source: '1a', target: '3a' },
];

/**
 * DevTools example — mirrors React Flow's `DevTools/index.tsx`.
 *
 * A basic flow with the `<app-devtools>` overlay projected inside `<ng-flow>`. The overlay's
 * Node Inspector (ViewportPortal + `useNodes()` + `node.measured`) and Change Logger
 * (intercepting `onNodesChange` via `useStore`/`useStoreApi`) both rely on the flow store, so
 * they live under `<ng-flow>` and need no separate `<ng-flow-provider>`.
 */
@Component({
  selector: 'app-devtools-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Devtools],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="nodesState.nodes()"
      [edges]="edgesState.edges()"
      [onNodesChange]="nodesState.onNodesChange"
      [onEdgesChange]="edgesState.onEdgesChange"
      [onConnect]="onConnect"
      [fitView]="true"
    >
      <app-devtools />
    </ng-flow>
  `,
})
export class DevtoolsPage {
  protected readonly nodesState = useNodesState(initNodes);
  protected readonly edgesState = useEdgesState(initEdges);

  protected readonly onConnect: OnConnect = (params: Connection) =>
    this.edgesState.setEdges((eds) => addEdge(params, eds));
}
