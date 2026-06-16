import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { isNumeric } from '@xyflow/system';

import type { CSSProperties, EdgeLabel } from '../../types';
import { EdgeText } from './edge-text';

/**
 * Renders the visible edge path, the invisible (wide) interaction path, and the optional
 * edge label. The Angular port of React Flow's `<BaseEdge />`.
 *
 * Used internally by every built-in edge type, and intended to be used inside custom edges:
 * authors write `<svg:g ng-flow-base-edge [path]="…" [markerEnd]="…">` from a custom edge template.
 *
 * React spread `...props` (id/style/className/strokeWidth/markerStart/markerEnd) onto the visible
 * `<path>`; those are modelled here as discrete inputs bound to that path. The host is a `<g>`
 * (instead of React's fragment) so the SVG output paints — see folder docs.
 *
 * @public
 */
@Component({
  selector: 'g[ng-flow-base-edge]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EdgeText],
  template: `
    <svg:path
      [attr.id]="id()"
      [attr.d]="path()"
      fill="none"
      [class]="pathClass()"
      [style]="style()"
      [attr.stroke-width]="strokeWidth()"
      [attr.marker-start]="markerStart()"
      [attr.marker-end]="markerEnd()"
    />
    @if (interactionWidth()) {
      <svg:path
        [attr.d]="path()"
        fill="none"
        [attr.stroke-opacity]="0"
        [attr.stroke-width]="interactionWidth()"
        class="react-flow__edge-interaction"
      />
    }
    @if (showLabel()) {
      <svg:g
        ng-flow-edge-text
        [x]="labelX()!"
        [y]="labelY()!"
        [label]="label()"
        [labelStyle]="labelStyle()"
        [labelShowBg]="labelShowBg() ?? true"
        [labelBgStyle]="labelBgStyle()"
        [labelBgPadding]="labelBgPadding() ?? [2, 4]"
        [labelBgBorderRadius]="labelBgBorderRadius() ?? 2"
      />
    }
  `,
})
export class BaseEdge {
  readonly id = input<string>();
  /** The SVG path string that defines the edge, e.g. `'M 0 0 L 100 100'`. */
  readonly path = input.required<string>();
  readonly labelX = input<number>();
  readonly labelY = input<number>();
  readonly label = input<EdgeLabel>();
  readonly labelStyle = input<CSSProperties>();
  readonly labelShowBg = input<boolean>();
  readonly labelBgStyle = input<CSSProperties>();
  readonly labelBgPadding = input<[number, number]>();
  readonly labelBgBorderRadius = input<number>();
  /** The width of the invisible interaction area around the edge. @default 20 */
  readonly interactionWidth = input(20);
  readonly markerStart = input<string>();
  readonly markerEnd = input<string>();
  readonly style = input<CSSProperties>();
  readonly className = input<string>();
  readonly strokeWidth = input<number>();

  protected readonly pathClass = computed(() => {
    const cn = this.className();
    return cn ? `react-flow__edge-path ${cn}` : 'react-flow__edge-path';
  });
  protected readonly showLabel = computed(() => !!this.label() && isNumeric(this.labelX()) && isNumeric(this.labelY()));
}
