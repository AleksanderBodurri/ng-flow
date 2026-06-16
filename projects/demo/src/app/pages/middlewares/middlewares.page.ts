import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  addEdge,
  Background,
  BackgroundVariant,
  type Connection,
  Controls,
  type Edge,
  MiniMap,
  NgFlow,
  NgFlowProvider,
  type Node,
  type OnConnect,
  Panel,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'ng-flow';

import { MiddlewaresRestrictExtent } from './restrict-extent';

// React imports these from `../CancelConnection/data`; inlined here for the same dataset.
const initialNodes: Node[] = [
  { id: '1', type: 'input', data: { label: 'Node 1' }, position: { x: 250, y: 5 }, className: 'light' },
  { id: '2', data: { label: 'Node 2' }, position: { x: 100, y: 100 }, className: 'light' },
  { id: '3', data: { label: 'Node 3' }, position: { x: 400, y: 100 }, className: 'light' },
  { id: '4', data: { label: 'Node 4' }, position: { x: 400, y: 200 }, className: 'light' },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3' },
];

const a: Node = { id: 'a', data: { label: 'A' }, position: { x: 250, y: 5 } };
const b: Node = { id: 'b', data: { label: 'B' }, position: { x: 100, y: 100 } };
const c: Node = { id: 'c', data: { label: 'C' }, position: { x: 400, y: 100 } };

/**
 * Inner flow (React `SetNotesBatchingFlow`). Lives under `<ng-flow-provider>` so `useReactFlow`
 * works. Demonstrates that multiple `setNodes`/`updateNode` calls within one handler are
 * batched, together with two `RestrictExtent` middleware toggles (X and Y) that clamp node
 * positions to an extent as changes flow through.
 *
 * - "queue multiple setNodes calls": replaces with `[a]`, then appends `b`, then `c`, then
 *   shifts `a` far to the right — all in one tick.
 * - "queue multiple updateNode calls": runs the above, then nudges every node and relabels
 *   each with a timestamp via `updateNode`.
 */
@Component({
  selector: 'app-middlewares-flow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background, MiniMap, Controls, Panel, MiddlewaresRestrictExtent],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="nodesState.nodes()"
      [edges]="edgesState.edges()"
      [onNodesChange]="nodesState.onNodesChange"
      [onEdgesChange]="edgesState.onEdgesChange"
      [onConnect]="onConnect"
      className="react-flow-basic-example"
      [minZoom]="0.2"
      [maxZoom]="4"
      [fitView]="true"
    >
      <ng-flow-panel position="top-left">
        <app-middlewares-restrict-extent [minX]="0" [maxX]="500" label="Restrict X" />
        <app-middlewares-restrict-extent [minY]="-100" [maxY]="500" label="Restrict Y" />
      </ng-flow-panel>
      <ng-flow-background [variant]="BackgroundVariant.Dots" />
      <ng-flow-minimap />
      <ng-flow-controls />
      <ng-flow-panel position="top-right">
        <button type="button" (click)="triggerMultipleSetNodes()">queue multiple setNodes calls</button>
        <button type="button" (click)="triggerMultipleUpdateNodes()">queue multiple updateNode calls</button>
      </ng-flow-panel>
    </ng-flow>
  `,
})
export class MiddlewaresFlow {
  protected readonly BackgroundVariant = BackgroundVariant;

  private readonly flow = useReactFlow();
  protected readonly nodesState = useNodesState(initialNodes);
  protected readonly edgesState = useEdgesState(initialEdges);

  protected readonly onConnect: OnConnect = (params: Connection) =>
    this.edgesState.setEdges((eds) => addEdge(params, eds));

  protected triggerMultipleSetNodes(): void {
    this.flow.setNodes([a]);
    this.flow.setNodes((nodes) => [...nodes, b]);
    this.flow.setNodes((nodes) => [...nodes, c]);
    this.flow.setNodes((nodes) =>
      nodes.map((node) =>
        node.id === 'a' ? { ...node, position: { x: node.position.x + 2000, y: node.position.y + 20 } } : node
      )
    );
  }

  protected triggerMultipleUpdateNodes(): void {
    this.triggerMultipleSetNodes();
    this.flow.updateNode('a', (n) => ({ position: { x: n.position.x + 20, y: n.position.y + 20 } }));
    this.flow.updateNode('b', (n) => ({ position: { x: n.position.x + 20, y: n.position.y + 20 } }));
    this.flow.updateNode('c', (n) => ({ position: { x: n.position.x + 20, y: n.position.y + 20 } }));
    this.flow.updateNode('a', (n) => ({ data: { ...n.data, label: `A ${Date.now()}` } }));
    this.flow.updateNode('b', (n) => ({ data: { ...n.data, label: `B ${Date.now()}` } }));
    this.flow.updateNode('c', (n) => ({ data: { ...n.data, label: `C ${Date.now()}` } }));
  }
}

@Component({
  selector: 'app-middlewares',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, MiddlewaresFlow],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow-provider>
      <app-middlewares-flow />
    </ng-flow-provider>
  `,
})
export class MiddlewaresPage {}
