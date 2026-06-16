import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  addEdge,
  Background,
  type Connection,
  type Edge,
  MarkerType,
  MiniMap,
  NgFlow,
  NgFlowProvider,
  type Node,
  useEdgesState,
  useNodesState,
} from 'ng-flow';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Node 1' },
    position: { x: 250, y: 5 },
    className: 'light',
  },
  {
    id: '2',
    data: { label: 'Node 2' },
    position: { x: 100, y: 100 },
    className: 'light',
  },
  {
    id: '3',
    data: { label: 'Node 3' },
    position: { x: 400, y: 100 },
    className: 'light',
  },
  {
    id: '4',
    data: { label: 'Node 4' },
    position: { x: 400, y: 200 },
    className: 'light',
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
    markerEnd: { type: MarkerType.Arrow },
  },
  { id: 'e1-3', source: '1', target: '3' },
];

// The actual flow — rendered under its own <ng-flow-provider> so each instance
// keeps an isolated store (mirrors React's per-Flow <ReactFlowProvider>).
@Component({
  selector: 'app-multiflows-inner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background, MiniMap],
  host: { style: 'display:block;width:100%;height:100%' },
  template: `
    <ng-flow
      [nodes]="nodesState.nodes()"
      [edges]="edgesState.edges()"
      [onNodesChange]="nodesState.onNodesChange"
      [onEdgesChange]="edgesState.onEdgesChange"
      [onConnect]="onConnect"
      [id]="id()"
    >
      <ng-flow-background />
      <ng-flow-minimap />
    </ng-flow>
  `,
})
export class MultiFlowsInner {
  readonly id = input.required<string>();

  protected readonly nodesState = useNodesState(initialNodes);
  protected readonly edgesState = useEdgesState(initialEdges);

  protected readonly onConnect = (params: Edge | Connection): void => {
    this.edgesState.setEdges((eds) => addEdge(params, eds));
  };
}

@Component({
  selector: 'app-multiflows-flow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, MultiFlowsInner],
  host: { class: 'flow-wrapper' },
  template: `
    <ng-flow-provider style="display:block;width:100%;height:100%">
      <app-multiflows-inner [id]="id()" />
    </ng-flow-provider>
  `,
})
export class MultiFlowsFlow {
  readonly id = input.required<string>();
}

@Component({
  selector: 'app-multiflows',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MultiFlowsFlow],
  host: { style: 'display:block;height:100%' },
  styleUrl: './multiflows.page.css',
  template: `
    <div class="multiflows">
      <app-multiflows-flow id="flow-a" />
      <app-multiflows-flow id="flow-b" />
    </div>
  `,
})
export class MultiFlowsPage {}
