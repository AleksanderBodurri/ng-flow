import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  Controls,
  type Edge,
  type EdgeChange,
  type HandleType,
  NgFlow,
  type Node,
  type NodeChange,
  reconnectEdge,
} from 'ng-flow';

// React rendered the labels as JSX (`<>Node <strong>A</strong></>`). Node `data.label` is a
// plain string here; the surrounding node already renders it, so we keep the text content.
const initialNodes: Node[] = [
  { id: '1', type: 'input', data: { label: 'Node A' }, position: { x: 250, y: 0 } },
  { id: '2', data: { label: 'Node B' }, position: { x: 75, y: 0 } },
  {
    id: '3',
    data: { label: 'Node C' },
    position: { x: 400, y: 100 },
    style: { background: '#D6D5E6', color: '#333', border: '1px solid #222138', width: 180 },
  },
  { id: '4', data: { label: 'Node D' }, position: { x: -75, y: 100 } },
  { id: '5', data: { label: 'Node E' }, position: { x: 150, y: 100 } },
  { id: '6', data: { label: 'Node F' }, position: { x: 150, y: 250 } },
];

// `reconnectable` controls which end(s) of an edge may be dragged to a new node:
//  - 'source' → only the source endpoint, 'target' → only the target endpoint,
//  - omitted   → defaults to both (the `edgesReconnectable` flow default).
const initialEdges: Edge[] = [
  { id: 'e1-3', source: '1', target: '3', label: 'This edge can only be updated from source', reconnectable: 'source' },
  { id: 'e2-4', source: '2', target: '4', label: 'This edge can only be updated from target', reconnectable: 'target' },
  { id: 'e5-6', source: '5', target: '6', label: 'This edge can be updated from both sides' },
];

// Module-level logging handlers, exactly mirroring the React example.
const onReconnectStart = (_: MouseEvent, edge: Edge, handleType: HandleType): void =>
  console.log(`start update ${handleType} handle`, edge);
const onReconnectEnd = (_: MouseEvent | TouchEvent, edge: Edge, handleType: HandleType): void =>
  console.log(`end update ${handleType} handle`, edge);

/**
 * Mirrors React's `ReconnectEdge`. Edges can be reconnected by dragging an endpoint to a new
 * node (subject to each edge's `reconnectable` flag). `onReconnect` rewires the edge via the
 * `reconnectEdge` util; `onReconnectStart`/`onReconnectEnd` log the handle type. `snapToGrid`
 * is enabled. Nodes/edges are kept in plain signals with manual change application.
 */
@Component({
  selector: 'app-reconnect-edge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Controls],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="nodes()"
      [edges]="edges()"
      [onNodesChange]="onNodesChange"
      [onEdgesChange]="onEdgesChange"
      [snapToGrid]="true"
      [onReconnect]="onReconnect"
      [onConnect]="onConnect"
      [onReconnectStart]="onReconnectStart"
      [onReconnectEnd]="onReconnectEnd"
      [fitView]="true"
    >
      <ng-flow-controls />
    </ng-flow>
  `,
})
export class ReconnectEdgePage {
  protected readonly nodes = signal<Node[]>(initialNodes);
  protected readonly edges = signal<Edge[]>(initialEdges);

  protected readonly onReconnectStart = onReconnectStart;
  protected readonly onReconnectEnd = onReconnectEnd;

  protected readonly onReconnect = (oldEdge: Edge, newConnection: Connection): void =>
    this.edges.update((els) => reconnectEdge(oldEdge, newConnection, els));

  protected readonly onConnect = (connection: Connection): void =>
    this.edges.update((els) => addEdge(connection, els));

  protected readonly onNodesChange = (changes: NodeChange[]): void => {
    this.nodes.update((ns) => applyNodeChanges(changes, ns));
  };

  protected readonly onEdgesChange = (changes: EdgeChange[]): void => {
    this.edges.update((es) => applyEdgeChanges(changes, es));
  };
}
