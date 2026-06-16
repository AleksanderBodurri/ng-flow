import { ChangeDetectionStrategy, Component, effect } from '@angular/core';
import {
  addEdge,
  Background,
  type Connection,
  type Edge,
  MiniMap,
  NgFlow,
  NgFlowProvider,
  type Node,
  type OnConnect,
  Panel,
  useEdgesState,
  useNodesInitialized,
  useNodesState,
  useReactFlow,
} from 'ng-flow';

const initialNodes: Node[] = [
  { id: '1', type: 'input', data: { label: 'Node 1' }, position: { x: 250, y: 5 } },
  { id: '2', data: { label: 'Node 2' }, position: { x: 100, y: 100 } },
  { id: '3', data: { label: 'Node 3' }, position: { x: 400, y: 100 } },
  { id: '4', data: { label: 'Node 4' }, position: { x: 400, y: 200 }, hidden: true },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3' },
];

/**
 * Inner component rendered UNDER `<ng-flow-provider>` so the store is available when
 * `useReactFlow()` / `useNodesInitialized()` run in field initializers. Mirrors React's
 * `UseZoomPanHelperFlow`: a hidden node #4, an "add node" button that calls `addNodes`, and
 * `useNodesInitialized()` logged on change.
 */
@Component({
  selector: 'app-use-nodes-initialized-inner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background, MiniMap, Panel],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="nodesState.nodes()"
      [edges]="edgesState.edges()"
      [onNodesChange]="nodesState.onNodesChange"
      [onEdgesChange]="edgesState.onEdgesChange"
      [onConnect]="onConnect"
      [fitView]="true"
      [maxZoom]="Infinity"
    >
      <ng-flow-background />
      <ng-flow-minimap />
      <ng-flow-panel position="top-left">
        <button type="button" (click)="addNode()">add node</button>
        <div class="initialized-state">
          useNodesInitialized: <strong>{{ initialized() }}</strong>
        </div>
      </ng-flow-panel>
    </ng-flow>
  `,
  styles: [
    `
      .initialized-state {
        margin-top: 6px;
        font-family: monospace;
        font-size: 12px;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 6px;
        padding: 6px 8px;
      }
    `,
  ],
})
export class UseNodesInitializedInner {
  protected readonly Infinity = Infinity;

  private readonly flow = useReactFlow();
  protected readonly nodesState = useNodesState(initialNodes);
  protected readonly edgesState = useEdgesState(initialEdges);

  // Mirrors React's `useNodesInitialized()`.
  protected readonly initialized = useNodesInitialized();

  protected readonly onConnect: OnConnect = (params: Connection) =>
    this.edgesState.setEdges((eds) => addEdge(params, eds));

  constructor() {
    // Mirrors React's `useEffect(() => console.log('initialized', initialized), [initialized])`.
    effect(() => console.log('initialized', this.initialized()));
  }

  protected addNode(): void {
    this.flow.addNodes({
      id: `${Math.random()}`,
      data: { label: 'new node' },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    });
  }
}

@Component({
  selector: 'app-use-nodes-initialized',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, UseNodesInitializedInner],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow-provider>
      <app-use-nodes-initialized-inner />
    </ng-flow-provider>
  `,
})
export class UseNodesInitPage {}
