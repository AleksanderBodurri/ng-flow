import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  addEdge,
  type Edge,
  NgFlow,
  NgFlowProvider,
  type Node,
  type OnConnect,
  type OnConnectEnd,
  type OnConnectStart,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'ng-flow';

const initialNodes: Node[] = [{ id: '0', type: 'input', data: { label: 'Node' }, position: { x: 0, y: 50 } }];
const initialEdges: Edge[] = [];

// Module-level incrementing id generator (React's `let id = 1; getId = () => ...`).
let id = 1;
const getId = (): string => `${id++}`;

/**
 * Inner component rendered UNDER `<ng-flow-provider>` so `useReactFlow()` (for
 * `screenToFlowPosition`) resolves the store. Mirrors React's `AddNodeOnEdgeDrop`.
 *
 * Dragging a connection from a handle and releasing it over the empty pane creates a brand-new
 * node at the drop point plus an edge from the originating node to it:
 *  - `onConnectStart` records the source node id.
 *  - `onConnect` (a real connection to a handle) clears that id so no node is created.
 *  - `onConnectEnd` checks the drop target is `.react-flow__pane`; if so it converts the pointer
 *    coords with `screenToFlowPosition` and appends the node (origin `[0.5, 0.0]` so it is
 *    centered horizontally on the cursor and grows downward) and the connecting edge.
 */
@Component({
  selector: 'app-add-node-edge-drop-inner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow],
  host: { style: 'display:block;height:100%' },
  template: `
    <div class="wrapper" style="height:100%">
      <ng-flow
        [nodes]="nodesState.nodes()"
        [edges]="edgesState.edges()"
        [onNodesChange]="nodesState.onNodesChange"
        [onEdgesChange]="edgesState.onEdgesChange"
        [onConnect]="onConnect"
        [onConnectStart]="onConnectStart"
        [onConnectEnd]="onConnectEnd"
        [fitView]="true"
      />
    </div>
  `,
})
export class AddNodeOnEdgeDropInner {
  protected readonly nodesState = useNodesState(initialNodes);
  protected readonly edgesState = useEdgesState(initialEdges);

  private readonly flow = useReactFlow();

  // React used a ref; a plain field is the Angular equivalent for this mutable scratch value.
  private connectingNodeId: string | null = null;

  protected readonly onConnect: OnConnect = (params) => {
    // reset the start node on connections
    this.connectingNodeId = null;
    this.edgesState.setEdges((eds) => addEdge(params, eds));
  };

  protected readonly onConnectStart: OnConnectStart = (_event, { nodeId }) => {
    this.connectingNodeId = nodeId;
  };

  protected readonly onConnectEnd: OnConnectEnd = (event) => {
    if (!this.connectingNodeId) return;

    const target = event.target as Partial<Element> | null;
    const targetIsPane = target?.classList?.contains('react-flow__pane');

    if (targetIsPane && 'clientX' in event && 'clientY' in event) {
      const newId = getId();
      const newNode: Node = {
        id: newId,
        position: this.flow.screenToFlowPosition({ x: event.clientX, y: event.clientY }),
        data: { label: `Node ${newId}` },
        origin: [0.5, 0.0],
      };

      const newEdge: Edge = {
        id: newId,
        source: this.connectingNodeId,
        target: newId,
      };

      this.nodesState.setNodes((nds) => nds.concat(newNode));
      this.edgesState.setEdges((eds) => eds.concat(newEdge));
    }
  };
}

@Component({
  selector: 'app-add-node-edge-drop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, AddNodeOnEdgeDropInner],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow-provider style="display:block;height:100%">
      <app-add-node-edge-drop-inner />
    </ng-flow-provider>
  `,
})
export class AddNodeOnEdgeDropPage {}
