import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  addEdge,
  type Connection,
  ConnectionMode,
  Controls,
  type Edge,
  NgFlow,
  NgFlowProvider,
  type Node,
  type OnConnect,
  type ReactFlowInstance,
  useEdgesState,
  useNodesState,
} from 'ng-flow';

import { ProviderSidebar } from './sidebar';

const initialNodes: Node[] = [
  { id: '1', type: 'input', data: { label: 'Node 1' }, position: { x: 250, y: 5 } },
  { id: '2', data: { label: 'Node 2' }, position: { x: 100, y: 100 } },
  { id: '3', data: { label: 'Node 3' }, position: { x: 400, y: 100 } },
  { id: '4', data: { label: 'Node 4' }, position: { x: 400, y: 200 } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3' },
];

/**
 * React `Provider` example. The flow is wrapped in `<ng-flow-provider>` together with a sidebar
 * that lives OUTSIDE the flow but reads the flow's internal store live (positions + zoom/pan
 * transform) and can imperatively select all nodes. `ConnectionMode.Loose` lets connections start
 * from any handle. `useNodesState`/`useEdgesState` are plain signals, so they may be created here
 * on the page even though the store only exists under the provider.
 */
@Component({
  selector: 'app-provider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, NgFlowProvider, Controls, ProviderSidebar],
  host: { style: 'display:block;height:100%' },
  template: `
    <div class="providerflow">
      <ng-flow-provider>
        <app-provider-sidebar />
        <div class="wrapper">
          <ng-flow
            [nodes]="ns.nodes()"
            [edges]="es.edges()"
            [onNodesChange]="ns.onNodesChange"
            [onEdgesChange]="es.onEdgesChange"
            [onNodeClick]="onNodeClick"
            [onConnect]="onConnect"
            [onInit]="onInit"
            [connectionMode]="ConnectionMode.Loose"
          >
            <ng-flow-controls />
          </ng-flow>
        </div>
      </ng-flow-provider>
    </div>
  `,
  styles: [
    `
      .providerflow {
        flex-direction: column;
        display: flex;
        height: 100%;
      }

      .wrapper {
        flex-grow: 1;
        height: 100%;
      }

      @media screen and (min-width: 768px) {
        .providerflow {
          flex-direction: row;
        }

        app-provider-sidebar {
          width: 20%;
          max-width: 250px;
        }
      }
    `,
  ],
})
export class ProviderPage {
  protected readonly ConnectionMode = ConnectionMode;

  protected readonly ns = useNodesState(initialNodes);
  protected readonly es = useEdgesState(initialEdges);

  protected readonly onConnect: OnConnect = (params: Connection) =>
    this.es.setEdges((els) => addEdge(params, els));

  protected readonly onNodeClick = (_: MouseEvent, node: Node): void => console.log('click', node);
  protected readonly onInit = (instance: ReactFlowInstance): void => console.log('pane ready:', instance);
}
