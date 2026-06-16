import { ChangeDetectionStrategy, Component } from '@angular/core';
import dagre from 'dagre';
import {
  addEdge,
  type Connection,
  Controls,
  type CoordinateExtent,
  type Edge,
  type EdgeMarker,
  MarkerType,
  NgFlow,
  NgFlowProvider,
  Panel,
  Position,
  type ReactFlowInstance,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'ng-flow';

import initialItems from './initial-elements';
import { LayoutingDevtools } from './devtools-overlay';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeExtent: CoordinateExtent = [
  [0, 0],
  [1000, 1000],
];

/**
 * Inner flow rendered UNDER `<ng-flow-provider>` so `useReactFlow()` resolves in field
 * initializers. Mirrors React's `LayoutFlow`: dagre auto-layout on demand (vertical/horizontal),
 * unselect-all, marker toggle, and several `fitView` variants. Layout runs once on init (`TB`).
 */
@Component({
  selector: 'app-layouting-flow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Controls, Panel, LayoutingDevtools],
  host: { style: 'display:block;height:100%;position:relative' },
  template: `
    <ng-flow
      [nodes]="nodesState.nodes()"
      [edges]="edgesState.edges()"
      [onConnect]="onConnect"
      [nodeExtent]="nodeExtent"
      [onInit]="onInit"
      [onNodesChange]="nodesState.onNodesChange"
      [onEdgesChange]="edgesState.onEdgesChange"
    >
      <ng-flow-controls />
      <app-layouting-devtools />

      <ng-flow-panel position="top-right">
        <button type="button" (click)="onLayout('TB')">vertical layout</button>
        <button type="button" (click)="onLayout('LR')">horizontal layout</button>
        <button type="button" (click)="unselect()">unselect nodes</button>
        <button type="button" (click)="changeMarker()">change marker</button>
        <button type="button" (click)="fitViewAll()">fitView</button>
        <button type="button" (click)="fitViewPartially()">fitView partially</button>
      </ng-flow-panel>
    </ng-flow>
  `,
})
export class LayoutingFlow {
  protected readonly nodeExtent = nodeExtent;

  protected readonly nodesState = useNodesState(initialItems.nodes);
  protected readonly edgesState = useEdgesState(initialItems.edges);

  private readonly flow = useReactFlow();

  protected readonly onConnect = (connection: Connection): void => {
    this.edgesState.setEdges((eds) => addEdge(connection, eds));
  };

  protected readonly onInit = (_: ReactFlowInstance): void => {
    this.onLayout('TB');
  };

  protected onLayout(direction: string): void {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    const nodes = this.nodesState.nodes();
    const edges = this.edgesState.edges();

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 150, height: 50 });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);

      return {
        ...node,
        targetPosition: isHorizontal ? Position.Left : Position.Top,
        sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
        position: {
          x: nodeWithPosition.x,
          y: nodeWithPosition.y,
        },
      };
    });

    this.nodesState.setNodes(layoutedNodes);
  }

  protected unselect(): void {
    this.nodesState.setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
  }

  protected changeMarker(): void {
    this.edgesState.setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        markerEnd: {
          type:
            (e.markerEnd as EdgeMarker)?.type === MarkerType.Arrow
              ? MarkerType.ArrowClosed
              : MarkerType.Arrow,
        },
      }))
    );
  }

  protected fitViewAll(): void {
    this.flow.fitView();
  }

  protected fitViewPartially(): void {
    this.flow.fitView({ nodes: this.nodesState.nodes().slice(0, 2) });
  }
}

/**
 * Layouting example — mirrors React Flow's `Layouting/index.tsx`. Wraps the inner flow in
 * `<ng-flow-provider>` so page-level `useReactFlow()` works (React's `ReactFlowProvider`).
 */
@Component({
  selector: 'app-layouting',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, LayoutingFlow],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow-provider style="display:block;height:100%">
      <app-layouting-flow />
    </ng-flow-provider>
  `,
})
export class LayoutingPage {}
