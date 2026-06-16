import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  addEdge,
  type Connection,
  Controls,
  type Edge,
  MiniMap,
  NgFlow,
  NgFlowProvider,
  type Node,
  PanOnScrollMode,
  useEdgesState,
  useNodesState,
  type Viewport,
} from 'ng-flow';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Node 1' },
    position: { x: 250, y: 5 },
  },
  { id: '2', data: { label: 'Node 2' }, position: { x: 100, y: 100 } },
  { id: '3', data: { label: 'Node 3' }, position: { x: 400, y: 100 } },
  { id: '4', data: { label: 'Node 4' }, position: { x: 400, y: 200 } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3' },
];

const onNodeDragStart = (_: MouseEvent | TouchEvent, node: Node) => console.log('drag start', node);
const onNodeDragStop = (_: MouseEvent | TouchEvent, node: Node) => console.log('drag stop', node);
const onNodeClick = (_: MouseEvent, node: Node) => console.log('click', node);
const onEdgeClick = (_: MouseEvent, edge: Edge) => console.log('click', edge);
const onPaneClick = (event: MouseEvent) => console.log('onPaneClick', event);
const onPaneScroll = (event?: WheelEvent) => console.log('onPaneScroll', event);
const onPaneContextMenu = (event: MouseEvent) => console.log('onPaneContextMenu', event);
const onMoveEnd = (_: TouchEvent | MouseEvent | null, viewport: Viewport) =>
  console.log('onMoveEnd', viewport);

@Component({
  selector: 'app-interaction-flow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, MiniMap, Controls],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="nodesState.nodes()"
      [edges]="edgesState.edges()"
      [onNodesChange]="nodesState.onNodesChange"
      [onEdgesChange]="edgesState.onEdgesChange"
      [elementsSelectable]="isSelectable()"
      [nodesConnectable]="isConnectable()"
      [nodesDraggable]="isDraggable()"
      [zoomOnScroll]="zoomOnScroll()"
      [zoomOnPinch]="zoomOnPinch()"
      [panOnScroll]="panOnScroll()"
      [panOnScrollMode]="panOnScrollMode()"
      [zoomOnDoubleClick]="zoomOnDoubleClick()"
      [onConnect]="onConnect"
      [onNodeClick]="captureElementClick() ? onNodeClick : undefined"
      [onEdgeClick]="captureElementClick() ? onEdgeClick : undefined"
      [onNodeDragStart]="onNodeDragStart"
      [onNodeDragStop]="onNodeDragStop"
      [panOnDrag]="panOnDrag()"
      [onPaneClick]="captureZoomClick() ? onPaneClick : undefined"
      [onPaneScroll]="captureZoomScroll() ? onPaneScroll : undefined"
      [onPaneContextMenu]="captureZoomClick() ? onPaneContextMenu : undefined"
      [nodeDragThreshold]="0"
      [onMoveEnd]="onMoveEnd"
    >
      <ng-flow-minimap />
      <ng-flow-controls />

      <div style="position: absolute; left: 10px; top: 10px; z-index: 4;">
        <div>
          <label for="draggable">
            nodesDraggable
            <input
              id="draggable"
              type="checkbox"
              [checked]="isDraggable()"
              (change)="isDraggable.set($any($event.target).checked)"
              class="react-flow__draggable"
            />
          </label>
        </div>
        <div>
          <label for="connectable">
            nodesConnectable
            <input
              id="connectable"
              type="checkbox"
              [checked]="isConnectable()"
              (change)="isConnectable.set($any($event.target).checked)"
              class="react-flow__connectable"
            />
          </label>
        </div>
        <div>
          <label for="selectable">
            elementsSelectable
            <input
              id="selectable"
              type="checkbox"
              [checked]="isSelectable()"
              (change)="isSelectable.set($any($event.target).checked)"
              class="react-flow__selectable"
            />
          </label>
        </div>
        <div>
          <label for="zoomonscroll">
            zoomOnScroll
            <input
              id="zoomonscroll"
              type="checkbox"
              [checked]="zoomOnScroll()"
              (change)="zoomOnScroll.set($any($event.target).checked)"
              class="react-flow__zoomonscroll"
            />
          </label>
        </div>
        <div>
          <label for="zoomonpinch">
            zoomOnPinch
            <input
              id="zoomonpinch"
              type="checkbox"
              [checked]="zoomOnPinch()"
              (change)="zoomOnPinch.set($any($event.target).checked)"
              class="react-flow__zoomonpinch"
            />
          </label>
        </div>
        <div>
          <label for="panonscroll">
            panOnScroll
            <input
              id="panonscroll"
              type="checkbox"
              [checked]="panOnScroll()"
              (change)="panOnScroll.set($any($event.target).checked)"
              class="react-flow__panonscroll"
            />
          </label>
        </div>
        <div>
          <label for="panonscrollmode">
            panOnScrollMode
            <select
              id="panonscrollmode"
              [value]="panOnScrollMode()"
              (change)="panOnScrollMode.set($any($event.target).value)"
              class="react-flow__panonscrollmode"
            >
              <option value="free">free</option>
              <option value="horizontal">horizontal</option>
              <option value="vertical">vertical</option>
            </select>
          </label>
        </div>
        <div>
          <label for="zoomondbl">
            zoomOnDoubleClick
            <input
              id="zoomondbl"
              type="checkbox"
              [checked]="zoomOnDoubleClick()"
              (change)="zoomOnDoubleClick.set($any($event.target).checked)"
              class="react-flow__zoomondbl"
            />
          </label>
        </div>
        <div>
          <label for="panondrag">
            panOnDrag
            <input
              id="panondrag"
              type="checkbox"
              [checked]="panOnDrag()"
              (change)="panOnDrag.set($any($event.target).checked)"
              class="react-flow__panondrag"
            />
          </label>
        </div>
        <div>
          <label for="capturezoompaneclick">
            capture onPaneClick
            <input
              id="capturezoompaneclick"
              type="checkbox"
              [checked]="captureZoomClick()"
              (change)="captureZoomClick.set($any($event.target).checked)"
              class="react-flow__capturezoompaneclick"
            />
          </label>
        </div>
        <div>
          <label for="capturezoompanescroll">
            capture onPaneScroll
            <input
              id="capturezoompanescroll"
              type="checkbox"
              [checked]="captureZoomScroll()"
              (change)="captureZoomScroll.set($any($event.target).checked)"
              class="react-flow__capturezoompanescroll"
            />
          </label>
        </div>
        <div>
          <label for="captureelementclick">
            capture onElementClick
            <input
              id="captureelementclick"
              type="checkbox"
              [checked]="captureElementClick()"
              (change)="captureElementClick.set($any($event.target).checked)"
              class="react-flow__captureelementclick"
            />
          </label>
        </div>
      </div>
    </ng-flow>
  `,
})
export class InteractionFlow {
  protected readonly nodesState = useNodesState(initialNodes);
  protected readonly edgesState = useEdgesState(initialEdges);

  protected readonly onNodeClick = onNodeClick;
  protected readonly onEdgeClick = onEdgeClick;
  protected readonly onNodeDragStart = onNodeDragStart;
  protected readonly onNodeDragStop = onNodeDragStop;
  protected readonly onPaneClick = onPaneClick;
  protected readonly onPaneScroll = onPaneScroll;
  protected readonly onPaneContextMenu = onPaneContextMenu;
  protected readonly onMoveEnd = onMoveEnd;

  protected readonly onConnect = (params: Connection | Edge): void => {
    this.edgesState.setEdges((els) => addEdge(params, els));
  };

  protected readonly isSelectable = signal(false);
  protected readonly isDraggable = signal(false);
  protected readonly isConnectable = signal(false);
  protected readonly zoomOnScroll = signal(false);
  protected readonly zoomOnPinch = signal(false);
  protected readonly panOnScroll = signal(false);
  protected readonly panOnScrollMode = signal<PanOnScrollMode>(PanOnScrollMode.Free);
  protected readonly zoomOnDoubleClick = signal(false);
  protected readonly panOnDrag = signal(true);
  protected readonly captureZoomClick = signal(false);
  protected readonly captureZoomScroll = signal(false);
  protected readonly captureElementClick = signal(false);
}

@Component({
  selector: 'app-interaction',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, InteractionFlow],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow-provider style="display:block;height:100%">
      <app-interaction-flow />
    </ng-flow-provider>
  `,
})
export class InteractionPage {}
