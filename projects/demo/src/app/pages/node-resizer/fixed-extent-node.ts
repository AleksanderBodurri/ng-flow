import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { type CSSProperties, Handle, NodeResizer, Position, ViewportPortal } from 'ng-flow';

interface FixedExtentData {
  label: string;
  extent: [number, number][];
}

/**
 * React `NodeResizer/FixedExtentNode`: a `NodeResizer` (minWidth 100, minHeight 30) plus a
 * `ViewportPortal` overlay that draws the allowed extent rectangle (translucent red) in
 * viewport space, matching the node's `extent` from `data`.
 */
@Component({
  selector: 'app-node-resizer-fixed-extent',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Handle, NodeResizer, ViewportPortal],
  template: `
    <ng-flow-node-resizer [minWidth]="100" [minHeight]="30" />
    <ng-flow-handle type="target" [position]="Position.Left" />
    <div style="padding: 10px">{{ data()?.label }}</div>
    <ng-flow-viewport-portal>
      <div [style]="overlayStyle()"></div>
    </ng-flow-viewport-portal>
  `,
})
export class NodeResizerFixedExtent {
  readonly data = input<FixedExtentData>();
  protected readonly Position = Position;

  protected readonly overlayStyle = computed<CSSProperties>(() => {
    const extent = this.data()?.extent ?? [
      [0, 0],
      [0, 0],
    ];
    return {
      transform: `translate(${extent[0][0]}px, ${extent[0][1]}px)`,
      position: 'absolute',
      width: `${extent[1][0] - extent[0][0]}px`,
      height: `${extent[1][1] - extent[0][1]}px`,
      backgroundColor: 'rgb(255,0,0,0.25)',
    };
  });
}
