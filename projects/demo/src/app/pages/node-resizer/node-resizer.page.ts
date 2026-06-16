import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  Controls,
  type CoordinateExtent,
  type Edge,
  type EdgeChange,
  NgFlow,
  type Node,
  type NodeChange,
  Panel,
} from 'ng-flow';

import { NodeResizerBottomRight } from './bottom-right-resizer';
import { NodeResizerCustom } from './custom-resizer';
import { NodeResizerDefault } from './default-resizer';
import { NodeResizerFixedExtent } from './fixed-extent-node';
import { NodeResizerHorizontal } from './horizontal-resizer';
import { NodeResizerVertical } from './vertical-resizer';

const nodeStyle = {
  border: '1px solid #222',
  fontSize: 10,
  backgroundColor: '#ddd',
};

const extent: CoordinateExtent = [
  [500, 350],
  [700, 450],
];

const initialEdges: Edge[] = [];

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'defaultResizer',
    data: { label: 'default resizer' },
    position: { x: 0, y: 0 },
    origin: [1, 1],
    style: { ...nodeStyle },
  },
  {
    id: '1a',
    type: 'defaultResizer',
    data: {
      label: 'default resizer with min and max dimensions',
      minWidth: 100,
      minHeight: 80,
      maxWidth: 200,
      maxHeight: 200,
    },
    position: { x: 0, y: 60 },
    width: 100,
    height: 80,
    style: { ...nodeStyle },
  },
  {
    id: '1b',
    type: 'defaultResizer',
    data: {
      label: 'default resizer with initial size and aspect ratio',
      keepAspectRatio: true,
      minWidth: 100,
      minHeight: 60,
      maxWidth: 400,
      maxHeight: 400,
    },
    position: { x: 250, y: 0 },
    width: 174,
    height: 123,
    style: { ...nodeStyle },
  },
  {
    id: '2',
    type: 'customResizer',
    data: { label: 'custom resize icon' },
    position: { x: 0, y: 200 },
    width: 100,
    height: 60,
    style: { ...nodeStyle },
  },
  {
    id: '3',
    type: 'verticalResizer',
    data: { label: 'vertical resizer' },
    position: { x: 250, y: 200 },
    style: { ...nodeStyle },
  },
  {
    id: '3a',
    type: 'verticalResizer',
    data: {
      label: 'vertical resizer with min/maxHeight and aspect ratio',
      minHeight: 50,
      maxHeight: 200,
      keepAspectRatio: true,
    },
    position: { x: 400, y: 200 },
    height: 50,
    style: { ...nodeStyle },
  },
  {
    id: '4',
    type: 'horizontalResizer',
    data: {
      label: 'horizontal resizer with aspect ratio',
      keepAspectRatio: true,
      minHeight: 20,
      maxHeight: 80,
      maxWidth: 300,
    },
    position: { x: 250, y: 300 },
    style: { ...nodeStyle },
  },
  {
    id: '4a',
    type: 'horizontalResizer',
    data: { label: 'horizontal resizer with maxWidth', maxWidth: 300 },
    position: { x: 250, y: 400 },
    style: { ...nodeStyle },
  },
  {
    id: '5',
    type: 'defaultResizer',
    data: { label: 'Parent', keepAspectRatio: true },
    position: { x: 700, y: 0 },
    width: 300,
    height: 300,
    style: { ...nodeStyle },
  },
  {
    id: '5a',
    type: 'defaultResizer',
    data: { label: 'Child with extent: parent' },
    position: { x: 50, y: 50 },
    parentId: '5',
    extent: 'parent',
    width: 50,
    height: 100,
    style: { ...nodeStyle },
  },
  {
    id: '5b',
    type: 'defaultResizer',
    data: { label: 'Child with expandParent' },
    position: { x: 100, y: 100 },
    width: 100,
    height: 100,
    parentId: '5',
    expandParent: true,
    style: { ...nodeStyle },
  },
  {
    id: '5c',
    type: 'defaultResizer',
    data: { label: 'Child with expandParent & keepAspectRatio', keepAspectRatio: true },
    position: { x: 250, y: 200 },
    height: 100,
    width: 100,
    parentId: '5',
    expandParent: true,
    style: { ...nodeStyle },
  },
  {
    id: '6',
    type: 'bottomRightResizer',
    data: { label: 'Bottom Right with horizontal direction' },
    position: { x: 500, y: 500 },
    style: { ...nodeStyle },
  },
  {
    id: '7',
    type: 'fixedExtent',
    data: { label: 'Fixed Extent', extent },
    position: { x: 500, y: 350 },
    extent,
  },
];

/**
 * Angular port of React Flow's `NodeResizer` example. Demonstrates every resizer variant:
 * default `NodeResizer` (with/without min/max/aspect-ratio), a custom-icon
 * `NodeResizeControl`, horizontal/vertical line controls, a fixed-extent handle control,
 * `extent: 'parent'`, `expandParent`, plus `keepAspectRatio` via holding the `k` key and a
 * `snapToGrid` toggle.
 */
@Component({
  selector: 'app-node-resizer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Controls, Panel],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="nodes()"
      [edges]="edges()"
      [onNodesChange]="onNodesChange"
      [onEdgesChange]="onEdgesChange"
      [onConnect]="onConnect"
      [nodeTypes]="nodeTypes"
      [minZoom]="0.2"
      [maxZoom]="5"
      [snapToGrid]="snapToGrid()"
      [fitView]="true"
      [onlyRenderVisibleElements]="true"
    >
      <ng-flow-controls />
      <ng-flow-panel position="bottom-right">
        <button (click)="toggleSnapToGrid()">snapToGrid: {{ snapToGrid() ? 'on' : 'off' }}</button>
      </ng-flow-panel>
    </ng-flow>
  `,
})
export class NodeResizerPage {
  protected readonly nodeTypes = {
    defaultResizer: NodeResizerDefault,
    customResizer: NodeResizerCustom,
    verticalResizer: NodeResizerVertical,
    horizontalResizer: NodeResizerHorizontal,
    bottomRightResizer: NodeResizerBottomRight,
    fixedExtent: NodeResizerFixedExtent,
  };

  protected readonly snapToGrid = signal(false);
  protected readonly nodes = signal<Node[]>(initialNodes);
  protected readonly edges = signal<Edge[]>(initialEdges);

  protected readonly onNodesChange = (changes: NodeChange[]): void => {
    this.nodes.update((nds) => applyNodeChanges(changes, nds));
  };

  protected readonly onEdgesChange = (changes: EdgeChange[]): void => {
    this.edges.update((eds) => applyEdgeChanges(changes, eds));
  };

  protected readonly onConnect = (connection: Connection): void => {
    this.edges.update((eds) => addEdge({ ...connection }, eds));
  };

  protected toggleSnapToGrid(): void {
    this.snapToGrid.update((s) => !s);
  }
}
