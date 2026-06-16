import { ChangeDetectionStrategy, Component, effect, signal } from '@angular/core';
import {
  addEdge,
  applyNodeChanges,
  Background,
  Controls,
  type Edge,
  NgFlow,
  NgFlowProvider,
  type Node,
  type NodeChange,
  type OnConnect,
  Position,
  useConnection,
  useEdgesState,
  useReactFlow,
  useUpdateNodeInternals,
} from 'ng-flow';

import { MovingHandleNode } from './moving-handle-node';

// One built-in input node feeding ten custom `movingHandle` nodes stacked vertically.
const initNodes: Node[] = [
  {
    id: 'input',
    type: 'input',
    data: { label: 'input' },
    position: { x: -300, y: 0 },
    sourcePosition: Position.Right,
  },
];
for (let i = 0; i < 10; i++) {
  initNodes.push({
    id: `${i}`,
    type: 'movingHandle',
    position: { x: 0, y: i * 60 },
    data: {},
  });
}

const initEdges: Edge[] = [];

/**
 * Inner component rendered UNDER `<ng-flow-provider>`. Mirrors React's `CustomNodeFlow` plus the
 * inline `NodeUpdater` effect. Nodes are held in a local signal (React `useState` + manual
 * `applyNodeChanges`); edges use `useEdgesState`. New connections are `animated: true`.
 *
 * The `NodeUpdater` effect re-runs whenever `connection.inProgress` flips: it starts a
 * `requestAnimationFrame` loop that calls `updateNodeInternals(nodeIds)` for ~500ms so the
 * handles whose CSS `transform` is transitioning get continuously re-measured (otherwise the
 * edges would not follow the moving handles smoothly).
 */
@Component({
  selector: 'app-moving-handles-inner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Controls, Background],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="nodes()"
      [edges]="edgesState.edges()"
      [onNodesChange]="onNodesChange"
      [onEdgesChange]="edgesState.onEdgesChange"
      [onConnect]="onConnect"
      [nodeTypes]="nodeTypes"
      [minZoom]="0.2"
      [fitView]="true"
    >
      <ng-flow-controls />
      <ng-flow-background />
    </ng-flow>
  `,
})
export class MovingHandlesInner {
  // Stable node-type registry (React's module-level `nodeTypes`).
  protected readonly nodeTypes = { movingHandle: MovingHandleNode };

  protected readonly nodes = signal<Node[]>(initNodes);
  protected readonly edgesState = useEdgesState(initEdges);

  private readonly flow = useReactFlow();
  private readonly connection = useConnection();
  private readonly updateNodeInternals = useUpdateNodeInternals();

  protected readonly onNodesChange = (changes: NodeChange[]): void => {
    this.nodes.update((nds) => applyNodeChanges(changes, nds));
  };

  protected readonly onConnect: OnConnect = (connection) =>
    this.edgesState.setEdges((eds) => addEdge({ ...connection, animated: true }, eds));

  constructor() {
    // Mirrors React's `useEffect(() => { ...rAF loop... }, [connection.inProgress])`.
    effect((onCleanup) => {
      // Track `inProgress` so the effect re-runs each time it flips.
      this.connection().inProgress;

      const startTime = Date.now();
      const nodeIds = this.flow.getNodes().map((n) => n.id);
      let rafId = 0;

      const update = (): void => {
        if (Date.now() - startTime < 500) {
          this.updateNodeInternals(nodeIds);
          rafId = requestAnimationFrame(update);
        }
      };
      update();

      onCleanup(() => cancelAnimationFrame(rafId));
    });
  }
}

@Component({
  selector: 'app-moving-handles',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, MovingHandlesInner],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow-provider style="display:block;height:100%">
      <app-moving-handles-inner />
    </ng-flow-provider>
  `,
})
export class MovingHandlesPage {}
