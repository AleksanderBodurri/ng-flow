import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  addEdge,
  Background,
  BackgroundVariant,
  type Connection,
  type ConnectionLineComponent,
  type Edge,
  NgFlow,
  type Node,
  useEdgesState,
  useNodesState,
} from 'ng-flow';

import { CustomConnectionLine } from './connection-line';

const initialNodes: Node[] = [{ id: '1', type: 'default', data: { label: 'Node 1' }, position: { x: 250, y: 5 } }];
const initialEdges: Edge[] = [];

/**
 * Mirrors React's `ConnectionLineFlow`. A single node; while dragging a new connection the
 * library renders our `CustomConnectionLine` (an animated bezier + an end circle drawn from
 * `fromX/fromY` to `toX/toY`). `connectionDragThreshold` is 25, so a drag must travel 25px
 * before a connection attempt starts. Background uses the Lines variant.
 */
@Component({
  selector: 'app-custom-connectionline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="ns.nodes()"
      [edges]="es.edges()"
      [onNodesChange]="ns.onNodesChange"
      [onEdgesChange]="es.onEdgesChange"
      [connectionLineComponent]="connectionLineComponent"
      [onConnect]="onConnect"
      [connectionDragThreshold]="25"
    >
      <ng-flow-background [variant]="BackgroundVariant.Lines" />
    </ng-flow>
  `,
})
export class CustomConnectionLinePage {
  protected readonly BackgroundVariant = BackgroundVariant;
  protected readonly connectionLineComponent = CustomConnectionLine as unknown as ConnectionLineComponent;

  protected readonly ns = useNodesState(initialNodes);
  protected readonly es = useEdgesState(initialEdges);

  protected readonly onConnect = (params: Connection | Edge): void => {
    this.es.setEdges((eds) => addEdge(params, eds));
  };
}
