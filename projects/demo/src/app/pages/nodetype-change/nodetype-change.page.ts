import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  addEdge,
  type Connection,
  type CSSProperties,
  type Edge,
  NgFlow,
  type Node,
  type OnConnect,
  Position,
  useEdgesState,
  useNodesState,
} from 'ng-flow';

const initialNodes: Node[] = [
  {
    id: '1',
    sourcePosition: Position.Right,
    type: 'input',
    data: { label: 'Input' },
    position: { x: 0, y: 80 },
  },
  {
    id: '2',
    type: 'output',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: { label: 'A Node' },
    position: { x: 250, y: 0 },
  },
];

const initialEdges: Edge[] = [{ id: 'e1-2', source: '1', type: 'smoothstep', target: '2', animated: true }];

const buttonStyle: CSSProperties = {
  position: 'absolute',
  right: '10px',
  top: '30px',
  zIndex: 4,
};

/**
 * Mirrors React `NodeTypeChange`. The "change type" button toggles the non-input
 * node's `type` between `'default'` and `'output'` (leaving the `'input'` node
 * untouched). Controlled via `useNodesState`/`useEdgesState`.
 */
@Component({
  selector: 'app-nodetype-change',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="ns.nodes()"
      [edges]="es.edges()"
      [onNodesChange]="ns.onNodesChange"
      [onEdgesChange]="es.onEdgesChange"
      [onConnect]="onConnect"
      [fitView]="true"
    >
      <button type="button" (click)="changeType()" [style]="buttonStyle">change type</button>
    </ng-flow>
  `,
})
export class NodeTypeChangePage {
  protected readonly buttonStyle = buttonStyle;

  protected readonly ns = useNodesState(initialNodes);
  protected readonly es = useEdgesState(initialEdges);

  protected readonly onConnect: OnConnect = (params: Connection | Edge) =>
    this.es.setEdges((eds) => addEdge(params, eds));

  protected changeType(): void {
    this.ns.setNodes((nds) =>
      nds.map((node) => {
        if (node.type === 'input') {
          return node;
        }

        return {
          ...node,
          type: node.type === 'default' ? 'output' : 'default',
        };
      })
    );
  }
}
