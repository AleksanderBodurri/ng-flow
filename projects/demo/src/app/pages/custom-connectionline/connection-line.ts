import { ChangeDetectionStrategy, Component, computed, effect, input } from '@angular/core';
import type { XYPosition } from 'ng-flow';

/**
 * Custom connection line (React `ConnectionLine`). Rendered while the user is dragging a new
 * connection. It draws an animated cubic-bezier path from the source handle to the cursor plus
 * a small circle at the cursor end, using the `fromX/fromY` → `toX/toY` coordinates. It also
 * logs the live `pointer` position on every change, mirroring React's render-time `console.log`.
 *
 * Declares the subset of `ConnectionLineComponentProps` inputs it needs; the page casts the
 * class to `ConnectionLineComponent` when passing it to `[connectionLineComponent]` (the inputs
 * are filtered by the library at runtime), matching the other custom connection-line demos.
 */
@Component({
  selector: 'app-custom-connection-line',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg:g>
      <svg:path
        fill="none"
        stroke="#222"
        [attr.stroke-width]="1.5"
        class="animated"
        [attr.d]="path()"
      />
      <svg:circle
        [attr.cx]="toX()"
        [attr.cy]="toY()"
        fill="#fff"
        [attr.r]="3"
        stroke="#222"
        [attr.stroke-width]="1.5"
      />
    </svg:g>
  `,
})
export class CustomConnectionLine {
  readonly fromX = input(0);
  readonly fromY = input(0);
  readonly toX = input(0);
  readonly toY = input(0);
  readonly pointer = input<XYPosition>();

  // React: d={`M${fromX},${fromY} C ${fromX} ${toY} ${fromX} ${toY} ${toX},${toY}`}
  protected readonly path = computed(
    () => `M${this.fromX()},${this.fromY()} C ${this.fromX()} ${this.toY()} ${this.fromX()} ${this.toY()} ${this.toX()},${this.toY()}`
  );

  constructor() {
    // React logged `pointer` on every render; here we log on each change.
    effect(() => console.log('pointer', this.pointer()));
  }
}
