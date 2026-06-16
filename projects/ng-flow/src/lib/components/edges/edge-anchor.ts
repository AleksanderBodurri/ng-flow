import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Position } from '@xyflow/system';

const shiftX = (x: number, shift: number, position: Position): number => {
  if (position === Position.Left) return x - shift;
  if (position === Position.Right) return x + shift;
  return x;
};

const shiftY = (y: number, shift: number, position: Position): number => {
  if (position === Position.Top) return y - shift;
  if (position === Position.Bottom) return y + shift;
  return y;
};

const EdgeUpdaterClassName = 'react-flow__edgeupdater';

/**
 * The transparent circle rendered at the source/target end of a (reconnectable) edge
 * that the user can grab to reconnect it. The Angular port of React Flow's `<EdgeAnchor />`.
 *
 * The host **is** the `<circle>` (attribute selector) so its geometry paints inside `<svg>`.
 * React's `onMouseDown`/`onMouseEnter`/`onMouseOut` props become outputs the wrapper binds to.
 *
 * @internal
 */
@Component({
  selector: 'circle[ng-flow-edge-anchor]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  host: {
    '[class]': 'hostClass()',
    '[attr.cx]': 'cx()',
    '[attr.cy]': 'cy()',
    '[attr.r]': 'radius()',
    'stroke': 'transparent',
    'fill': 'transparent',
    '(mousedown)': 'edgeAnchorMouseDown.emit($event)',
    '(mouseenter)': 'edgeAnchorMouseEnter.emit($event)',
    '(mouseout)': 'edgeAnchorMouseOut.emit($event)',
  },
})
export class EdgeAnchor {
  readonly position = input.required<Position>();
  readonly centerX = input.required<number>();
  readonly centerY = input.required<number>();
  readonly radius = input(10);
  readonly type = input.required<string>();

  readonly edgeAnchorMouseDown = output<MouseEvent>();
  readonly edgeAnchorMouseEnter = output<MouseEvent>();
  readonly edgeAnchorMouseOut = output<MouseEvent>();

  protected readonly hostClass = computed(() => `${EdgeUpdaterClassName} ${EdgeUpdaterClassName}-${this.type()}`);
  protected readonly cx = computed(() => shiftX(this.centerX(), this.radius(), this.position()));
  protected readonly cy = computed(() => shiftY(this.centerY(), this.radius(), this.position()));
}
