import { ChangeDetectionStrategy, Component, effect } from '@angular/core';
import {
  addEdge,
  Background,
  type Connection,
  Controls,
  type Edge,
  MiniMap,
  NgFlow,
  type Node,
  type NodeTypes,
  type OnConnect,
  useEdgesState,
  useNodesState,
} from 'ng-flow';

import { MultiHandleNode } from './multi-handle-node';
import { SingleHandleNode } from './single-handle-node';

const nodeTypes: NodeTypes = {
  multi: MultiHandleNode,
  single: SingleHandleNode,
};

const initNodes: Node[] = [
  { id: '1', type: 'single', data: {}, position: { x: 0, y: 0 } },
  { id: '2', type: 'single', data: {}, position: { x: 200, y: -100 } },
  { id: '3', type: 'single', data: {}, position: { x: 200, y: 100 } },
  { id: '4', type: 'multi', data: {}, position: { x: 400, y: 0 } },
  { id: '5', type: 'multi', data: {}, position: { x: 600, y: -100 } },
  { id: '6', type: 'multi', data: {}, position: { x: 600, y: 100 } },
];

const initEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
  { id: 'e4a-5', source: '4', sourceHandle: 's1', target: '5' },
  { id: 'e4b-5', source: '4', sourceHandle: 's2', target: '6' },
];

const defaultEdgeOptions = { animated: true };

/**
 * Mirrors React's UseNodeConnections example. The flow itself uses no hooks; the per-handle
 * `useNodeConnections` calls live inside the custom node components (Single/MultiHandleNode),
 * which run under `<ng-flow>` so the store is available. Kept as a single component (no
 * provider needed at this level).
 */
@Component({
  selector: 'app-usenodeconnections',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background, Controls, MiniMap],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="nodesState.nodes()"
      [edges]="edgesState.edges()"
      [onNodesChange]="nodesState.onNodesChange"
      [onEdgesChange]="edgesState.onEdgesChange"
      [onConnect]="onConnect"
      [nodeTypes]="nodeTypes"
      [fitView]="true"
      [minZoom]="0.3"
      [maxZoom]="2"
      colorMode="dark"
      [defaultEdgeOptions]="defaultEdgeOptions"
    >
      <ng-flow-minimap />
      <ng-flow-controls />
      <ng-flow-background />
    </ng-flow>
  `,
})
export class UseNodeConnectionsPage {
  protected readonly nodeTypes = nodeTypes;
  protected readonly defaultEdgeOptions = defaultEdgeOptions;

  protected readonly nodesState = useNodesState(initNodes);
  protected readonly edgesState = useEdgesState(initEdges);

  protected readonly onConnect: OnConnect = (connection: Connection) =>
    this.edgesState.setEdges((eds) => addEdge(connection, eds));

  constructor() {
    // Mirrors React's top-level `console.log(edges)` on each render.
    effect(() => console.log(this.edgesState.edges()));
  }
}
