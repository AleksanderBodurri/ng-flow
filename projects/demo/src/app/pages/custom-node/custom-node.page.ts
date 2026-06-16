import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  type Connection,
  Controls,
  type Edge,
  type EdgeChange,
  MiniMap,
  NgFlow,
  type Node,
  type NodeChange,
  Position,
  type ReactFlowInstance,
  type SnapGrid,
} from 'ng-flow';

import { ColorSelectorNode } from './color-selector-node';

const initBgColor = '#1A192B';
const connectionLineStyle = { stroke: '#fff' };
const snapGrid: SnapGrid = [16, 16];

type MyNode = Node;
type MyEdge = Edge;

@Component({
  selector: 'app-custom-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background, Controls, MiniMap],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="nodes()"
      [edges]="edges()"
      [onNodesChange]="onNodesChange"
      [onEdgesChange]="onEdgesChange"
      [onNodeClick]="onNodeClick"
      [onConnect]="onConnect"
      [onNodeDragStop]="onNodeDragStop"
      [onInit]="onInit"
      [nodeTypes]="nodeTypes"
      [connectionLineStyle]="connectionLineStyle"
      [snapToGrid]="true"
      [snapGrid]="snapGrid"
      [fitView]="true"
      [minZoom]="0.3"
      [maxZoom]="2"
      [onBeforeDelete]="onBeforeDelete"
    >
      <ng-flow-minimap [nodeStrokeColor]="nodeStrokeColor" [nodeColor]="nodeColor" />
      <ng-flow-controls />
      <ng-flow-background [bgColor]="bgColor()" />
    </ng-flow>
  `,
})
export class CustomNodePage {
  protected readonly nodeTypes = { selectorNode: ColorSelectorNode };
  protected readonly connectionLineStyle = connectionLineStyle;
  protected readonly snapGrid = snapGrid;
  protected readonly Position = Position;

  protected readonly bgColor = signal<string>(initBgColor);
  protected readonly nodes = signal<MyNode[]>([]);
  protected readonly edges = signal<MyEdge[]>([]);

  constructor() {
    this.nodes.set([
      {
        id: '1',
        type: 'input',
        data: { label: 'An input node' },
        position: { x: 0, y: 50 },
        sourcePosition: Position.Right,
      },
      {
        id: '2',
        type: 'selectorNode',
        data: { onChange: this.onColorChange, color: initBgColor },
        style: { border: '1px solid #777', padding: 10 },
        position: { x: 250, y: 50 },
      },
      {
        id: '3',
        type: 'output',
        data: { label: 'Output A' },
        position: { x: 550, y: 25 },
        targetPosition: Position.Left,
      },
      {
        id: '4',
        type: 'output',
        data: { label: 'Output B' },
        position: { x: 550, y: 100 },
        targetPosition: Position.Left,
      },
    ]);

    this.edges.set([
      { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#fff' } },
      { id: 'e2a-3', source: '2', sourceHandle: 'a', target: '3', animated: true, style: { stroke: '#fff' } },
      { id: 'e2b-4', source: '2', sourceHandle: 'b', target: '4', animated: true, style: { stroke: '#fff' } },
    ]);
  }

  // Color-picker change handler injected into node 2's data; updates the node color + background.
  protected readonly onColorChange = (event: Event): void => {
    const color = (event.target as HTMLInputElement).value;
    this.bgColor.set(color);
    this.nodes.update((nds) =>
      nds.map((node) => {
        if (node.id !== '2' || node.type !== 'selectorNode') {
          return node;
        }
        return { ...node, data: { ...node.data, color } };
      })
    );
  };

  protected readonly onNodesChange = (changes: NodeChange<MyNode>[]): void => {
    this.nodes.update((nds) => applyNodeChanges(changes, nds));
  };

  protected readonly onEdgesChange = (changes: EdgeChange<MyEdge>[]): void => {
    this.edges.update((eds) => applyEdgeChanges(changes, eds));
  };

  protected readonly onConnect = (connection: Connection): void => {
    this.edges.update((eds) => addEdge({ ...connection, animated: true, style: { stroke: '#fff' } }, eds));
  };

  protected readonly onInit = (instance: ReactFlowInstance): void => {
    console.log('flow loaded:', instance);
  };

  protected readonly onNodeClick = (_: MouseEvent, node: MyNode): void => console.log('click', node);
  protected readonly onNodeDragStop = (_: MouseEvent | TouchEvent, node: MyNode): void =>
    console.log('drag stop', node);
  protected readonly onBeforeDelete = async (): Promise<boolean> => true;

  protected readonly nodeStrokeColor = (n: MyNode): string => {
    if (n.type === 'input') return '#0041d0';
    if (n.type === 'selectorNode') return this.bgColor();
    if (n.type === 'output') return '#ff0072';
    return '#eee';
  };

  protected readonly nodeColor = (n: MyNode): string => {
    if (n.type === 'selectorNode') return this.bgColor();
    return '#fff';
  };
}
