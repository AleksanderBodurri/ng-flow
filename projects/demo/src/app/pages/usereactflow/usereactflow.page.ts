import { ChangeDetectionStrategy, Component } from '@angular/core';
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
  useNodesState,
  useReactFlow,
} from 'ng-flow';

const initialNodes: Node[] = [
  { id: '1', type: 'input', data: { label: 'Node 1' }, position: { x: 250, y: 5 }, className: 'light' },
  { id: '2', data: { label: 'Node 2' }, position: { x: 100, y: 100 }, className: 'light', type: 'default' },
  { id: '3', data: { label: 'Node 3' }, position: { x: 400, y: 100 }, className: 'light', type: 'default' },
  { id: '4', data: { label: 'Node 4' }, position: { x: 400, y: 200 }, className: 'light', type: 'default' },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3' },
];

let id = 5;
const getId = () => `${id++}`;

/**
 * Inner component rendered UNDER `<ng-flow-provider>` so the store is available when
 * `useReactFlow()` runs in a field initializer. Mirrors React's `UseZoomPanHelperFlow`,
 * exercising the full imperative API: animated `zoomIn`/`fitView`/`setCenter` (with
 * duration/ease), `screenToFlowPosition` on pane-click to add a node, `addNodes`/`addEdges`,
 * `setNodes`/`setEdges`, `deleteElements`, `updateNodeData`, and `getNodes`/`getEdges` logging.
 */
@Component({
  selector: 'app-usereactflow-inner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background, MiniMap, Panel],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="nodesState.nodes()"
      [edges]="edgesState.edges()"
      [onNodesChange]="nodesState.onNodesChange"
      [onEdgesChange]="edgesState.onEdgesChange"
      [onNodeClick]="onNodeClick"
      [onConnect]="onConnect"
      [onPaneClick]="onPaneClick"
      [fitView]="true"
      [maxZoom]="Infinity"
    >
      <ng-flow-panel position="top-right">
        <button type="button" (click)="onZoomIn()">zoomIn</button>
        <button type="button" (click)="onZoomOut()">zoomOut</button>
        <button type="button" (click)="onFitViewDefault()">fitView default</button>
        <button type="button" (click)="onFitViewLinear()">fitView linear</button>
        <button type="button" (click)="onAddNode()">add node</button>
        <button type="button" (click)="onResetNodes()">reset nodes</button>
        <button type="button" (click)="logNodes()">useNodes</button>
        <button type="button" (click)="deleteSelectedElements()">deleteSelectedElements</button>
        <button type="button" (click)="deleteSomeElements()">deleteSomeElements</button>
        <button type="button" (click)="onSetNodes()">setNodes</button>
        <button type="button" (click)="onUpdateNode()">updateNode</button>
      </ng-flow-panel>
      <ng-flow-background />
      <ng-flow-minimap />
    </ng-flow>
  `,
  styles: [
    `
      ng-flow-panel button {
        display: block;
        margin-bottom: 4px;
      }
    `,
  ],
})
export class UseReactFlowInner {
  protected readonly Infinity = Infinity;

  private readonly flow = useReactFlow();
  protected readonly nodesState = useNodesState(initialNodes);
  protected readonly edgesState = useEdgesState(initialEdges);

  // edgeAdded ref + initial addEdges, mirroring React's `useEffect` (runs once on construct).
  private edgeAdded = false;

  protected readonly onConnect: OnConnect = (params: Connection) =>
    this.edgesState.setEdges((eds) => addEdge(params, eds));

  protected readonly onPaneClick = (evt: MouseEvent): void => {
    const projectedPosition = this.flow.screenToFlowPosition({ x: evt.clientX, y: evt.clientY });
    this.nodesState.setNodes((nds) =>
      nds.concat({
        id: getId(),
        position: projectedPosition,
        data: { label: `${projectedPosition.x}-${projectedPosition.y}` },
        type: 'default',
      })
    );
  };

  protected readonly onNodeClick = async (_: MouseEvent, node: Node): Promise<void> => {
    console.log('set center start');
    const { x, y } = node.position;
    await this.flow.setCenter(x, y, { zoom: 1, duration: 1200 });
    console.log('set center success');
  };

  constructor() {
    // Mirrors React's `useEffect(() => { addEdges(...); edgeAdded = true }, [addEdges])`.
    if (!this.edgeAdded) {
      this.flow.addEdges({ id: 'e3-4', source: '3', target: '4' });
      this.edgeAdded = true;
    }
  }

  protected async onZoomIn(): Promise<void> {
    await this.flow.zoomIn({ duration: 1200 });
    console.log('zoomIn success');
  }

  protected onZoomOut(): void {
    this.flow.zoomOut({ duration: 0 });
  }

  protected async onFitViewDefault(): Promise<void> {
    console.log('fit view start');
    await this.flow.fitView({ duration: 1200, padding: 0.3 });
    console.log('fit view success');
  }

  protected async onFitViewLinear(): Promise<void> {
    console.log('fit view start');
    await this.flow.fitView({ duration: 1200, padding: 0.3, ease: (t) => +t });
    console.log('fit view success');
  }

  protected onAddNode(): void {
    this.flow.addNodes({
      id: getId(),
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { label: 'New Node' },
      type: 'default',
    });
  }

  protected onResetNodes(): void {
    // Mirrors React's `setNodes: setNodesHook` from useReactFlow (not the local state setter).
    this.flow.setNodes(initialNodes);
  }

  protected logNodes(): void {
    console.log('nodes', this.flow.getNodes());
    console.log('edges', this.flow.getEdges());
  }

  protected deleteSelectedElements(): void {
    const selectedNodes = this.nodesState.nodes().filter((node) => node.selected);
    const selectedEdges = this.edgesState.edges().filter((edge) => edge.selected);
    this.flow.deleteElements({ nodes: selectedNodes, edges: selectedEdges });
  }

  protected deleteSomeElements(): void {
    this.flow.deleteElements({ nodes: [{ id: '2' }], edges: [{ id: 'e1-3' }] });
  }

  protected onSetNodes(): void {
    this.nodesState.setNodes([
      { id: 'a', type: 'default', position: { x: 0, y: 0 }, data: { label: 'Node a' } },
      { id: 'b', type: 'default', position: { x: 0, y: 150 }, data: { label: 'Node b' } },
    ]);
    this.edgesState.setEdges([{ id: 'a-b', source: 'a', target: 'b' }]);
    this.flow.fitView();
  }

  protected onUpdateNode(): void {
    this.flow.updateNodeData('1', { label: 'update' });
    this.flow.updateNodeData('2', { label: 'update' });
  }
}

@Component({
  selector: 'app-usereactflow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, UseReactFlowInner],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow-provider>
      <app-usereactflow-inner />
    </ng-flow-provider>
  `,
})
export class UseReactFlowPage {}
