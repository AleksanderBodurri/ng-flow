import { ChangeDetectionStrategy, Component } from '@angular/core';
import { type Edge, NgFlow, type Node, useEdgesState, useNodesState } from 'ng-flow';

import { DragHandleNode } from './drag-handle-node';

const initialNodes: Node[] = [
  {
    id: '2',
    type: 'dragHandleNode',
    dragHandle: '.custom-drag-handle',
    style: { border: '1px solid #ddd', padding: '20px 40px' },
    position: { x: 200, y: 200 },
    data: {},
  },
];

const initialEdges: Edge[] = [];

@Component({
  selector: 'app-draghandle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="ns.nodes()"
      [onNodesChange]="ns.onNodesChange"
      [edges]="es.edges()"
      [nodeTypes]="nodeTypes"
      [onNodeClick]="onNodeClick"
      [nodeDragThreshold]="0"
    />
  `,
})
export class DraghandlePage {
  protected readonly nodeTypes = { dragHandleNode: DragHandleNode };

  protected readonly ns = useNodesState(initialNodes);
  protected readonly es = useEdgesState(initialEdges);

  protected readonly onNodeClick = (_: MouseEvent, node: Node): void => {
    console.log('click', node);
  };
}
