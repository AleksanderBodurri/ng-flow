import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Handle, NodeResizeControl, Position } from 'ng-flow';

interface ResizerData {
  label: string;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  keepAspectRatio?: boolean;
}

/**
 * React `NodeResizer/VerticalResizer`: two red `NodeResizeControl`s on the Top and Bottom
 * edges (line variant by default), with min/max + keepAspectRatio from `data`.
 */
@Component({
  selector: 'app-node-resizer-vertical',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Handle, NodeResizeControl],
  template: `
    <ng-flow-node-resize-control
      [minWidth]="data()?.minWidth ?? 10"
      [maxWidth]="data()?.maxWidth ?? maxValue"
      [minHeight]="data()?.minHeight ?? 10"
      [maxHeight]="data()?.maxHeight ?? maxValue"
      [keepAspectRatio]="data()?.keepAspectRatio ?? false"
      color="red"
      [position]="Position.Top"
    />
    <ng-flow-node-resize-control
      [minWidth]="data()?.minWidth ?? 10"
      [maxWidth]="data()?.maxWidth ?? maxValue"
      [minHeight]="data()?.minHeight ?? 10"
      [maxHeight]="data()?.maxHeight ?? maxValue"
      [keepAspectRatio]="data()?.keepAspectRatio ?? false"
      color="red"
      [position]="Position.Bottom"
    />
    <ng-flow-handle type="target" [position]="Position.Left" />
    <div style="padding: 10px">{{ data()?.label }}</div>
    <ng-flow-handle type="source" [position]="Position.Right" />
  `,
})
export class NodeResizerVertical {
  readonly data = input<ResizerData>();
  protected readonly Position = Position;
  protected readonly maxValue = Number.MAX_VALUE;
}
