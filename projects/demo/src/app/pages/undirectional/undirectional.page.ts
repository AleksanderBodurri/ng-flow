import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  addEdge,
  type Connection,
  ConnectionLineType,
  ConnectionMode,
  type Edge,
  NgFlow,
  type Node,
  type ReactFlowInstance,
  reconnectEdge,
  useEdgesState,
  useNodesState,
} from 'ng-flow';

import { UndirectionalNode } from './custom-node';

const initialNodes: Node[] = [
  { id: '00', type: 'custom', position: { x: 300, y: 250 }, data: {} },
  { id: '01', type: 'custom', position: { x: 100, y: 50 }, data: {} },
  { id: '02', type: 'custom', position: { x: 500, y: 50 }, data: {} },
  { id: '03', type: 'custom', position: { x: 500, y: 500 }, data: {} },
  { id: '04', type: 'custom', position: { x: 100, y: 500 }, data: {} },
  { id: '10', type: 'custom', position: { x: 300, y: 5 }, data: {} },
  { id: '20', type: 'custom', position: { x: 600, y: 250 }, data: {} },
  { id: '30', type: 'custom', position: { x: 300, y: 600 }, data: {} },
  { id: '40', type: 'custom', position: { x: 5, y: 250 }, data: {} },
];

const initialEdges: Edge[] = [
  { id: 'e0-1a', source: '00', target: '01', sourceHandle: 'left', targetHandle: 'bottom', type: 'smoothstep' },
  { id: 'e0-1b', source: '00', target: '01', sourceHandle: 'top', targetHandle: 'right', type: 'smoothstep' },
  { id: 'e0-2a', source: '00', target: '02', sourceHandle: 'top', targetHandle: 'left', type: 'smoothstep' },
  { id: 'e0-2b', source: '00', target: '02', sourceHandle: 'right', targetHandle: 'bottom', type: 'smoothstep' },
  { id: 'e0-3a', source: '00', target: '03', sourceHandle: 'right', targetHandle: 'top', type: 'smoothstep' },
  { id: 'e0-3b', source: '00', target: '03', sourceHandle: 'bottom', targetHandle: 'left', type: 'smoothstep' },
  { id: 'e0-4a', source: '00', target: '04', sourceHandle: 'bottom', targetHandle: 'right', type: 'smoothstep' },
  { id: 'e0-4b', source: '00', target: '04', sourceHandle: 'left', targetHandle: 'top', type: 'smoothstep' },
  { id: 'e0-10', source: '00', target: '10', sourceHandle: 'top', targetHandle: 'bottom', type: 'smoothstep' },
  { id: 'e0-20', source: '00', target: '20', sourceHandle: 'right', targetHandle: 'left', type: 'smoothstep' },
  { id: 'e0-30', source: '00', target: '30', sourceHandle: 'bottom', targetHandle: 'top', type: 'smoothstep' },
  { id: 'e0-40', source: '00', target: '40', sourceHandle: 'left', targetHandle: 'right', type: 'smoothstep' },
];

let id = 4;
const getId = (): string => `${id++}`;

@Component({
  selector: 'app-undirectional',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="ns.nodes()"
      [edges]="es.edges()"
      [onNodesChange]="ns.onNodesChange"
      [onEdgesChange]="es.onEdgesChange"
      [nodeTypes]="nodeTypes"
      [onConnect]="onConnect"
      [onPaneClick]="onPaneClick"
      [connectionLineType]="ConnectionLineType.Bezier"
      [connectionMode]="ConnectionMode.Loose"
      [onReconnect]="onReconnect"
      [onInit]="onInit"
    />
  `,
})
export class UndirectionalPage {
  protected readonly ConnectionLineType = ConnectionLineType;
  protected readonly ConnectionMode = ConnectionMode;
  protected readonly nodeTypes = { custom: UndirectionalNode };

  protected readonly ns = useNodesState(initialNodes);
  protected readonly es = useEdgesState(initialEdges);

  private instance?: ReactFlowInstance;

  protected readonly onInit = (instance: ReactFlowInstance): void => {
    this.instance = instance;
  };

  protected readonly onConnect = (params: Connection): void => {
    this.es.setEdges((els) => addEdge(params, els));
  };

  protected readonly onReconnect = (oldEdge: Edge, newConnection: Connection): void => {
    this.es.setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
  };

  protected readonly onPaneClick = (event: MouseEvent): void => {
    const position = this.instance?.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    if (!position) {
      return;
    }
    this.ns.setNodes((nds) =>
      nds.concat({
        id: getId(),
        position,
        type: 'custom',
        data: {},
      })
    );
  };
}
