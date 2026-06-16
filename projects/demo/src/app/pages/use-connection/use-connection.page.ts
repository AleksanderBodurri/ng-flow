import { ChangeDetectionStrategy, Component, computed, effect } from '@angular/core';
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
  useConnection,
  useEdgesState,
  useNodesState,
} from 'ng-flow';

const initialNodes: Node[] = [
  { id: '1', type: 'input', data: { label: 'Node 1' }, position: { x: 250, y: 5 } },
  { id: '2', data: { label: 'Node 2' }, position: { x: 100, y: 100 } },
  { id: '3', data: { label: 'Node 3' }, position: { x: 400, y: 100 } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
];

/**
 * Inner component rendered UNDER `<ng-flow-provider>` so the store is available when
 * `useConnection()` runs. Mirrors React's `UseConnectionFlow`, which logs the connection
 * state on every change. Drag from a handle to see `inProgress` flip and the live values.
 */
@Component({
  selector: 'app-use-connection-inner',
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
    >
      <ng-flow-background />
      <ng-flow-minimap />
      <ng-flow-panel position="top-left">
        <div class="connection-panel">
          <div class="title">useConnection()</div>
          <div class="row"><span>inProgress</span><span>{{ connection().inProgress }}</span></div>
          <div class="row"><span>isValid</span><span>{{ display().isValid }}</span></div>
          <div class="row"><span>from</span><span>{{ display().from }}</span></div>
          <div class="row"><span>to</span><span>{{ display().to }}</span></div>
          <div class="row"><span>fromHandle</span><span>{{ display().fromHandle }}</span></div>
          <div class="row"><span>toHandle</span><span>{{ display().toHandle }}</span></div>
        </div>
      </ng-flow-panel>
    </ng-flow>
  `,
  styles: [
    `
      .connection-panel {
        font-family: monospace;
        font-size: 12px;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 6px;
        padding: 8px 10px;
        min-width: 200px;
      }
      .title {
        font-weight: 700;
        margin-bottom: 6px;
      }
      .row {
        display: flex;
        justify-content: space-between;
        gap: 16px;
      }
      .row span:last-child {
        color: #555;
        text-align: right;
      }
    `,
  ],
})
export class UseConnectionInner {
  protected readonly nodesState = useNodesState(initialNodes);
  protected readonly edgesState = useEdgesState(initialEdges);

  // Mirrors React's `useConnection()` — returns a Signal of the ConnectionState here.
  protected readonly connection = useConnection();

  // Derive printable strings from the connection state (it has null fields when idle).
  protected readonly display = computed(() => {
    const c = this.connection();
    const point = (p?: { x: number; y: number } | null) =>
      p ? `${Math.round(p.x)}, ${Math.round(p.y)}` : '–';
    return {
      isValid: c.inProgress ? `${c.isValid}` : '–',
      from: c.inProgress ? point(c.from) : '–',
      to: c.inProgress ? point(c.to) : '–',
      fromHandle: c.inProgress ? `${c.fromHandle?.nodeId ?? '–'} / ${c.fromHandle?.type ?? '–'}` : '–',
      toHandle: c.inProgress ? `${c.toHandle?.nodeId ?? '–'} / ${c.toHandle?.type ?? '–'}` : '–',
    };
  });

  protected readonly onConnect: OnConnect = (params: Connection) =>
    this.edgesState.setEdges((eds) => addEdge(params, eds));

  constructor() {
    // Mirrors React's `useEffect(() => console.log('connection', connection), [connection])`.
    effect(() => console.log('connection', this.connection()));
  }
}

@Component({
  selector: 'app-use-connection',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, UseConnectionInner],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow-provider>
      <app-use-connection-inner />
    </ng-flow-provider>
  `,
})
export class UseConnectionPage {}
