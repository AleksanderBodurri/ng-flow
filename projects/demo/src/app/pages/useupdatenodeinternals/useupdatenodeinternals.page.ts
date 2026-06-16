import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  addEdge,
  type Connection,
  type Edge,
  NgFlow,
  NgFlowProvider,
  type Node,
  type OnConnect,
  Position,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'ng-flow';

import { UpdateNodeInternalsNode } from './custom-node';

const initialNodes: Node[] = [{ id: '1', type: 'custom', data: { label: 'Node 1' }, position: { x: 250, y: 5 } }];

let id = 5;
const getId = (): string => `${id++}`;

/**
 * Inner component rendered UNDER `<ng-flow-provider>` so `useReactFlow()` has the store when it
 * runs in a field initializer. Mirrors React's `UpdateNodeInternalsFlow`: clicking the pane uses
 * `screenToFlowPosition` to drop a new node at the cursor; the single custom node demonstrates
 * `useUpdateNodeInternals` (see custom-node.ts).
 */
@Component({
  selector: 'app-update-node-internals-inner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="ns.nodes()"
      [edges]="es.edges()"
      [onNodesChange]="ns.onNodesChange"
      [onEdgesChange]="es.onEdgesChange"
      [nodeTypes]="nodeTypes"
      [onConnect]="onConnect"
      [onPaneClick]="onPaneClick"
    />
  `,
})
export class UpdateNodeInternalsInner {
  protected readonly nodeTypes = { custom: UpdateNodeInternalsNode };

  protected readonly ns = useNodesState(initialNodes);
  protected readonly es = useEdgesState<Edge>([]);

  private readonly flow = useReactFlow();

  protected readonly onConnect: OnConnect = (params: Connection) =>
    this.es.setEdges((els) => addEdge(params, els));

  protected readonly onPaneClick = (evt: MouseEvent): void => {
    this.ns.setNodes((nds) =>
      nds.concat({
        id: getId(),
        position: this.flow.screenToFlowPosition({ x: evt.clientX, y: evt.clientY }),
        data: { label: 'new node' },
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
      })
    );
  };
}

/**
 * React `UseUpdateNodeInternals` example (the exported `WrappedFlow`): wraps the flow in a
 * provider so the page-level `useReactFlow()` call works.
 */
@Component({
  selector: 'app-useupdatenodeinternals',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, UpdateNodeInternalsInner],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow-provider>
      <app-update-node-internals-inner />
    </ng-flow-provider>
  `,
})
export class UseUpdateNodeInternalsPage {}
