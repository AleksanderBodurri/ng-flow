import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Handle, NodeResizeControl, Position, ResizeControlVariant } from 'ng-flow';

interface ResizerData {
  label: string;
}

/**
 * React `NodeResizer/BottomRightResizer`: a single Handle-variant `NodeResizeControl` at
 * the bottom-right with `resizeDirection="horizontal"`, fixed min/max width, orange color,
 * and `autoScale={false}`.
 */
@Component({
  selector: 'app-node-resizer-bottom-right',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Handle, NodeResizeControl],
  template: `
    <ng-flow-node-resize-control
      [variant]="ResizeControlVariant.Handle"
      position="bottom-right"
      resizeDirection="horizontal"
      [minWidth]="100"
      [maxWidth]="500"
      color="orange"
      [autoScale]="false"
    />
    <ng-flow-handle type="target" [position]="Position.Left" />
    <div>{{ data()?.label }}</div>
    <ng-flow-handle type="source" [position]="Position.Right" />
  `,
})
export class NodeResizerBottomRight {
  readonly data = input<ResizerData>();
  protected readonly Position = Position;
  protected readonly ResizeControlVariant = ResizeControlVariant;
}
