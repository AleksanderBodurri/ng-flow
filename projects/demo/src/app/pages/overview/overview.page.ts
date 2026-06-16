import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  signal,
  type TemplateRef,
  viewChild,
} from '@angular/core';
import {
  addEdge,
  Background,
  type Connection,
  ConnectionMode,
  Controls,
  type CSSProperties,
  type Edge,
  MiniMap,
  NgFlow,
  type Node,
  type OnBeforeDelete,
  type OnConnect,
  type OnDelete,
  type OnMoveEnd,
  type OnMoveStart,
  type OnSelectionChangeFunc,
  type ReactFlowInstance,
  type SnapGrid,
  type Viewport,
  useEdgesState,
  useNodesState,
} from 'ng-flow';

// ── module-level handlers (mirror React's top-level const handlers) ─────────────
const onNodeDragStart = (_: MouseEvent | TouchEvent, node: Node, nodes: Node[]) =>
  console.log('drag start', node, nodes);
const onNodeDrag = (_: MouseEvent | TouchEvent, node: Node, nodes: Node[]) => console.log('drag', node, nodes);
const onNodeDragStop = (_: MouseEvent | TouchEvent, node: Node, nodes: Node[]) =>
  console.log('drag stop', node, nodes);
const onNodeDoubleClick = (_: MouseEvent, node: Node) => console.log('node double click', node);
const onPaneClick = (event: MouseEvent) => console.log('pane click', event);
const onPaneScroll = (event?: WheelEvent) => console.log('pane scroll', event);
const onPaneContextMenu = (event: MouseEvent) => console.log('pane context menu', event);
const onSelectionDrag = (_: MouseEvent, nodes: Node[]) => console.log('selection drag', nodes);
const onSelectionDragStart = (_: MouseEvent, nodes: Node[]) => console.log('selection drag start', nodes);
const onSelectionDragStop = (_: MouseEvent, nodes: Node[]) => console.log('selection drag stop', nodes);
const onSelectionContextMenu = (event: MouseEvent, nodes: Node[]) => {
  event.preventDefault();
  console.log('selection context menu', nodes);
};
const onNodeClick = (_: MouseEvent, node: Node) => console.log('node click:', node);

const onSelectionChange: OnSelectionChangeFunc = ({ nodes, edges }) =>
  console.log('selection change', nodes, edges);
const onInit = (reactFlowInstance: ReactFlowInstance) => {
  console.log('pane ready:', reactFlowInstance);
};

const onMoveStart: OnMoveStart = (_: MouseEvent | TouchEvent | null, viewport: Viewport) =>
  console.log('zoom/move start', viewport);
const onMoveEnd: OnMoveEnd = (_: MouseEvent | TouchEvent | null, viewport: Viewport) =>
  console.log('zoom/move end', viewport);
const onEdgeContextMenu = (_: MouseEvent, edge: Edge) => console.log('edge context menu', edge);
const onEdgeMouseEnter = (_: MouseEvent, edge: Edge) => console.log('edge mouse enter', edge);
const onEdgeMouseMove = (_: MouseEvent, edge: Edge) => console.log('edge mouse move', edge);
const onEdgeMouseLeave = (_: MouseEvent, edge: Edge) => console.log('edge mouse leave', edge);
const onEdgeDoubleClick = (_: MouseEvent, edge: Edge) => console.log('edge double click', edge);
const onBeforeDelete: OnBeforeDelete = async ({ nodes, edges }) => {
  console.log('on before delete', nodes, edges);
  const deleteElements = confirm('Do you want to remove the selected elements?');
  return deleteElements;
};
const onDelete: OnDelete = ({ nodes, edges }) => console.log('on delete', nodes, edges);
const onPaneMouseMove = (e: MouseEvent) => console.log('pane move', e.clientX, e.clientY);

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', label: 'this is an edge label' },
  { id: 'e1-3', source: '1', target: '3' },
  { id: 'e3-4', source: '3', target: '4', animated: true, label: 'animated edge' },
  { id: 'e4-5', source: '4', target: '5', label: 'edge with arrow head' },
  {
    id: 'e5-6',
    source: '5',
    target: '6',
    type: 'smoothstep',
    deletable: false,
    label: 'smooth step edge (not deletable)',
  },
  {
    id: 'e5-7',
    source: '5',
    target: '7',
    type: 'step',
    style: { stroke: '#f6ab6c' },
    label: 'a step edge',
    animated: true,
    labelStyle: { fill: '#f6ab6c', fontWeight: 700 },
  },
];

const connectionLineStyle: CSSProperties = { stroke: '#ddd' };
const snapGrid: SnapGrid = [25, 25];

const nodeStrokeColor = (n: Node): string => {
  const bg = (n.style as CSSProperties | undefined)?.['background'];
  if (bg) return bg as string;
  if (n.type === 'input') return '#0041d0';
  if (n.type === 'output') return '#ff0072';
  if (n.type === 'default') return '#1a192b';
  return '#eee';
};

const nodeColor = (n: Node): string => {
  const bg = (n.style as CSSProperties | undefined)?.['background'];
  if (bg) return bg as string;
  return '#fff';
};

/**
 * The kitchen-sink "Overview" example. Mirrors React Flow's Overview index.tsx end-to-end:
 * rich (HTML) node labels via `TemplateRef`s, per-node `style`, a non-deletable output node
 * (`deletable: false`), edge types/labels/markers/animated edges, `snapToGrid` with a
 * `[25,25]` grid, `connectionMode = Strict`, `onBeforeDelete` (with `confirm()`), `onDelete`,
 * the full event-handler suite, horizontal `Controls`, a `MiniMap` with color functions,
 * `attributionPosition="top-right"`, and `maxZoom = Infinity`.
 *
 * React's JSX labels (`<strong>` / `<a>` links) are reproduced with `<ng-template>`s grabbed
 * via `viewChild` and assigned into node `data.label` after view init (ng-flow's default node
 * renders a `TemplateRef` label through `ngTemplateOutlet`).
 */
@Component({
  selector: 'app-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background, Controls, MiniMap],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-template #label1>Welcome to <strong>React Flow!</strong></ng-template>
    <ng-template #label2>This is a <strong>default node</strong></ng-template>
    <ng-template #label3>This one has a <strong>custom style</strong></ng-template>
    <ng-template #label4>
      You can find the docs on
      <a href="https://github.com/wbkd/react-flow" target="_blank" rel="noopener noreferrer">Github</a>
    </ng-template>
    <ng-template #label5>Or check out the other <strong>examples</strong></ng-template>
    <ng-template #label6>An <strong>output node (not deletable)</strong></ng-template>

    <ng-flow
      [nodes]="nodesState.nodes()"
      [edges]="edgesState.edges()"
      [connectionMode]="ConnectionMode.Strict"
      [onNodesChange]="nodesState.onNodesChange"
      [onEdgesChange]="edgesState.onEdgesChange"
      [onNodeClick]="onNodeClick"
      [onConnect]="onConnect"
      [onPaneClick]="onPaneClick"
      [onPaneScroll]="onPaneScroll"
      [onPaneContextMenu]="onPaneContextMenu"
      [onNodeDragStart]="onNodeDragStart"
      [onNodeDrag]="onNodeDrag"
      [onNodeDragStop]="onNodeDragStop"
      [onNodeDoubleClick]="onNodeDoubleClick"
      [onSelectionDragStart]="onSelectionDragStart"
      [onSelectionDrag]="onSelectionDrag"
      [onSelectionDragStop]="onSelectionDragStop"
      [onSelectionContextMenu]="onSelectionContextMenu"
      [onSelectionChange]="onSelectionChange"
      [onMoveStart]="onMoveStart"
      [onMoveEnd]="onMoveEnd"
      [onInit]="onInit"
      [connectionLineStyle]="connectionLineStyle"
      [snapToGrid]="true"
      [snapGrid]="snapGrid"
      [onEdgeContextMenu]="onEdgeContextMenu"
      [onEdgeMouseEnter]="onEdgeMouseEnter"
      [onEdgeMouseMove]="onEdgeMouseMove"
      [onEdgeMouseLeave]="onEdgeMouseLeave"
      [onEdgeDoubleClick]="onEdgeDoubleClick"
      [fitView]="true"
      [fitViewOptions]="fitViewOptions"
      attributionPosition="top-right"
      [maxZoom]="Infinity"
      [onBeforeDelete]="onBeforeDelete"
      [onDelete]="onDelete"
      [onPaneMouseMove]="onPaneMouseMove"
    >
      <ng-flow-minimap [nodeBorderRadius]="2" [nodeStrokeColor]="nodeStrokeColor" [nodeColor]="nodeColor" />
      <ng-flow-controls orientation="horizontal" />
      <ng-flow-background [gap]="25" />
    </ng-flow>
  `,
})
export class OverviewPage implements AfterViewInit {
  protected readonly ConnectionMode = ConnectionMode;
  protected readonly Infinity = Infinity;
  protected readonly connectionLineStyle = connectionLineStyle;
  protected readonly snapGrid = snapGrid;
  protected readonly fitViewOptions = { padding: 0.1 };
  protected readonly nodeStrokeColor = nodeStrokeColor;
  protected readonly nodeColor = nodeColor;

  // module-level handlers exposed to the template
  protected readonly onNodeClick = onNodeClick;
  protected readonly onPaneClick = onPaneClick;
  protected readonly onPaneScroll = onPaneScroll;
  protected readonly onPaneContextMenu = onPaneContextMenu;
  protected readonly onNodeDragStart = onNodeDragStart;
  protected readonly onNodeDrag = onNodeDrag;
  protected readonly onNodeDragStop = onNodeDragStop;
  protected readonly onNodeDoubleClick = onNodeDoubleClick;
  protected readonly onSelectionDragStart = onSelectionDragStart;
  protected readonly onSelectionDrag = onSelectionDrag;
  protected readonly onSelectionDragStop = onSelectionDragStop;
  protected readonly onSelectionContextMenu = onSelectionContextMenu;
  protected readonly onSelectionChange = onSelectionChange;
  protected readonly onMoveStart = onMoveStart;
  protected readonly onMoveEnd = onMoveEnd;
  protected readonly onInit = onInit;
  protected readonly onEdgeContextMenu = onEdgeContextMenu;
  protected readonly onEdgeMouseEnter = onEdgeMouseEnter;
  protected readonly onEdgeMouseMove = onEdgeMouseMove;
  protected readonly onEdgeMouseLeave = onEdgeMouseLeave;
  protected readonly onEdgeDoubleClick = onEdgeDoubleClick;
  protected readonly onBeforeDelete = onBeforeDelete;
  protected readonly onDelete = onDelete;
  protected readonly onPaneMouseMove = onPaneMouseMove;

  private readonly label1 = viewChild.required<TemplateRef<unknown>>('label1');
  private readonly label2 = viewChild.required<TemplateRef<unknown>>('label2');
  private readonly label3 = viewChild.required<TemplateRef<unknown>>('label3');
  private readonly label4 = viewChild.required<TemplateRef<unknown>>('label4');
  private readonly label5 = viewChild.required<TemplateRef<unknown>>('label5');
  private readonly label6 = viewChild.required<TemplateRef<unknown>>('label6');

  // Start empty; labels (TemplateRefs) are only available after view init.
  protected readonly nodesState = useNodesState<Node>([]);
  protected readonly edgesState = useEdgesState(initialEdges);

  // Suppress "set in change detection" by initializing nodes once the view exists.
  private readonly built = signal(false);

  ngAfterViewInit(): void {
    if (this.built()) return;
    this.built.set(true);

    const initialNodes: Node[] = [
      { id: '1', type: 'input', data: { label: this.label1() }, position: { x: 250, y: 0 } },
      { id: '2', data: { label: this.label2() }, position: { x: 100, y: 100 } },
      {
        id: '3',
        data: { label: this.label3() },
        position: { x: 400, y: 100 },
        style: { background: '#D6D5E6', color: '#333', border: '1px solid #222138', width: 180 },
      },
      { id: '4', position: { x: 250, y: 200 }, data: { label: this.label4() } },
      { id: '5', data: { label: this.label5() }, position: { x: 250, y: 325 } },
      { id: '6', type: 'output', data: { label: this.label6() }, position: { x: 100, y: 480 }, deletable: false },
      { id: '7', type: 'output', data: { label: 'Another output node' }, position: { x: 400, y: 450 } },
    ];

    this.nodesState.setNodes(initialNodes);
  }

  protected readonly onConnect: OnConnect = (params: Connection) =>
    this.edgesState.setEdges((eds) => addEdge(params, eds));
}
