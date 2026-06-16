import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import cc from 'classcat';

import type { CSSProperties } from '../../types';

/**
 * The props that are passed to the MiniMapNode component. A custom node component for
 * the {@link MiniMap} must declare inputs matching this shape (it renders an SVG element).
 *
 * @public
 */
export type MiniMapNodeProps = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius: number;
  className: string;
  color?: string;
  shapeRendering: string;
  strokeColor?: string;
  strokeWidth?: number;
  style?: CSSProperties;
  selected: boolean;
  onClick?: (event: MouseEvent, id: string) => void;
};

/**
 * The default component used to render a single node inside the {@link MiniMap}.
 *
 * The host **is** the `<rect>` (attribute selector `rect[ng-flow-minimap-node]`) so it
 * paints inside the minimap `<svg>`. The Angular port of React Flow's `MiniMapNode`.
 *
 * A custom `nodeComponent` passed to `<ng-flow-minimap>` is rendered through
 * {@link SvgComponentOutlet} and must accept the same inputs as this component.
 *
 * @public
 */
@Component({
  selector: 'rect[ng-flow-minimap-node]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  host: {
    '[class]': 'hostClass()',
    '[attr.x]': 'x()',
    '[attr.y]': 'y()',
    '[attr.rx]': 'borderRadius()',
    '[attr.ry]': 'borderRadius()',
    '[attr.width]': 'width()',
    '[attr.height]': 'height()',
    '[style]': 'rectStyle()',
    '[attr.shape-rendering]': 'shapeRendering()',
    '(click)': 'handleClick($event)',
  },
})
export class MiniMapNode {
  readonly id = input.required<string>();
  readonly x = input.required<number>();
  readonly y = input.required<number>();
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly borderRadius = input.required<number>();
  readonly className = input<string>('');
  readonly color = input<string>();
  readonly shapeRendering = input.required<string>();
  readonly strokeColor = input<string>();
  readonly strokeWidth = input<number>();
  readonly style = input<CSSProperties>();
  readonly selected = input<boolean>(false);
  readonly onClick = input<(event: MouseEvent, id: string) => void>();

  protected readonly hostClass = computed(() =>
    cc(['react-flow__minimap-node', { selected: this.selected() }, this.className()])
  );

  /**
   * `fill` falls back through `color` → `style.background` → `style.backgroundColor`,
   * matching React's `(color || background || backgroundColor)`.
   */
  protected readonly rectStyle = computed<CSSProperties>(() => {
    const style = this.style() || {};
    const fill = (this.color() || style['background'] || style['backgroundColor']) as string | undefined;
    return {
      fill,
      stroke: this.strokeColor(),
      strokeWidth: this.strokeWidth(),
    };
  });

  protected handleClick(event: MouseEvent): void {
    this.onClick()?.(event, this.id());
  }
}
