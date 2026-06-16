import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import cc from 'classcat';
import type { PanelPosition } from '@xyflow/system';

import type { CSSProperties } from '../../types';

/**
 * The `<ng-flow-panel>` component helps you position content above the viewport.
 * It is used internally by the `<MiniMap />` and `<Controls />` components.
 *
 * The Angular port of React Flow's `<Panel />`. The host element *is* the
 * `react-flow__panel` div, so any native attributes placed on `<ng-flow-panel>`
 * (e.g. `data-*`, `aria-*`) land on it directly — mirroring React's `{...rest}`.
 *
 * @public
 *
 * @example
 * ```html
 * <ng-flow-panel position="top-left">top-left</ng-flow-panel>
 * <ng-flow-panel position="bottom-right">bottom-right</ng-flow-panel>
 * ```
 */
@Component({
  selector: 'ng-flow-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: {
    '[class]': 'hostClasses()',
    '[style]': 'style()',
  },
})
export class Panel {
  /** The host `<div>` of the panel — exposed so consumers (e.g. Attribution) can reach it. */
  readonly elementRef = inject<ElementRef<HTMLDivElement>>(ElementRef);

  /**
   * The position of the panel.
   * @default "top-left"
   */
  readonly position = input<PanelPosition>('top-left');

  /** Extra class name(s) merged onto the host, mirroring React's `className`. */
  readonly className = input<string>();

  /** Inline styles merged onto the host, mirroring React's `style`. */
  readonly style = input<CSSProperties>();

  /**
   * Full host class string: the base `react-flow__panel`, the consumer `className`,
   * and the position split into tokens (e.g. `'top-left'` → `top` `left`), matching
   * `cc(['react-flow__panel', className, ...position.split('-')])`.
   */
  protected readonly hostClasses = computed(() => {
    const positionClasses = `${this.position()}`.split('-');
    return cc(['react-flow__panel', this.className(), ...positionClasses]);
  });
}
