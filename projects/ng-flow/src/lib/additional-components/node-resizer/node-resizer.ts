import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  ResizeControlVariant,
  XY_RESIZER_HANDLE_POSITIONS,
  XY_RESIZER_LINE_POSITIONS,
  type ResizeDragEvent,
  type ResizeParams,
  type ResizeParamsWithDirection,
} from '@xyflow/system';

import { NodeResizeControl } from './node-resize-control';
import type { CSSProperties } from '../../types';

/**
 * Props for the {@link NodeResizer} component.
 *
 * @public
 */
export type NodeResizerProps = {
  nodeId?: string;
  color?: string;
  handleClassName?: string;
  handleStyle?: CSSProperties;
  lineClassName?: string;
  lineStyle?: CSSProperties;
  isVisible?: boolean;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  keepAspectRatio?: boolean;
  autoScale?: boolean;
};

/**
 * The `<ng-flow-node-resizer>` component adds resize functionality to your nodes. It
 * renders draggable controls (4 lines + 4 handles) around the node to resize in all
 * directions. The Angular port of React Flow's `<NodeResizer />`.
 *
 * @public
 *
 * @example
 * ```html
 * <ng-flow-node-resizer [minWidth]="100" [minHeight]="30" />
 * ```
 */
@Component({
  selector: 'ng-flow-node-resizer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NodeResizeControl],
  template: `
    @if (isVisible()) {
      @for (position of linePositions; track position) {
        <ng-flow-node-resize-control
          [className]="lineClassName()"
          [style]="lineStyle()"
          [nodeId]="nodeId()"
          [position]="position"
          [variant]="lineVariant"
          [color]="color()"
          [minWidth]="minWidth()"
          [minHeight]="minHeight()"
          [maxWidth]="maxWidth()"
          [maxHeight]="maxHeight()"
          [keepAspectRatio]="keepAspectRatio()"
          [autoScale]="autoScale()"
          [shouldResize]="shouldResize()"
          (onResizeStart)="onResizeStart.emit($event)"
          (onResize)="onResize.emit($event)"
          (onResizeEnd)="onResizeEnd.emit($event)"
        />
      }
      @for (position of handlePositions; track position) {
        <ng-flow-node-resize-control
          [className]="handleClassName()"
          [style]="handleStyle()"
          [nodeId]="nodeId()"
          [position]="position"
          [color]="color()"
          [minWidth]="minWidth()"
          [minHeight]="minHeight()"
          [maxWidth]="maxWidth()"
          [maxHeight]="maxHeight()"
          [keepAspectRatio]="keepAspectRatio()"
          [autoScale]="autoScale()"
          [shouldResize]="shouldResize()"
          (onResizeStart)="onResizeStart.emit($event)"
          (onResize)="onResize.emit($event)"
          (onResizeEnd)="onResizeEnd.emit($event)"
        />
      }
    }
  `,
})
export class NodeResizer {
  readonly nodeId = input<string>();
  readonly color = input<string>();
  readonly handleClassName = input<string>();
  readonly handleStyle = input<CSSProperties>();
  readonly lineClassName = input<string>();
  readonly lineStyle = input<CSSProperties>();
  readonly isVisible = input<boolean>(true);
  readonly minWidth = input<number>(10);
  readonly minHeight = input<number>(10);
  readonly maxWidth = input<number>(Number.MAX_VALUE);
  readonly maxHeight = input<number>(Number.MAX_VALUE);
  readonly keepAspectRatio = input<boolean>(false);
  readonly autoScale = input<boolean>(true);

  readonly shouldResize = input<(event: ResizeDragEvent, params: ResizeParamsWithDirection) => boolean>();
  readonly onResizeStart = output<{ event: ResizeDragEvent; params: ResizeParams }>();
  readonly onResize = output<{ event: ResizeDragEvent; params: ResizeParamsWithDirection }>();
  readonly onResizeEnd = output<{ event: ResizeDragEvent; params: ResizeParams }>();

  protected readonly linePositions = XY_RESIZER_LINE_POSITIONS;
  protected readonly handlePositions = XY_RESIZER_HANDLE_POSITIONS;
  protected readonly lineVariant = ResizeControlVariant.Line;
}
