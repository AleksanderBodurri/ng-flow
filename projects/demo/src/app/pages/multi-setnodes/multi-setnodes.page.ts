import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  addEdge,
  Background,
  type Connection,
  Controls,
  type Edge,
  NgFlow,
  NgFlowProvider,
  type Node,
  type OnConnect,
  Panel,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'ng-flow';

// 100-node grid (10 columns × 10 rows), mirroring React's `for (let i = 0; i < 100; i++)`.
const initNodes: Node[] = [];
for (let i = 0; i < 100; i++) {
  initNodes.push({
    id: i.toString(),
    data: { label: `node ${i + 1}` },
    position: { x: (i % 10) * 60, y: Math.floor(i / 10) * 60 },
  });
}

// One edge between every consecutive pair of nodes (React's `reduce`).
const initEdges: Edge[] = initNodes.reduce<Edge[]>((res, _node, index) => {
  if (index > 0) {
    res.push({ id: `${index - 1}-${index}`, source: (index - 1).toString(), target: index.toString() });
  }
  return res;
}, []);

/**
 * Inner component rendered UNDER `<ng-flow-provider>` so `useReactFlow()` resolves the store.
 * Mirrors React's `CustomNodeFlow`. The three Panel buttons each loop over every node/edge and
 * issue one imperative call per element — this stress-tests the library's update batching:
 *  - `setNodes` (100× full setNodes with a mapping callback),
 *  - `updateNodeData` (100× targeted data patch),
 *  - `updateEdge` (99× targeted edge patch).
 */
@Component({
  selector: 'app-multi-setnodes-inner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Controls, Background, Panel],
  host: { style: 'display:block;height:100%' },
  styles: [
    `
      /* React's style.css: .multiset .react-flow__node { width: 50px } */
      :host ::ng-deep .react-flow__node {
        width: 50px;
      }
    `,
  ],
  template: `
    <ng-flow
      class="multiset"
      [nodes]="nodesState.nodes()"
      [edges]="edgesState.edges()"
      [onNodesChange]="nodesState.onNodesChange"
      [onEdgesChange]="edgesState.onEdgesChange"
      [onConnect]="onConnect"
      [fitView]="true"
    >
      <ng-flow-controls />
      <ng-flow-background />
      <ng-flow-panel>
        <button type="button" (click)="multiSetNodes()">set nodes</button>
        <button type="button" (click)="multiUpdateNodes()">update nodes</button>
        <button type="button" (click)="multiUpdateEdges()">update edges</button>
      </ng-flow-panel>
    </ng-flow>
  `,
})
export class MultiSetNodesInner {
  private readonly flow = useReactFlow();
  protected readonly nodesState = useNodesState(initNodes);
  protected readonly edgesState = useEdgesState(initEdges);

  protected readonly onConnect: OnConnect = (connection: Connection) =>
    this.edgesState.setEdges((eds) => addEdge(connection, eds));

  // Mirrors React: for each node, call setNodes with a map that rewrites only that node's data.
  protected multiSetNodes(): void {
    this.nodesState.nodes().forEach((node) =>
      this.flow.setNodes((nds) =>
        nds.map((n) => {
          if (n.id === node.id) {
            return { ...n, data: { label: 'node set' } };
          }
          return n;
        })
      )
    );
  }

  protected multiUpdateNodes(): void {
    this.nodesState.nodes().forEach((node) => this.flow.updateNodeData(node.id, { label: 'node update' }));
  }

  protected multiUpdateEdges(): void {
    this.edgesState.edges().forEach((edge) => this.flow.updateEdge(edge.id, { label: 'edge update' }));
  }
}

@Component({
  selector: 'app-multi-setnodes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, MultiSetNodesInner],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow-provider style="display:block;height:100%">
      <app-multi-setnodes-inner />
    </ng-flow-provider>
  `,
})
export class MultiSetNodesPage {}
