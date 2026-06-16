import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { Handle, type Node, Position, useNodeConnections, useNodes } from 'ng-flow';

/**
 * Mirrors React's ResultNode.tsx: reads all incoming (target) connections, looks up each
 * source node's data, keeps the text-bearing ones (`type === 'text' | 'uppercase'`, React's
 * `isTextNode`), and lists their texts.
 *
 * Same `useNodesData` note as UppercaseNode: React calls `useNodesData(connections.map(c =>
 * c.source))` and re-runs each render. The source ids here are dynamic, so we reactively combine
 * `useNodes()` with the live `connections()` signal instead of the static-id `useNodesData`.
 */
@Component({
  selector: 'app-result-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Handle],
  template: `
    <div class="data-node">
      <ng-flow-handle type="target" [position]="Position.Left" />
      <div>
        incoming texts:
        @for (text of texts(); track $index) {
          <div>{{ text }}</div>
        } @empty {
          none
        }
      </div>
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
export class ResultNode {
  protected readonly Position = Position;

  // React: useNodeConnections({ handleType: 'target' }).
  protected readonly connections = useNodeConnections({ handleType: 'target' });

  private readonly nodes = useNodes();

  // Reactive equivalent of React's `useNodesData(connections.map(c => c.source)).filter(isTextNode)`.
  protected readonly texts = computed<string[]>(() => {
    const byId = new Map(this.nodes().map((n) => [n.id, n] as const));
    return this.connections()
      .map((c) => byId.get(c.source))
      .filter((n): n is Node => !!n && (n.type === 'text' || n.type === 'uppercase'))
      .map((n) => (n.data as { text: string }).text);
  });
}
