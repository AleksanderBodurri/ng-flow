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
 * React `NodeResizer/HorizontalResizer`: two red `NodeResizeControl`s on the Left and
 * Right edges (line variant by default), with min/max + keepAspectRatio from `data`.
 */
@Component({
  selector: 'app-node-resizer-horizontal',
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
      [position]="Position.Left"
    />
    <ng-flow-node-resize-control
      [minWidth]="data()?.minWidth ?? 10"
      [maxWidth]="data()?.maxWidth ?? maxValue"
      [minHeight]="data()?.minHeight ?? 10"
      [maxHeight]="data()?.maxHeight ?? maxValue"
      [keepAspectRatio]="data()?.keepAspectRatio ?? false"
      color="red"
      [position]="Position.Right"
    />
    <ng-flow-handle type="target" [position]="Position.Top" />
    <div style="padding: 10px">{{ data()?.label }}</div>
    <ng-flow-handle type="source" [position]="Position.Bottom" />
  `,
})
export class NodeResizerHorizontal {
  readonly data = input<ResizerData>();
  protected readonly Position = Position;
  protected readonly maxValue = Number.MAX_VALUE;
}
