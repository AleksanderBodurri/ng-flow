import { ChangeDetectionStrategy, Component, computed, Directive, input } from '@angular/core';
import { getStraightPath } from '@xyflow/system';

import type { CSSProperties, EdgeLabel } from '../../types';
import { BaseEdge } from './base-edge';

/**
 * Shared implementation for the public {@link StraightEdge} and internal {@link StraightEdgeInternal}
 * variants. Computes the straight path/label position and forwards everything to `<svg:g ng-flow-base-edge>`.
 *
 * Like React's `StraightEdgeProps`, there are no `sourcePosition`/`targetPosition` inputs —
 * a straight line ignores handle orientation.
 */
@Directive()
export abstract class StraightEdgeBase {
  readonly id = input<string>();
  readonly sourceX = input.required<number>();
  readonly sourceY = input.required<number>();
  readonly targetX = input.required<number>();
  readonly targetY = input.required<number>();
  readonly label = input<EdgeLabel>();
  readonly labelStyle = input<CSSProperties>();
  readonly labelShowBg = input<boolean>();
  readonly labelBgStyle = input<CSSProperties>();
  readonly labelBgPadding = input<[number, number]>();
  readonly labelBgBorderRadius = input<number>();
  readonly style = input<CSSProperties>();
  readonly markerEnd = input<string>();
  readonly markerStart = input<string>();
  readonly interactionWidth = input<number>();

  /** Overridden to `true` by the internal variant; controls whether `id` is forwarded to BaseEdge. */
  protected internal = false;

  private readonly pathData = computed(() =>
    getStraightPath({
      sourceX: this.sourceX(),
      sourceY: this.sourceY(),
      targetX: this.targetX(),
      targetY: this.targetY(),
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
 * Component that can be used inside a custom edge to render a straight line.
 * The Angular port of React Flow's `StraightEdge`.
 *
 * @public
 */
@Component({
  selector: 'ng-flow-straight-edge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseEdge],
  template: TEMPLATE,
})
export class StraightEdge extends StraightEdgeBase {}

/**
 * Internal variant rendered by the EdgeWrapper for the built-in `straight` edge type.
 * Passes `id=undefined` to BaseEdge (matching React).
 *
 * @internal
 */
@Component({
  selector: 'ng-flow-straight-edge-internal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseEdge],
  template: TEMPLATE,
})
export class StraightEdgeInternal extends StraightEdgeBase {
  protected override internal = true;
}
