import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { type CSSProperties, Handle, NodeResizeControl, Position } from 'ng-flow';

import { NodeResizerResizeIcon } from './resize-icon';

interface ResizerData {
  label: string;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  keepAspectRatio?: boolean;
}

const controlStyle: CSSProperties = {
  background: 'transparent',
  border: 'none',
};

/**
 * React `NodeResizer/CustomResizer`: a single `NodeResizeControl` rendering a custom
 * `ResizeIcon` (transparent/borderless), with min/max + keepAspectRatio from `data`.
 */
@Component({
  selector: 'app-node-resizer-custom',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Handle, NodeResizeControl, NodeResizerResizeIcon],
  template: `
    <ng-flow-node-resize-control
      [minWidth]="data()?.minWidth ?? 10"
      [maxWidth]="data()?.maxWidth ?? maxValue"
      [minHeight]="data()?.minHeight ?? 10"
      [maxHeight]="data()?.maxHeight ?? maxValue"
      [keepAspectRatio]="data()?.keepAspectRatio ?? false"
      [style]="controlStyle"
    >
      <app-node-resizer-resize-icon />
    </ng-flow-node-resize-control>

    <ng-flow-handle type="target" [position]="Position.Left" />
    <div>{{ data()?.label }}</div>
    <ng-flow-handle type="source" [position]="Position.Right" />
  `,
})
export class NodeResizerCustom {
  readonly data = input<ResizerData>();
  protected readonly Position = Position;
  protected readonly maxValue = Number.MAX_VALUE;
  protected readonly controlStyle = controlStyle;
}
