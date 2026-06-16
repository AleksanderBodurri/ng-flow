import { ChangeDetectionStrategy, Component, signal, ViewEncapsulation } from '@angular/core';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  NgFlow,
  type Node,
  type NodeChange,
  Panel,
  Position,
} from 'ng-flow';

const initialNodes: Node[] = [
  {
    id: '1',
    data: { label: 'Node 1' },
    position: { x: 100, y: 100 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: '2',
    data: { label: 'Node 2' },
    position: { x: 300, y: 100 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
];

const initialEdges: Edge[] = [];

/**
 * React `TouchDevice` example. Demonstrates click-to-connect on touch devices: tapping a handle
 * starts a connection (`onClickConnectStart`) and tapping a second handle finishes it
 * (`onClickConnectEnd`); the regular drag-to-connect lifecycle (`onConnectStart`/`onConnectEnd`)
 * is wired too. The custom `.touch-flow` CSS enlarges handles and bounces the one that is
 * mid-click-connection (the `clickconnecting` class ng-flow toggles on the active handle).
 *
 * React only logged these callbacks to the console; here they also feed an on-page status panel.
 */
@Component({
  selector: 'app-touch-device',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Unencapsulated so the `.touch-flow` overrides target the flow's internal handle elements.
  encapsulation: ViewEncapsulation.None,
  imports: [NgFlow, Panel],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="nodes()"
      [edges]="edges()"
      [onConnect]="onConnect"
      [onNodesChange]="onNodesChange"
      [onEdgesChange]="onEdgesChange"
      [onConnectStart]="onConnectStart"
      [onConnectEnd]="onConnectEnd"
      [onClickConnectStart]="onClickConnectStart"
      [onClickConnectEnd]="onClickConnectEnd"
      class="touch-flow"
    >
      <ng-flow-panel position="top-right">
        <div class="status-panel">
          <strong>last connect event</strong>
          <div>{{ lastEvent() }}</div>
        </div>
      </ng-flow-panel>
    </ng-flow>
  `,
  styles: [
    `
      .react-flow.touch-flow .react-flow__handle {
        width: 20px;
        height: 20px;
        border-radius: 3px;
        background-color: #9f7aea;
      }

      .touch-flow .react-flow__handle-right {
        --translate: translate(50%, -50%);
      }

      .touch-flow .react-flow__handle-left {
        --translate: translate(-50%, -50%);
      }

      @keyframes bounce {
        0% {
          transform: var(--translate) scale(1);
        }
        50% {
          transform: var(--translate) scale(1.1);
        }
      }

      .react-flow.touch-flow .react-flow__handle.clickconnecting {
        animation: bounce 1600ms infinite ease-in;
      }

      .status-panel {
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 6px 8px;
        font-size: 12px;
      }
    `,
  ],
})
export class TouchDevicePage {
  protected readonly nodes = signal<Node[]>(initialNodes);
  protected readonly edges = signal<Edge[]>(initialEdges);
  protected readonly lastEvent = signal<string>('none yet');

  protected readonly onNodesChange = (changes: NodeChange[]): void => {
    this.nodes.update((nds) => applyNodeChanges(changes, nds));
  };

  protected readonly onEdgesChange = (changes: EdgeChange[]): void => {
    this.edges.update((eds) => applyEdgeChanges(changes, eds));
  };

  protected readonly onConnect = (connection: Connection): void => {
    this.edges.update((eds) => addEdge(connection, eds));
  };

  protected readonly onConnectStart = (): void => {
    console.log('connect start');
    this.lastEvent.set('connect start');
  };
  protected readonly onConnectEnd = (): void => {
    console.log('connect end');
    this.lastEvent.set('connect end');
  };
  protected readonly onClickConnectStart = (): void => {
    console.log('click connect start');
    this.lastEvent.set('click connect start');
  };
  protected readonly onClickConnectEnd = (): void => {
    console.log('click connect end');
    this.lastEvent.set('click connect end');
  };
}
