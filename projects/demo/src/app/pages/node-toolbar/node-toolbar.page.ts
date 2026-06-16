import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  type Align,
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  MiniMap,
  NgFlow,
  type Node,
  type NodeOrigin,
  Position,
} from 'ng-flow';

import { NodeToolbarCustomNode } from './custom-node';
import { SelectedNodesToolbar } from './selected-nodes-toolbar';

const positions: Position[] = [Position.Top, Position.Right, Position.Bottom, Position.Left];
const alignments: Align[] = ['start', 'center', 'end'];

// Mirrors the React example: one "toolbar top" node plus a grid of every
// position × alignment combination.
const initialNodes: Node[] = [
  {
    id: '4',
    type: 'custom',
    data: { label: 'toolbar top', toolbarPosition: Position.Top },
    position: { x: 0, y: -200 },
    className: 'react-flow__node-default',
  },
];

positions.forEach((position, posIndex) => {
  alignments.forEach((align, alignIndex) => {
    const id = `node-${align}-${position}`;
    initialNodes.push({
      id,
      type: 'custom',
      data: {
        label: `toolbar ${position} ${align}`,
        toolbarPosition: position,
        toolbarAlign: align,
        toolbarVisible: true,
      },
      className: 'react-flow__node-default',
      position: { x: posIndex * 300, y: alignIndex * 100 },
    });
  });
});

const initialEdges: Edge[] = [];

const defaultEdgeOptions = { zIndex: 0 };
const nodeOrigin: NodeOrigin = [0.5, 0.5];

/**
 * Angular port of React Flow's `NodeToolbar` example. Renders `NodeToolbar` at every
 * `position` × `align` combination (via the custom node) plus a single multi-selection
 * toolbar (`SelectedNodesToolbar`, array `nodeId` form) and uses `nodeOrigin [0.5, 0.5]`.
 */
@Component({
  selector: 'app-node-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background, Controls, MiniMap, SelectedNodesToolbar],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [defaultNodes]="initialNodes"
      [defaultEdges]="initialEdges"
      class="react-flow-node-toolbar-example"
      [minZoom]="0.2"
      [maxZoom]="4"
      [fitView]="true"
      [defaultEdgeOptions]="defaultEdgeOptions"
      [nodeTypes]="nodeTypes"
      [nodeOrigin]="nodeOrigin"
    >
      <ng-flow-background [variant]="BackgroundVariant.Dots" />
      <ng-flow-minimap />
      <ng-flow-controls />
      <app-selected-nodes-toolbar />
    </ng-flow>
  `,
})
export class NodeToolbarPage {
  protected readonly BackgroundVariant = BackgroundVariant;
  protected readonly nodeTypes = { custom: NodeToolbarCustomNode };
  protected readonly initialNodes = initialNodes;
  protected readonly initialEdges = initialEdges;
  protected readonly defaultEdgeOptions = defaultEdgeOptions;
  protected readonly nodeOrigin = nodeOrigin;
}
