import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Handle, NodeResizer, Position, useKeyPress } from 'ng-flow';

interface ResizerData {
  label: string;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  keepAspectRatio?: boolean;
  isVisible?: boolean;
}

/**
 * React `NodeResizer/DefaultResizer`: the default `NodeResizer` (lines + corner handles)
 * with min/max dimensions pulled from `data`. `keepAspectRatio` is enabled while the `k`
 * key is held (`useKeyPress('k')`) or when `data.keepAspectRatio` is set.
 */
@Component({
  selector: 'app-node-resizer-default',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Handle, NodeResizer],
  template: `
    <ng-flow-node-resizer
      [minWidth]="data()?.minWidth ?? 10"
      [maxWidth]="data()?.maxWidth ?? maxValue"
      [minHeight]="data()?.minHeight ?? 10"
      [maxHeight]="data()?.maxHeight ?? maxValue"
      [isVisible]="data()?.isVisible ?? !!selected()"
      [keepAspectRatio]="keepAspectRatio()"
    />
    <ng-flow-handle type="target" [position]="Position.Left" />
    <div>{{ data()?.label }}</div>
    <ng-flow-handle type="source" [position]="Position.Right" />
  `,
})
export class NodeResizerDefault {
  readonly data = input<ResizerData>();
  readonly selected = input<boolean>(false);
  protected readonly Position = Position;
  protected readonly maxValue = Number.MAX_VALUE;

  private readonly kPressed = useKeyPress('k');
  protected readonly keepAspectRatio = computed(() => this.kPressed() || (this.data()?.keepAspectRatio ?? false));
}
