import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  addEdge,
  Background,
  type Connection,
  type ConnectionLineComponent,
  type Edge,
  NgFlow,
  type Node,
  type ReactFlowInstance,
  useEdgesState,
  useNodesState,
} from 'ng-flow';

import { FloatingEdgesConnectionLine } from './floating-connection-line';
import { FloatingEdgesEdge } from './floating-edge';
import { createElements } from './utils';

const { nodes: initialNodes, edges: initialEdges } =
  typeof window !== 'undefined' ? createElements() : { nodes: [] as Node[], edges: [] as Edge[] };

@Component({
  selector: 'app-floating-edges',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background],
  host: { style: 'display:block;height:100%' },
  styles: [
    `
      :host {
        flex-direction: column;
        display: flex;
        height: 100%;
      }

      :host ::ng-deep .react-flow__handle {
        opacity: 0;
      }
    `,
  ],
  template: `
    <ng-flow
      [nodes]="ns.nodes()"
      [edges]="es.edges()"
      [onNodesChange]="ns.onNodesChange"
      [onEdgesChange]="es.onEdgesChange"
      [onConnect]="onConnect"
      [onInit]="onInit"
      [edgeTypes]="edgeTypes"
      [connectionLineComponent]="connectionLineComponent"
    >
      <ng-flow-background />
    </ng-flow>
  `,
})
export class FloatingEdgesPage {
  protected readonly edgeTypes = { floating: FloatingEdgesEdge };
  protected readonly connectionLineComponent = FloatingEdgesConnectionLine as unknown as ConnectionLineComponent;

  protected readonly ns = useNodesState(initialNodes);
  protected readonly es = useEdgesState(initialEdges);

  protected readonly onConnect = (connection: Connection): void => {
    this.es.setEdges((eds) => addEdge(connection, eds));
  };

  protected readonly onInit = (instance: ReactFlowInstance): void => {
    instance.fitView();
  };
}
