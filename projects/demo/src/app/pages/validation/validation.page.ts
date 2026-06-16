import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  addEdge,
  type Connection,
  type Edge,
  Handle,
  type IsValidConnection,
  type Node,
  type OnBeforeDelete,
  type OnConnect,
  type OnConnectEnd,
  type OnConnectStart,
  NgFlow,
  Position,
  reconnectEdge,
  useEdgesState,
  useNodeId,
  useNodesState,
} from 'ng-flow';

import { ValidationConnectionStatus } from './connection-status';

@Component({
  selector: 'app-validation-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Handle],
  template: `
    <div>Only connectable with B</div>
    <ng-flow-handle type="source" [position]="Position.Right" />
  `,
})
export class ValidationInputNode {
  protected readonly Position = Position;
}

@Component({
  selector: 'app-validation-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Handle],
  template: `
    <ng-flow-handle type="target" [position]="Position.Top" [isConnectableStart]="false" />
    <div>{{ id() ?? nodeId }}</div>
    <ng-flow-handle type="source" [position]="Position.Right" />
  `,
})
export class ValidationNode {
  readonly id = input<string>();
  protected readonly Position = Position;
  protected readonly nodeId = useNodeId();
}

const initialNodes: Node[] = [
  { id: '0', type: 'custominput', position: { x: 0, y: 150 }, data: {} },
  { id: 'A', type: 'customnode', position: { x: 250, y: 0 }, data: {} },
  { id: 'B', type: 'customnode', position: { x: 250, y: 150 }, data: {} },
  { id: 'C', type: 'customnode', position: { x: 250, y: 300 }, data: {} },
];

const isValidConnection: IsValidConnection = (connection) => connection.target === 'B';

@Component({
  selector: 'app-validation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, ValidationConnectionStatus],
  host: { style: 'display:block;height:100%' },
  styles: [
    `
      :host ::ng-deep .react-flow__node {
        width: 150px;
        border-radius: 5px;
        padding: 10px;
        color: #555;
        border: 1px solid #ddd;
        text-align: center;
        font-size: 12px;
      }

      :host ::ng-deep .react-flow__node-customnode {
        background: #e6e6e9;
        border: 1px solid #ddd;
      }

      :host ::ng-deep .react-flow__node-custominput .react-flow__handle {
        background: #e6e6e9;
      }

      :host ::ng-deep .react-flow__node-custominput {
        background: #fff;
      }

      :host ::ng-deep .connectingto {
        background: #ff6060;
      }

      :host ::ng-deep .react-flow__node-custominput .connectingfrom {
        background: #55dd99;
      }

      :host ::ng-deep .valid {
        background: #55dd99;
      }

      :host ::ng-deep .valid .react-flow__connection-path {
        stroke: #55dd99;
      }

      :host ::ng-deep .invalid .react-flow__connection-path {
        stroke: #ff6060;
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
      [selectNodesOnDrag]="false"
      [nodeTypes]="nodeTypes"
      [onConnectStart]="onConnectStart"
      [onConnectEnd]="onConnectEnd"
      [onReconnect]="onReconnect"
      [isValidConnection]="isValidConnection"
      [onBeforeDelete]="onBeforeDelete"
      [fitView]="true"
    >
      <app-validation-connection-status />
    </ng-flow>
  `,
})
export class ValidationPage {
  protected readonly nodeTypes = {
    custominput: ValidationInputNode,
    customnode: ValidationNode,
  };
  protected readonly isValidConnection = isValidConnection;

  private value = 0;
  protected readonly ns = useNodesState(initialNodes);
  protected readonly es = useEdgesState<Edge>([]);

  protected readonly onConnectStart: OnConnectStart = (event, params) => {
    console.log('on connect start', params, event, this.value);
    this.value = 1;
  };

  protected readonly onConnect: OnConnect = (params) => {
    console.log('on connect', params);
    this.es.setEdges((eds) => addEdge(params, eds));
  };

  protected readonly onConnectEnd: OnConnectEnd = (event) => {
    console.log('on connect end', event, this.value);
    this.value = 0;
  };

  protected readonly onReconnect = (oldEdge: Edge, newConnection: Connection): void => {
    this.es.setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
  };

  protected readonly onBeforeDelete: OnBeforeDelete = async () => true;
}
