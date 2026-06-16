import { ChangeDetectionStrategy, Component, computed, Directive, input } from '@angular/core';
import { type BezierPathOptions, getBezierPath, Position } from '@xyflow/system';

import type { CSSProperties, EdgeLabel } from '../../types';
import { BaseEdge } from './base-edge';

/**
 * Shared implementation for the public {@link BezierEdge} and internal {@link BezierEdgeInternal}
 * variants. Computes the bezier path/label position and forwards everything to `<svg:g ng-flow-base-edge>`.
 *
 * Rendered by the EdgeWrapper through `SvgComponentOutlet`, which supplies the `<svg:g>` host and
 * projects this template into it — so the template authors `ng-flow-base-edge` statically.
 */
@Directive()
export abstract class BezierEdgeBase {
  readonly id = input<string>();
  readonly sourceX = input.required<number>();
  readonly sourceY = input.required<number>();
  readonly targetX = input.required<number>();
  readonly targetY = input.required<number>();
  readonly sourcePosition = input<Position>(Position.Bottom);
  readonly targetPosition = input<Position>(Position.Top);
  readonly label = input<EdgeLabel>();
  readonly labelStyle = input<CSSProperties>();
  readonly labelShowBg = input<boolean>();
  readonly labelBgStyle = input<CSSProperties>();
  readonly labelBgPadding = input<[number, number]>();
  readonly labelBgBorderRadius = input<number>();
  readonly style = input<CSSProperties>();
  readonly markerEnd = input<string>();
  readonly markerStart = input<string>();
  readonly pathOptions = input<BezierPathOptions>();
  readonly interactionWidth = input<number>();

  /** Overridden to `true` by the internal variant; controls whether `id` is forwarded to BaseEdge. */
  protected internal = false;

  private readonly pathData = computed(() =>
    getBezierPath({
      sourceX: this.sourceX(),
      sourceY: this.sourceY(),
      sourcePosition: this.sourcePosition(),
      targetX: this.targetX(),
      targetY: this.targetY(),
      targetPosition: this.targetPosition(),
      curvature: this.pathOptions()?.curvature,
    })
  );

  protected readonly path = computed(() => this.pathData()[0]);
  protected readonly labelX = computed(() => this.pathData()[1]);
  protected readonly labelY = computed(() => this.pathData()[2]);
  protected readonly forwardedId = computed(() => (this.internal ? undefined : this.id()));
}

const TEMPLATE = `
  <svg:g
    ng-flow-base-edge
    [id]="forwardedId()"
    [path]="path()"
    [labelX]="labelX()"
    [labelY]="labelY()"
    [label]="label()"
    [labelStyle]="labelStyle()"
    [labelShowBg]="labelShowBg()"
    [labelBgStyle]="labelBgStyle()"
    [labelBgPadding]="labelBgPadding()"
    [labelBgBorderRadius]="labelBgBorderRadius()"
    [style]="style()"
    [markerEnd]="markerEnd()"
    [markerStart]="markerStart()"
    [interactionWidth]="interactionWidth() ?? 20"
  />
`;

/**
 * Component that can be used inside a custom edge to render a bezier curve.
 * The Angular port of React Flow's `BezierEdge`.
 *
 * @public
 */
@Component({
  selector: 'ng-flow-bezier-edge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseEdge],
  template: TEMPLATE,
})
export class BezierEdge extends BezierEdgeBase {}

/**
 * Internal variant rendered by the EdgeWrapper for the built-in `default` edge type.
 * Passes `id=undefined` to BaseEdge (matching React).
 *
 * @internal
 */
@Component({
  selector: 'ng-flow-bezier-edge-internal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseEdge],
  template: TEMPLATE,
})
export class BezierEdgeInternal extends BezierEdgeBase {
  protected override internal = true;
}
