import { ChangeDetectionStrategy, Component, computed, effect } from '@angular/core';
import { Handle, type Node, Position, useNodeConnections, useNodeId, useNodes, useReactFlow } from 'ng-flow';

/**
 * Mirrors React's UppercaseNode.tsx: it reads its single incoming (target) connection via
 * `useNodeConnections`, looks up that source node's data, and writes the uppercased text into
 * its own node data through `updateNodeData` in an effect. The target handle is only connectable
 * while it has no connection (`connections.length === 0`).
 *
 * NOTE ON `useNodesData`: React calls `useNodesData(connections[0]?.source)` and re-runs on every
 * render so the *id* it watches is dynamic. ng-flow's `useNodesData(id)` binds a static id at
 * call time (the connection lookup is empty at construction), so we get the same reactive result
 * with `useNodes()` (a reactive Signal of all nodes) combined with the live `connections()` signal
 * in a `computed` — tracking both a changing source id and that source's `data.text`.
 */
@Component({
  selector: 'app-uppercase-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Handle],
  template: `
    <div class="data-node">
      <ng-flow-handle type="target" [position]="Position.Left" [isConnectable]="isConnectable()" />
      <div>uppercase transform</div>
      <ng-flow-handle type="source" [position]="Position.Right" />
    </div>
  `,
  styles: [
    `
      .data-node {
        background: #eee;
        color: #222;
        padding: 10px;
        font-size: 12px;
        border-radius: 10px;
      }
    `,
  ],
})
export class UppercaseNode {
  protected readonly Position = Position;

  private readonly nodeId = useNodeId();
  private readonly flow = useReactFlow();

  // React: useNodeConnections({ handleType: 'target' }).
  protected readonly connections = useNodeConnections({ handleType: 'target' });
  protected readonly isConnectable = computed(() => this.connections().length === 0);

  private readonly nodes = useNodes();

  // Reactive equivalent of React's `useNodesData(connections[0]?.source)`.
  private readonly sourceNode = computed<Node | undefined>(() => {
    const sourceId = this.connections()[0]?.source;
    return sourceId ? this.nodes().find((n) => n.id === sourceId) : undefined;
  });

  constructor() {
    // React: useEffect(() => updateNodeData(id, { text }), [nodesData]).
    effect(() => {
      const node = this.sourceNode();
      const text =
        node?.type === 'text' ? (node.data as { text: string }).text.toUpperCase() : undefined;
      if (this.nodeId) {
        this.flow.updateNodeData(this.nodeId, { text });
      }
    });
  }
}
