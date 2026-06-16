import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { StepPathOptions } from '@xyflow/system';

import { BaseEdge } from './base-edge';
import { SmoothStepEdgeBase } from './smoothstep-edge';

/**
 * Shared template for the public {@link StepEdge} and internal {@link StepEdgeInternal} variants.
 * Identical to the smooth-step template — a step edge is a smooth-step edge with square corners.
 */
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
 * Component that can be used inside a custom edge to render a step edge.
 * The Angular port of React Flow's `StepEdge`.
 *
 * Delegates to the smooth-step path with `borderRadius: 0` (square corners), matching React.
 *
 * @public
 */
@Component({
  selector: 'ng-flow-step-edge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseEdge],
  template: TEMPLATE,
})
export class StepEdge extends SmoothStepEdgeBase {
  /** Step edges only expose `offset` (React's `StepPathOptions`); border radius is forced to 0. */
  override readonly pathOptions = input<StepPathOptions>();
  protected override forceBorderRadiusZero = true;
}

/**
 * Internal variant rendered by the EdgeWrapper for the built-in `step` edge type.
 * Passes `id=undefined` to BaseEdge (matching React).
 *
 * @internal
 */
@Component({
  selector: 'ng-flow-step-edge-internal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseEdge],
  template: TEMPLATE,
})
export class StepEdgeInternal extends StepEdge {
  protected override internal = true;
}
