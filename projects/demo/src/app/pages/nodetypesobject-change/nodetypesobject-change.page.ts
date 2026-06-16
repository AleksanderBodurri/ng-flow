import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
  addEdge,
  type Connection,
  type CSSProperties,
  type Edge,
  NgFlow,
  type Node,
  type NodeTypes,
  type OnConnect,
  Position,
  useEdgesState,
  useNodesState,
} from 'ng-flow';

import { NodeA } from './node-a';
import { NodeB } from './node-b';

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
    type: 'a',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: { label: 'A Node' },
    position: { x: 250, y: 0 },
  },
  {
    id: '3',
    type: 'b',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: { label: 'B Node' },
    position: { x: 350, y: 0 },
  },
];

const buttonStyle: CSSProperties = {
  position: 'absolute',
  right: '10px',
  top: '30px',
  zIndex: 4,
};

// React `nodeTypesObjects` — two distinct nodeTypes registries. The button swaps which
// whole object is bound to `[nodeTypes]`. Both are STABLE module-level objects.
const nodeTypesObjects: Record<string, NodeTypes> = {
  a: { a: NodeA },
  b: { b: NodeB },
};

/**
 * Mirrors React `NodeTypesObjectChange`. The "change type" button toggles `nodeTypesId`
 * between `'a'` and `'b'`, which swaps the ENTIRE `nodeTypes` object passed to the flow
 * (registry `{ a: NodeA }` ⇄ `{ b: NodeB }`). The nodes themselves never change; only one
 * of node 2 (`type:'a'`) / node 3 (`type:'b'`) has a matching custom renderer at a time.
 */
@Component({
  selector: 'app-nodetypesobject-change',
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
      [nodeTypes]="nodeTypes()"
      [fitView]="true"
    >
      <button type="button" (click)="changeType()" [style]="buttonStyle">change type</button>
    </ng-flow>
  `,
})
export class NodeTypesObjectChangePage {
  protected readonly buttonStyle = buttonStyle;

  private readonly nodeTypesId = signal<string>('a');
  protected readonly nodeTypes = computed<NodeTypes>(() => nodeTypesObjects[this.nodeTypesId()]);

  protected readonly ns = useNodesState(initialNodes);
  protected readonly es = useEdgesState<Edge>([]);

  protected readonly onConnect: OnConnect = (params: Connection | Edge) =>
    this.es.setEdges((eds) => addEdge(params, eds));

  protected changeType(): void {
    this.nodeTypesId.update((nt) => (nt === 'a' ? 'b' : 'a'));
  }
}
