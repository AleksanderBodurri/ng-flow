import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  addEdge,
  type Connection,
  Controls,
  type Edge,
  NgFlow,
  NgFlowProvider,
  type Node,
  type NodeOrigin,
  type OnConnect,
  type ReactFlowInstance,
  useEdgesState,
  useNodesState,
} from 'ng-flow';

import { DragNDropSidebar } from './sidebar';

const initialNodes: Node[] = [
  { id: '1', type: 'input', data: { label: 'input node' }, position: { x: 250, y: 5 } },
];

let id = 0;
const getId = () => `dndnode_${id++}`;

const nodeOrigin: NodeOrigin = [0.5, 0.5];

/**
 * Inner flow component (React `DnDFlow`'s `<ReactFlow>`). Lives under `<ng-flow-provider>`
 * so `screenToFlowPosition` (captured from `[onInit]`) is wired to the same store as the
 * sidebar. Mirrors the HTML5 drag-and-drop example: dragging a palette item onto the pane
 * creates a node of that type at the drop position. `nodeOrigin` is `[0.5, 0.5]` so dropped
 * nodes are centered on the cursor.
 *
 * `onDrop`/`onDragOver` are native DOM events bound on the `<ng-flow>` host (React Flow
 * forwards these as props; ng-flow does not, so we attach them directly).
 */
@Component({
  selector: 'app-dragndrop-flow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Controls, DragNDropSidebar],
  host: { class: 'dndflow' },
  template: `
    <div class="wrapper">
      <ng-flow
        [nodes]="nodesState.nodes()"
        [edges]="edgesState.edges()"
        [onEdgesChange]="edgesState.onEdgesChange"
        [onNodesChange]="nodesState.onNodesChange"
        [onConnect]="onConnect"
        [onInit]="onInit"
        [nodeOrigin]="nodeOrigin"
        (drop)="onDrop($event)"
        (dragover)="onDragOver($event)"
      >
        <ng-flow-controls />
      </ng-flow>
    </div>
    <app-dragndrop-sidebar />
  `,
  styles: [
    `
      :host.dndflow {
        flex-direction: column;
        display: flex;
        height: 100%;
      }

      .wrapper {
        flex-grow: 1;
        height: 100%;
      }

      @media screen and (min-width: 768px) {
        :host.dndflow {
          flex-direction: row;
        }
      }
    `,
  ],
})
export class DragNDropFlow {
  protected readonly nodeOrigin = nodeOrigin;

  protected readonly nodesState = useNodesState(initialNodes);
  protected readonly edgesState = useEdgesState<Edge>([]);

  private instance?: ReactFlowInstance;

  protected readonly onConnect: OnConnect = (params: Connection) =>
    this.edgesState.setEdges((eds) => addEdge(params, eds));

  protected readonly onInit = (rfi: ReactFlowInstance): void => {
    this.instance = rfi;
  };

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();

    if (this.instance) {
      const type = event.dataTransfer?.getData('application/reactflow') ?? '';
      const position = this.instance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };

      this.nodesState.setNodes((nds) => nds.concat(newNode));
    }
  }
}

@Component({
  selector: 'app-dragndrop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, DragNDropFlow],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow-provider style="display:block;height:100%">
      <app-dragndrop-flow />
    </ng-flow-provider>
  `,
})
export class DragNDropPage {}
