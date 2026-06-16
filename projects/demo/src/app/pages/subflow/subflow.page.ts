import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  addEdge,
  Background,
  type Connection,
  Controls,
  type CoordinateExtent,
  type Edge,
  MarkerType,
  MiniMap,
  NgFlow,
  NgFlowProvider,
  type Node,
  type NodeTypes,
  type OnConnect,
  type OnNodeDrag,
  Panel,
  type ReactFlowInstance,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useUpdateNodeInternals,
} from 'ng-flow';

import { SubflowDebugNode } from './debug-node';

const onNodeDrag: OnNodeDrag = (_, node, nodes) => console.log('drag', node, nodes);
const onNodeDragStop: OnNodeDrag = (_, node, nodes) => console.log('drag stop', node, nodes);
const onNodeClick = (_: MouseEvent, node: Node) => console.log('click', node);
const onEdgeClick = (_: MouseEvent, edge: Edge) => console.log('click', edge);

const initialNodes: Node[] = [
  { id: '1', type: 'input', data: { label: 'Node 1' }, position: { x: -200, y: -500 }, className: 'light', origin: [0.5, 0.5] },
  {
    id: '4',
    data: { label: 'Node 4' },
    position: { x: 100, y: 200 },
    className: 'light',
    origin: [0, 0],
    style: { backgroundColor: 'rgba(255,50, 50, 0.5)', width: 500, height: 300 },
  },
  {
    id: '4a',
    data: { label: 'Node 4a' },
    position: { x: -15, y: -15 },
    className: 'light',
    parentId: '4',
    origin: [0, 0],
    extent: [
      [0, 0],
      [300, 100],
    ],
  },
  {
    id: '4b',
    data: { label: 'Node 4b' },
    position: { x: 100, y: 60 },
    className: 'light',
    style: { backgroundColor: 'rgba(50, 50, 255, 0.5)', height: 200, width: 300 },
    parentId: '4',
  },
  { id: '4b1', data: { label: 'Node 4b1' }, position: { x: 40, y: 20 }, className: 'light', parentId: '4b' },
  { id: '4b2', data: { label: 'Node 4b2' }, position: { x: 20, y: 100 }, className: 'light', parentId: '4b' },
  {
    id: '5',
    data: { label: 'Node 5' },
    position: { x: 650, y: 250 },
    className: 'light',
    style: { width: 100, height: 100 },
  },
  { id: '5a', data: { label: 'Node 5a' }, position: { x: -100, y: -100 }, className: 'light', parentId: '5', extent: 'parent' },
  { id: '5b', data: { label: 'Node 5b' }, position: { x: 200, y: 200 }, className: 'light', parentId: '5', expandParent: true },
  { id: '2', data: { label: 'Node 2' }, position: { x: 100, y: 100 }, className: 'light' },
  { id: '3', data: { label: 'Node 3' }, position: { x: 400, y: 100 }, className: 'light', extent: 'parent' },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    markerEnd: { type: MarkerType.Arrow, strokeWidth: 2, width: 15, height: 15, color: '#f00' },
  },
  { id: 'e1-3', source: '1', target: '3' },
  { id: 'e3-4', source: '3', target: '4' },
  { id: 'e3-4b', source: '3', target: '4b' },
  { id: 'e4a-4b1', source: '4a', target: '4b1' },
  { id: 'e4a-4b2', source: '4a', target: '4b2' },
  { id: 'e4b1-4b2', source: '4b1', target: '4b2' },
];

const nodeTypes: NodeTypes = {
  default: SubflowDebugNode,
};

const nodeExtent: CoordinateExtent = [
  [0, 0],
  [1000, 1000],
];

/**
 * Inner `Subflow` component (under `<ng-flow-provider>` so `useReactFlow` /
 * `useUpdateNodeInternals` work). Mirrors React's nested-subflow example: deeply nested
 * `parentId` chains, per-node `origin`, `extent: 'parent'`, `expandParent`, and a global
 * `nodeExtent`. Every node renders as a `DebugNode` (registered as `default`) showing its
 * absolute/relative position + zIndex. `onlyRenderVisibleElements` is false.
 *
 * Panel buttons: reset transform, randomize root positions, toggle light/dark classnames,
 * hide/show child nodes (`toggleChildNodes`), log `toObject()`, reset to `initialNodes`, and
 * force `updateNodeInternals` for all nodes.
 */
@Component({
  selector: 'app-subflow-inner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background, Controls, MiniMap, Panel],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="nodesState.nodes()"
      [edges]="edgesState.edges()"
      [onInit]="onInit"
      [onNodesChange]="nodesState.onNodesChange"
      [onEdgesChange]="edgesState.onEdgesChange"
      [onNodeClick]="onNodeClick"
      [onEdgeClick]="onEdgeClick"
      [onConnect]="onConnect"
      [onNodeDrag]="onNodeDrag"
      [onNodeDragStop]="onNodeDragStop"
      className="react-flow-basic-example"
      [onlyRenderVisibleElements]="false"
      [nodeTypes]="nodeTypes"
      [fitView]="true"
      [nodeOrigin]="[0, 0]"
      [nodeExtent]="nodeExtent"
    >
      <ng-flow-minimap />
      <ng-flow-controls />
      <ng-flow-background />

      <ng-flow-panel position="top-right">
        <button type="button" (click)="resetTransform()">reset transform</button>
        <button type="button" (click)="updatePos()">change pos</button>
        <button type="button" (click)="toggleClassnames()">toggle classnames</button>
        <button type="button" (click)="toggleChildNodes()">toggleChildNodes</button>
        <button type="button" (click)="logToObject()">toObject</button>
        <button type="button" (click)="resetNodes()">setNodes</button>
        <button type="button" (click)="updateAllNodeInternals()">updateNodeInternals</button>
      </ng-flow-panel>
    </ng-flow>
  `,
})
export class SubflowInner {
  protected readonly nodeTypes = nodeTypes;
  protected readonly nodeExtent = nodeExtent;

  protected readonly onNodeClick = onNodeClick;
  protected readonly onEdgeClick = onEdgeClick;
  protected readonly onNodeDrag = onNodeDrag;
  protected readonly onNodeDragStop = onNodeDragStop;

  private readonly flow = useReactFlow();
  private readonly updateNodeInternals = useUpdateNodeInternals();

  protected readonly nodesState = useNodesState(initialNodes);
  protected readonly edgesState = useEdgesState(initialEdges);

  private rfInstance: ReactFlowInstance | null = null;

  protected readonly onConnect: OnConnect = (connection: Connection) =>
    this.edgesState.setEdges((eds) => addEdge(connection, eds));

  protected readonly onInit = (instance: ReactFlowInstance): void => {
    this.rfInstance = instance;
  };

  protected updatePos(): void {
    this.nodesState.setNodes((nds) =>
      nds.map((n) => {
        if (!n.parentId) {
          return { ...n, position: { x: Math.random() * 400, y: Math.random() * 400 } };
        }
        return n;
      })
    );
  }

  protected logToObject(): void {
    console.log(this.rfInstance?.toObject());
  }

  protected resetTransform(): void {
    this.rfInstance?.setViewport({ x: 0, y: 0, zoom: 1 });
  }

  protected toggleClassnames(): void {
    this.nodesState.setNodes((nds) =>
      nds.map((n) => ({ ...n, className: n.className === 'light' ? 'dark' : 'light' }))
    );
  }

  protected toggleChildNodes(): void {
    this.nodesState.setNodes((nds) => nds.map((n) => ({ ...n, hidden: !!n.parentId && !n.hidden })));
  }

  protected resetNodes(): void {
    this.nodesState.setNodes(initialNodes);
  }

  protected updateAllNodeInternals(): void {
    this.updateNodeInternals(this.nodesState.nodes().map((node) => node.id));
  }
}

@Component({
  selector: 'app-subflow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, SubflowInner],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow-provider [nodeExtent]="nodeExtent">
      <app-subflow-inner />
    </ng-flow-provider>
  `,
})
export class SubflowPage {
  protected readonly nodeExtent = nodeExtent;
}
