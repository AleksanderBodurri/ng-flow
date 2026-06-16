import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  addEdge,
  Background,
  type Connection,
  Controls,
  type Edge,
  MiniMap,
  NgFlow,
  NgFlowProvider,
  type Node,
  Panel,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Viewport,
} from 'ng-flow';

const initNodes: Node[] = [
  {
    id: '1a',
    type: 'input',
    data: { label: 'Node 1' },
    position: { x: 250, y: 5 },
    className: 'light',
    ariaLabel: 'Input Node 1',
  },
  {
    id: '2a',
    data: { label: 'Node 2' },
    position: { x: 100, y: 100 },
    className: 'light',
    ariaLabel: 'Default Node 2',
  },
  {
    id: '3a',
    data: { label: 'Node 3' },
    position: { x: 400, y: 100 },
    className: 'light',
  },
  {
    id: '4a',
    data: { label: 'Node 4' },
    position: { x: 400, y: 200 },
    className: 'light',
  },
];

const initEdges: Edge[] = [
  { id: 'e1-2', source: '1a', target: '2a', ariaLabel: undefined },
  { id: 'e1-3', source: '1a', target: '3a' },
];

@Component({
  selector: 'app-controlled-viewport-flow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Panel, MiniMap, Background, Controls],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="nodesState.nodes()"
      [edges]="edgesState.edges()"
      [onNodesChange]="nodesState.onNodesChange"
      [onEdgesChange]="edgesState.onEdgesChange"
      [onConnect]="onConnect"
      [viewport]="currentViewport() === 0 ? viewport() : viewport2()"
      [onViewportChange]="onViewportChange"
    >
      <ng-flow-panel position="top-left">
        <button type="button" (click)="updateViewport()">update viewport</button>
        <button type="button" (click)="fitView()">fitView</button>
        <button type="button" (click)="toggleViewport()">toggle viewport</button>
      </ng-flow-panel>

      <ng-flow-minimap />
      <ng-flow-background />
      <ng-flow-controls />
    </ng-flow>
  `,
})
export class ControlledViewportFlow {
  protected readonly nodesState = useNodesState(initNodes);
  protected readonly edgesState = useEdgesState(initEdges);

  protected readonly viewport = signal<Viewport>({ x: 0, y: 0, zoom: 1 });
  protected readonly viewport2 = signal<Viewport>({ x: 100, y: 100, zoom: 1.5 });
  protected readonly currentViewport = signal(0);

  private readonly instance = useReactFlow();

  protected readonly onConnect = (params: Connection | Edge): void => {
    this.edgesState.setEdges((eds) => addEdge(params, eds));
  };

  // Mirrors React's `setter = currentViewport === 0 ? setViewport : setViewport2`.
  private setter(updater: (vp: Viewport) => Viewport): void {
    if (this.currentViewport() === 0) {
      this.viewport.update(updater);
    } else {
      this.viewport2.update(updater);
    }
  }

  protected readonly onViewportChange = (vp: Viewport): void => {
    this.setter(() => vp);
  };

  protected updateViewport(): void {
    this.setter((vp) => ({ ...vp, y: vp.y + 10 }));
  }

  protected fitView(): void {
    this.instance.fitView();
  }

  protected toggleViewport(): void {
    this.currentViewport.set(this.currentViewport() === 0 ? 1 : 0);
  }
}

@Component({
  selector: 'app-controlled-viewport',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, ControlledViewportFlow],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow-provider style="display:block;height:100%">
      <app-controlled-viewport-flow />
    </ng-flow-provider>
  `,
})
export class ControlledViewportPage {}
