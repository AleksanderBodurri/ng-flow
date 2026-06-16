import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  addEdge,
  Background,
  type Connection,
  Controls,
  type Edge,
  NgFlow,
  type Node,
  type NodeTypes,
  type OnConnect,
  useEdgesState,
  useNodesState,
} from 'ng-flow';

import { ResultNode } from './result-node';
import { TextNode } from './text-node';
import { UppercaseNode } from './uppercase-node';

const nodeTypes: NodeTypes = {
  text: TextNode,
  result: ResultNode,
  uppercase: UppercaseNode,
};

const initNodes: Node[] = [
  { id: '1', type: 'text', data: { text: 'hello' }, position: { x: -100, y: -50 } },
  { id: '1a', type: 'uppercase', data: { text: '' }, position: { x: 100, y: 0 } },
  { id: '1b', type: 'uppercase', data: { text: '' }, position: { x: 100, y: -100 } },
  { id: '2', type: 'text', data: { text: 'world' }, position: { x: 0, y: 100 } },
  { id: '3a', type: 'result', data: {}, position: { x: 300, y: -75 } },
  { id: '3b', type: 'result', data: {}, position: { x: 300, y: 50 } },
];

const initEdges: Edge[] = [
  { id: 'e1-1a', source: '1', target: '1a' },
  { id: 'e1a-3a', source: '1b', target: '3a' },
  { id: 'e1-1b', source: '1', target: '1b' },
  { id: 'e1a-3b', source: '1a', target: '3b' },
  { id: 'e2-3b', source: '2', target: '3b' },
];

/**
 * Mirrors React's UseNodesData example: a small data-flow graph of TextNode / UppercaseNode /
 * ResultNode. Each custom node calls its hooks (`useNodeConnections`, node-data lookup,
 * `updateNodeData`) from inside the node — which renders under `<ng-flow>`, so the store is
 * available. Kept as a single component (no provider needed at this level).
 */
@Component({
  selector: 'app-usenodesdata',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background, Controls],
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
    >
      <ng-flow-controls />
      <ng-flow-background />
    </ng-flow>
  `,
})
export class UseNodesDataPage {
  protected readonly nodeTypes = nodeTypes;

  protected readonly nodesState = useNodesState(initNodes);
  protected readonly edgesState = useEdgesState(initEdges);

  protected readonly onConnect: OnConnect = (connection: Connection) =>
    this.edgesState.setEdges((eds) => addEdge(connection, eds));
}
