import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Handle, Position, useConnection, useNodeId } from 'ng-flow';

@Component({
  selector: 'app-easy-connect-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Handle],
  template: `
    <div class="customNode">
      <div
        class="customNodeBody"
        [style.borderStyle]="isTarget() ? 'dashed' : 'solid'"
        [style.backgroundColor]="isTarget() ? '#ffcce3' : '#ccd9f6'"
      >
        <!--
          If handles are conditionally rendered and not present initially, you need to update the
          node internals https://reactflow.dev/docs/api/hooks/use-update-node-internals/
          In this case we don't need to use useUpdateNodeInternals, since !isConnecting is true at
          the beginning and all handles are rendered initially.
        -->
        @if (!connection().inProgress) {
          <ng-flow-handle class="customHandle" [position]="Position.Right" type="source" />
        }
        <!-- We want to disable the target handle, if the connection was started from this node -->
        @if (!connection().inProgress || isTarget()) {
          <ng-flow-handle
            class="customHandle"
            [position]="Position.Left"
            type="target"
            [isConnectableStart]="false"
          />
        }
        {{ label() }}
      </div>
    </div>
  `,
})
export class EasyConnectNode {
  readonly id = input<string>();

  protected readonly Position = Position;
  protected readonly connection = useConnection();
  private readonly nodeId = useNodeId();

  protected readonly isTarget = computed(() => {
    const c = this.connection();
    return c.inProgress && c.fromNode.id !== (this.id() ?? this.nodeId);
  });

  protected readonly label = computed(() => (this.isTarget() ? 'Drop here' : 'Drag to connect'));
}
