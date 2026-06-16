import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
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
  Panel,
  type ReactFlowInstance,
  useEdgesState,
  useNodesState,
} from 'ng-flow';

import { CustomMiniMapNode } from './custom-minimap-node';

const onInit = (instance: ReactFlowInstance): void => console.log('flow loaded:', instance);
const onNodeClick = (_: MouseEvent, node: Node): void => console.log('click', node);
const onNodeDragStop = (_: MouseEvent | TouchEvent, node: Node): void => console.log('drag stop', node);

/**
 * Inner component rendered UNDER `<ng-flow-provider>` so `useNodesState`/`useEdgesState`
 * resolve in field initializers. Mirrors React's `CustomMiniMapNodeFlow`: a `MiniMap` with
 * a custom circle `nodeComponent`, `onlyRenderVisibleElements`, plus add-node and
 * hide/show-all buttons.
 */
@Component({
  selector: 'app-custom-minimap-node-inner',
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
      [onConnect]="onConnect"
      [onNodeDragStop]="onNodeDragStop"
      [onlyRenderVisibleElements]="true"
    >
      <ng-flow-controls />
      <ng-flow-background [variant]="BackgroundVariant.Lines" />
      <ng-flow-minimap [nodeComponent]="CustomMiniMapNodeComp" />

      <ng-flow-panel position="top-left">
        <button type="button" (click)="addRandomNode()">add node</button>
        <button type="button" (click)="toggleHideAllNodes()">
          {{ hideAllNodes() ? 'show all nodes' : 'hide all nodes' }}
        </button>
      </ng-flow-panel>
    </ng-flow>
  `,
})
export class CustomMiniMapNodeInner {
  protected readonly BackgroundVariant = BackgroundVariant;
  protected readonly CustomMiniMapNodeComp = CustomMiniMapNode;
  protected readonly onInit = onInit;
  protected readonly onNodeClick = onNodeClick;
  protected readonly onNodeDragStop = onNodeDragStop;

  protected readonly nodesState = useNodesState<Node>([]);
  protected readonly edgesState = useEdgesState<Edge>([]);
  protected readonly hideAllNodes = signal(false);

  protected readonly onConnect = (params: Connection | Edge): void => {
    this.edgesState.setEdges((els) => addEdge(params, els));
  };

  protected addRandomNode(): void {
    const nodeId = (this.nodesState.nodes().length + 1).toString();
    const newNode: Node = {
      id: nodeId,
      data: { label: `Node: ${nodeId}` },
      position: {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      },
      hidden: this.hideAllNodes(),
    };
    this.nodesState.setNodes((nds) => nds.concat(newNode));
  }

  protected toggleHideAllNodes(): void {
    const next = !this.hideAllNodes();
    this.hideAllNodes.set(next);
    this.nodesState.setNodes((nds) => nds.map((n) => ({ ...n, hidden: next })));
    this.edgesState.setEdges((eds) => eds.map((e) => ({ ...e, hidden: next })));
  }
}

/**
 * Angular port of React Flow's `CustomMiniMapNode` example. Wraps the inner flow in
 * `<ng-flow-provider>` so the node/edge state hooks are available.
 */
@Component({
  selector: 'app-custom-minimap-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, CustomMiniMapNodeInner],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow-provider>
      <app-custom-minimap-node-inner />
    </ng-flow-provider>
  `,
})
export class CustomMiniMapNodePage {}
