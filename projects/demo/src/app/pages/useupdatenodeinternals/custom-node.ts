import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { Handle, Position, useUpdateNodeInternals } from 'ng-flow';

/**
 * React `UseUpdateNodeInternals/CustomNode`: a node that grows a column of source handles on the
 * right each time you click "add handle". Because handles are added imperatively (their count is
 * local component state, not part of the node definition), the flow must be told to re-measure
 * the node's handles afterward — `useUpdateNodeInternals()` returns a function called with this
 * node's id (`[id]`) to do exactly that.
 */
@Component({
  selector: 'app-update-node-internals-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Handle],
  template: `
    <div class="node">
      <ng-flow-handle type="target" [position]="Position.Left" />
      <div>output handle count: {{ handleCount() }}</div>
      <button type="button" (click)="addHandle()">add handle</button>
      @for (i of handleIndexes(); track i) {
        <ng-flow-handle type="source" [position]="Position.Right" [id]="'handle-' + i" [style.top.px]="10 * i" />
      }
    </div>
  `,
  styles: [
    `
      .node {
        padding: 10px;
        border: 1px solid #ddd;
      }
    `,
  ],
})
export class UpdateNodeInternalsNode {
  readonly id = input.required<string>();
  protected readonly Position = Position;

  protected readonly handleCount = signal(1);
  protected readonly handleIndexes = computed(() => Array.from({ length: this.handleCount() }, (_, i) => i));

  private readonly updateNodeInternals = useUpdateNodeInternals();

  protected addHandle(): void {
    this.handleCount.update((c) => c + 1);
    this.updateNodeInternals([this.id()]);
  }
}
