import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  addEdge,
  Background,
  BackgroundVariant,
  type Connection,
  Controls,
  type Edge,
  type Node,
  NgFlow,
  type ReactFlowInstance,
  useEdgesState,
  useNodesState,
} from 'ng-flow';

const onInit = (reactFlowInstance: ReactFlowInstance): void => console.log('flow loaded:', reactFlowInstance);
const onNodeClick = (_: MouseEvent, node: Node): void => console.log('click', node);
const onNodeDragStop = (_: MouseEvent | TouchEvent, node: Node): void => console.log('drag stop', node);

@Component({
  selector: 'app-empty',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background, Controls],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="ns.nodes()"
      [edges]="es.edges()"
      [onInit]="onInit"
      [onNodesChange]="ns.onNodesChange"
      [onEdgesChange]="es.onEdgesChange"
      [onNodeClick]="onNodeClick"
      [onConnect]="onConnect"
      [onNodeDragStop]="onNodeDragStop"
      [onlyRenderVisibleElements]="false"
    >
      <ng-flow-controls />
      <ng-flow-background [variant]="BackgroundVariant.Lines" />

      <button type="button" (click)="addRandomNode()" [style]="buttonStyle">add node</button>
    </ng-flow>
  `,
})
export class EmptyPage {
  protected readonly BackgroundVariant = BackgroundVariant;
  protected readonly ns = useNodesState<Node>([]);
  protected readonly es = useEdgesState<Edge>([]);

  protected readonly onInit = onInit;
  protected readonly onNodeClick = onNodeClick;
  protected readonly onNodeDragStop = onNodeDragStop;

  protected readonly buttonStyle = 'position:absolute;left:10px;top:10px;z-index:4';

  protected readonly onConnect = (params: Connection | Edge): void =>
    this.es.setEdges((els) => addEdge(params, els));

  protected addRandomNode(): void {
    const nodeId = (this.ns.nodes().length + 1).toString();
    const newNode: Node = {
      id: nodeId,
      data: { label: `Node: ${nodeId}` },
      position: {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      },
    };
    this.ns.setNodes((nds) => nds.concat(newNode));
  }
}
