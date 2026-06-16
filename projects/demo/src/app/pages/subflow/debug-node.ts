import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Handle, Position, useInternalNode, useNodeId } from 'ng-flow';

/**
 * React `DebugNode` (registered as the `default` node type). Shows two coordinate readouts:
 * the absolute position (`positionAbsoluteX/Y`, from NodeProps) plus the `zIndex`, and the
 * node's own relative `position` (read from the internal node via `useInternalNode`). The id
 * is rendered in the top-left corner.
 *
 * `useInternalNode` needs the node id. React received it as the `id` NodeProps input; here we
 * also accept `id` as an input but resolve it through `useNodeId()` (injection-context) so the
 * internal-node lookup is wired even before the input settles.
 */
@Component({
  selector: 'app-subflow-debug-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Handle],
  template: `
    <ng-flow-handle type="target" [position]="Position.Top" />
    <div class="id">{{ id() }}</div>
    <div class="info">x:{{ round(positionAbsoluteX()) }} y:{{ round(positionAbsoluteY()) }} z:{{ zIndex() }}</div>
    <div class="info">x:{{ round(relX()) }} y:{{ round(relY()) }}</div>
    <ng-flow-handle type="source" [position]="Position.Bottom" />
  `,
  styles: [
    `
      .info {
        font-size: 11px;
      }
      .id {
        font-size: 10px;
        color: #888899;
        position: absolute;
        top: 2px;
        left: 2px;
      }
    `,
  ],
})
export class SubflowDebugNode {
  readonly id = input('');
  readonly zIndex = input(0);
  readonly positionAbsoluteX = input(0);
  readonly positionAbsoluteY = input(0);

  protected readonly Position = Position;

  private readonly nodeId = useNodeId() ?? '';
  private readonly internalNode = useInternalNode(this.nodeId);

  protected readonly relX = computed(() => this.internalNode()?.position.x ?? 0);
  protected readonly relY = computed(() => this.internalNode()?.position.y ?? 0);

  protected round(n: number): number {
    return Math.round(n);
  }
}
