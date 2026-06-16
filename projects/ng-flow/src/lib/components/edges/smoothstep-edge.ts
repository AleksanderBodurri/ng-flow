import { ChangeDetectionStrategy, Component, computed, Directive, input } from '@angular/core';
import { getSmoothStepPath, Position, type SmoothStepPathOptions } from '@xyflow/system';

import type { CSSProperties, EdgeLabel } from '../../types';
import { BaseEdge } from './base-edge';

/**
 * Shared implementation for the public {@link SmoothStepEdge} and internal {@link SmoothStepEdgeInternal}
 * variants. Computes the smooth-step path/label position and forwards everything to `<svg:g ng-flow-base-edge>`.
 */
@Directive()
export abstract class SmoothStepEdgeBase {
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
  readonly pathOptions = input<SmoothStepPathOptions>();
  readonly interactionWidth = input<number>();

  /** Overridden to `true` by the internal variant; controls whether `id` is forwarded to BaseEdge. */
  protected internal = false;
  /**
   * When `true`, `borderRadius` is forced to `0` regardless of `pathOptions`. Set by {@link StepEdge},
   * which is a smooth-step edge with square corners (React forwards `{ borderRadius: 0 }`).
   */
  protected forceBorderRadiusZero = false;

  private readonly pathData = computed(() =>
    getSmoothStepPath({
      sourceX: this.sourceX(),
      sourceY: this.sourceY(),
      sourcePosition: this.sourcePosition(),
      targetX: this.targetX(),
      targetY: this.targetY(),
      targetPosition: this.targetPosition(),
      borderRadius: this.forceBorderRadiusZero ? 0 : this.pathOptions()?.borderRadius,
      offset: this.pathOptions()?.offset,
      stepPosition: this.forceBorderRadiusZero ? undefined : this.pathOptions()?.stepPosition,
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
 * Component that can be used inside a custom edge to render a smooth step edge.
 * The Angular port of React Flow's `SmoothStepEdge`.
 *
 * @public
 */
@Component({
  selector: 'ng-flow-smoothstep-edge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseEdge],
  template: TEMPLATE,
})
export class SmoothStepEdge extends SmoothStepEdgeBase {}

/**
 * Internal variant rendered by the EdgeWrapper for the built-in `smoothstep` edge type.
 * Passes `id=undefined` to BaseEdge (matching React).
 *
 * @internal
 */
@Component({
  selector: 'ng-flow-smoothstep-edge-internal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseEdge],
  template: TEMPLATE,
})
export class SmoothStepEdgeInternal extends SmoothStepEdgeBase {
  protected override internal = true;
}
