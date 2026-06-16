import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  addEdge,
  type Connection,
  type ConnectionLineComponent,
  type CSSProperties,
  type Edge,
  MarkerType,
  NgFlow,
  type Node,
  useEdgesState,
  useNodesState,
} from 'ng-flow';

import { EasyConnectConnectionLine } from './custom-connection-line';
import { EasyConnectEdge } from './floating-edge';
import { EasyConnectNode } from './custom-node';

const initialNodes: Node[] = [
  { id: '1', type: 'custom', position: { x: 0, y: 0 }, data: {} },
  { id: '2', type: 'custom', position: { x: 250, y: 320 }, data: {} },
  { id: '3', type: 'custom', position: { x: 40, y: 300 }, data: {} },
  { id: '4', type: 'custom', position: { x: 300, y: 0 }, data: {} },
];

const initialEdges: Edge[] = [];

const connectionLineStyle: CSSProperties = {
  strokeWidth: 3,
  stroke: 'black',
};

const defaultEdgeOptions = {
  style: { strokeWidth: 3, stroke: 'black' },
  type: 'floating',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: 'black',
  },
};

@Component({
  selector: 'app-easy-connect',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow],
  host: { style: 'display:block;height:100%' },
  styles: [
    `
      :host ::ng-deep .customNodeBody {
        width: 150px;
        height: 80px;
        border: 3px solid black;
        position: relative;
        overflow: hidden;
        border-radius: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
      }

      :host ::ng-deep .customNode:before {
        content: '';
        position: absolute;
        top: -10px;
        left: 50%;
        height: 20px;
        width: 40px;
        transform: translate(-50%, 0);
        background: #d6d5e6;
        z-index: 1000;
        line-height: 1;
        border-radius: 4px;
        color: #fff;
        font-size: 9px;
        border: 2px solid #222138;
      }

      :host ::ng-deep .react-flow__handle.customHandle {
        width: 100%;
        height: 100%;
        background: blue;
        position: absolute;
        top: 0;
        left: 0;
        border-radius: 0;
        transform: none;
        border: none;
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
      [fitView]="true"
      [nodeTypes]="nodeTypes"
      [edgeTypes]="edgeTypes"
      [defaultEdgeOptions]="defaultEdgeOptions"
      [connectionLineComponent]="connectionLineComponent"
      [connectionLineStyle]="connectionLineStyle"
    />
  `,
})
export class EasyConnectPage {
  protected readonly nodeTypes = { custom: EasyConnectNode };
  protected readonly edgeTypes = { floating: EasyConnectEdge };
  protected readonly connectionLineComponent = EasyConnectConnectionLine as unknown as ConnectionLineComponent;
  protected readonly defaultEdgeOptions = defaultEdgeOptions;
  protected readonly connectionLineStyle = connectionLineStyle;

  protected readonly ns = useNodesState(initialNodes);
  protected readonly es = useEdgesState(initialEdges);

  protected readonly onConnect = (params: Connection): void => {
    this.es.setEdges((eds) => addEdge(params, eds));
  };
}
