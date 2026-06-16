import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Background, BackgroundVariant, Controls, type Edge, MiniMap, NgFlow, type Node, Position } from 'ng-flow';

import { EdgeToolbarCustomEdge } from './custom-edge';

const initialNodes: Node[] = [
  {
    id: '1',
    data: { label: 'Node 1', toolbarPosition: Position.Top },
    position: { x: 0, y: 0 },
    className: 'react-flow__node-default',
  },
  {
    id: '2',
    data: { label: 'Node 2', toolbarPosition: Position.Top },
    position: { x: 100, y: 150 },
    className: 'react-flow__node-default',
  },
  {
    id: '3',
    data: { label: 'Node 3', toolbarPosition: Position.Top },
    position: { x: 200, y: 0 },
    className: 'react-flow__node-default',
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'custom', data: { type: 'smoothstep', align: ['left', 'bottom'] } },
  { id: 'e3-2', source: '3', target: '2', type: 'custom', data: { type: 'bezier', align: ['right', 'bottom'] } },
  { id: 'e1-3', source: '1', target: '3', type: 'custom', data: { type: 'straight', align: ['center', 'center'] } },
];

/**
 * Angular port of React Flow's `EdgeToolbar` example. Each edge is a custom edge that
 * renders an `EdgeToolbar` at its center, switching its path function by `data.type` and
 * aligning the toolbar per-edge via `data.align`.
 */
@Component({
  selector: 'app-edge-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background, Controls, MiniMap],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [defaultNodes]="initialNodes"
      [defaultEdges]="initialEdges"
      class="react-flow-edge-toolbar-example"
      [minZoom]="0.2"
      [maxZoom]="4"
      [fitView]="true"
      [edgeTypes]="edgeTypes"
    >
      <ng-flow-background [variant]="BackgroundVariant.Dots" />
      <ng-flow-minimap />
      <ng-flow-controls />
    </ng-flow>
  `,
})
export class EdgeToolbarPage {
  protected readonly BackgroundVariant = BackgroundVariant;
  protected readonly edgeTypes = { custom: EdgeToolbarCustomEdge };
  protected readonly initialNodes = initialNodes;
  protected readonly initialEdges = initialEdges;
}
