import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  addEdge,
  type Connection,
  type Edge,
  NgFlow,
  NgFlowProvider,
  type Node,
  useEdgesState,
  useNodesState,
} from 'ng-flow';

import { SaveRestoreControls } from './controls';

const initialNodes: Node[] = [
  { id: '1', data: { label: 'Node 1' }, position: { x: 100, y: 100 } },
  { id: '2', data: { label: 'Node 2' }, position: { x: 100, y: 200 } },
];

const initialEdges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }];

/**
 * Inner flow rendered under `<ng-flow-provider>`. Holds the controlled node/edge state and
 * projects the save/restore controls (which need `useReactFlow()`) inside `<ng-flow>`,
 * forwarding the `setNodes`/`setEdges` setters — mirroring React's `<Controls setNodes setEdges />`.
 */
@Component({
  selector: 'app-save-restore-flow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, SaveRestoreControls],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="nodesState.nodes()"
      [edges]="edgesState.edges()"
      [onNodesChange]="nodesState.onNodesChange"
      [onEdgesChange]="edgesState.onEdgesChange"
      [onConnect]="onConnect"
    >
      <app-save-restore-controls [setNodes]="nodesState.setNodes" [setEdges]="edgesState.setEdges" />
    </ng-flow>
  `,
})
export class SaveRestoreFlow {
  protected readonly nodesState = useNodesState(initialNodes);
  protected readonly edgesState = useEdgesState(initialEdges);

  protected readonly onConnect = (params: Connection | Edge): void =>
    this.edgesState.setEdges((eds) => addEdge(params, eds));
}

/**
 * SaveRestore example — mirrors React Flow's `SaveRestore/index.tsx`. Persists the flow to
 * `localforage` and restores nodes/edges/viewport. Wrapped in `<ng-flow-provider>` to match
 * React's `ReactFlowProvider`.
 */
@Component({
  selector: 'app-save-restore',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, SaveRestoreFlow],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow-provider style="display:block;height:100%">
      <app-save-restore-flow />
    </ng-flow-provider>
  `,
})
export class SaveRestorePage {}
