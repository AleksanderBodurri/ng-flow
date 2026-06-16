import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  addEdge,
  type Connection,
  type Edge,
  NgFlow,
  NgFlowProvider,
  type Node,
  useEdgesState,
  useNodesState,
} from 'ng-flow';

const nodesA: Node[] = [
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

const edgesA: Edge[] = [
  { id: 'e1-2', source: '1a', target: '2a', ariaLabel: undefined },
  { id: 'e1-3', source: '1a', target: '3a' },
];

const nodesB: Node[] = [
  {
    id: 'inputb',
    type: 'input',
    data: { label: 'Input' },
    position: { x: 300, y: 5 },
    className: 'light',
    ariaLabel: 'Input Node',
  },
  {
    id: '1b',
    data: { label: 'Node 1' },
    position: { x: 0, y: 100 },
    className: 'light',
    ariaLabel: 'Node with id 1',
  },
  {
    id: '2b',
    data: { label: 'Node 2' },
    position: { x: 200, y: 100 },
    className: 'light',
    ariaLabel: 'Node with id 2',
  },
  {
    id: '3b',
    data: { label: 'Node 3' },
    position: { x: 400, y: 100 },
    className: 'light',
  },
  {
    id: '4b',
    data: { label: 'Node 4' },
    position: { x: 600, y: 100 },
    className: 'light',
  },
];

const edgesB: Edge[] = [
  { id: 'e1b', source: 'inputb', target: '1b', ariaLabel: 'edge to connect' },
  { id: 'e2b', source: 'inputb', target: '2b' },
  { id: 'e3b', source: 'inputb', target: '3b' },
  { id: 'e4b', source: 'inputb', target: '4b' },
];

const onNodeDragStart = (_: MouseEvent | TouchEvent, node: Node) => console.log('drag start', node);
const onNodeDrag = (_: MouseEvent | TouchEvent, node: Node) => console.log('drag', node.position);
const onNodeDragStop = (_: MouseEvent | TouchEvent, node: Node) => console.log('drag stop', node);
const onNodeClick = (_: MouseEvent, node: Node) => console.log('click', node);

@Component({
  selector: 'app-switch-flow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="nodesState.nodes()"
      [edges]="edgesState.edges()"
      [onNodesChange]="nodesState.onNodesChange"
      [onEdgesChange]="edgesState.onEdgesChange"
      [onNodeClick]="onNodeClick"
      [onConnect]="onConnect"
      [onNodeDragStart]="onNodeDragStart"
      [onNodeDrag]="onNodeDrag"
      [onNodeDragStop]="onNodeDragStop"
      [nodeDragThreshold]="10"
    >
      <div style="position: absolute; right: 10px; top: 10px; z-index: 4;">
        <button type="button" (click)="showFlowA()" style="margin-right: 5px;">flow a</button>
        <button type="button" (click)="showFlowB()">flow b</button>
      </div>
    </ng-flow>
  `,
})
export class SwitchFlow {
  protected readonly nodesState = useNodesState(nodesA);
  protected readonly edgesState = useEdgesState(edgesA);

  protected readonly onNodeClick = onNodeClick;
  protected readonly onNodeDragStart = onNodeDragStart;
  protected readonly onNodeDrag = onNodeDrag;
  protected readonly onNodeDragStop = onNodeDragStop;

  protected readonly onConnect = (params: Connection | Edge): void => {
    this.edgesState.setEdges((eds) => addEdge(params, eds));
  };

  protected showFlowA(): void {
    this.nodesState.setNodes(nodesA);
    this.edgesState.setEdges(edgesA);
  }

  protected showFlowB(): void {
    this.nodesState.setNodes(nodesB);
    this.edgesState.setEdges(edgesB);
  }
}

@Component({
  selector: 'app-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, SwitchFlow],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow-provider style="display:block;height:100%">
      <app-switch-flow />
    </ng-flow-provider>
  `,
})
export class SwitchPage {}
