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
  type ReactFlowInstance,
} from 'ng-flow';

import { getElements } from './utils';

const { nodes: initialNodes, edges: initialEdges } = getElements();

const multiSelectionKeyCode = ['ShiftLeft', 'ShiftRight'];
const deleteKeyCode = ['AltLeft+KeyD', 'Backspace'];

@Component({
  selector: 'app-edge-types',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background, Controls, MiniMap],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="nodes()"
      [edges]="edges()"
      [onNodesChange]="onNodesChange"
      [onEdgesChange]="onEdgesChange"
      [onInit]="onInit"
      [onConnect]="onConnect"
      [minZoom]="0.2"
      [selectionKeyCode]="'a+s'"
      [multiSelectionKeyCode]="multiSelectionKeyCode"
      [deleteKeyCode]="deleteKeyCode"
      [zoomActivationKeyCode]="'z'"
    >
      <ng-flow-minimap />
      <ng-flow-controls />
      <ng-flow-background />
    </ng-flow>
  `,
})
export class EdgeTypesPage {
  protected readonly multiSelectionKeyCode = multiSelectionKeyCode;
  protected readonly deleteKeyCode = deleteKeyCode;

  protected readonly nodes = signal<Node[]>(initialNodes);
  protected readonly edges = signal<Edge[]>(initialEdges);

  protected readonly onNodesChange = (changes: NodeChange[]): void => {
    this.nodes.update((nds) => applyNodeChanges(changes, nds));
  };

  protected readonly onEdgesChange = (changes: EdgeChange[]): void => {
    this.edges.update((eds) => applyEdgeChanges(changes, eds));
  };

  protected readonly onConnect = (params: Connection): void => {
    this.edges.update((eds) => addEdge(params, eds));
  };

  protected readonly onInit = (reactFlowInstance: ReactFlowInstance): void => {
    reactFlowInstance.fitView();
    console.log(reactFlowInstance.getNodes());
  };
}
