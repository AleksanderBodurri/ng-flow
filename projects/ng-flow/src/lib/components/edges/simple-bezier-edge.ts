import { ChangeDetectionStrategy, Component, computed, Directive, input } from '@angular/core';
import { getBezierEdgeCenter, Position } from '@xyflow/system';

import type { CSSProperties, EdgeLabel } from '../../types';
import { BaseEdge } from './base-edge';

/**
 * Parameters for {@link getSimpleBezierPath}. Ported from React Flow's
 * `GetSimpleBezierPathParams`.
 * @public
 */
export interface GetSimpleBezierPathParams {
  sourceX: number;
  sourceY: number;
  /** @default Position.Bottom */
  sourcePosition?: Position;
  targetX: number;
  targetY: number;
  /** @default Position.Top */
  targetPosition?: Position;
}

interface GetControlParams {
  pos: Position;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function getControl({ pos, x1, y1, x2, y2 }: GetControlParams): [number, number] {
  if (pos === Position.Left || pos === Position.Right) {
    return [0.5 * (x1 + x2), y1];
  }

  return [x1, 0.5 * (y1 + y2)];
}

/**
 * The `getSimpleBezierPath` util returns everything you need to render a simple
 * bezier edge between two nodes. The Angular port of React Flow's `getSimpleBezierPath`.
 *
 * @public
 * @returns A tuple of `[path, labelX, labelY, offsetX, offsetY]`.
 */
export function getSimpleBezierPath({
  sourceX,
  sourceY,
  sourcePosition = Position.Bottom,
  targetX,
  targetY,
  targetPosition = Position.Top,
}: GetSimpleBezierPathParams): [path: string, labelX: number, labelY: number, offsetX: number, offsetY: number] {
  const [sourceControlX, sourceControlY] = getControl({
    pos: sourcePosition,
    x1: sourceX,
    y1: sourceY,
    x2: targetX,
    y2: targetY,
  });
  const [targetControlX, targetControlY] = getControl({
    pos: targetPosition,
    x1: targetX,
    y1: targetY,
    x2: sourceX,
    y2: sourceY,
  });
  const [labelX, labelY, offsetX, offsetY] = getBezierEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourceControlX,
    sourceControlY,
    targetControlX,
    targetControlY,
  });

  return [
    `M${sourceX},${sourceY} C${sourceControlX},${sourceControlY} ${targetControlX},${targetControlY} ${targetX},${targetY}`,
    labelX,
    labelY,
    offsetX,
    offsetY,
  ];
}

/**
 * Shared implementation for the public {@link SimpleBezierEdge} and internal
 * {@link SimpleBezierEdgeInternal} variants. Computes the simple-bezier path/label position and
 * forwards everything to `<svg:g ng-flow-base-edge>`.
 */
@Directive()
export abstract class SimpleBezierEdgeBase {
  readonly id = input<string>();
  readonly sourceX = input.required<number>();
  readonly sourceY = input.required<number>();
  readonly targetX = input.required<number>();
  readonly targetY = input.required<number>();
  readonly sourcePosition = input<Position>();
  readonly targetPosition = input<Position>();
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
    getSimpleBezierPath({
      sourceX: this.sourceX(),
      sourceY: this.sourceY(),
      sourcePosition: this.sourcePosition(),
      targetX: this.targetX(),
      targetY: this.targetY(),
      targetPosition: this.targetPosition(),
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
 * Component that can be used inside a custom edge to render a simple bezier curve.
 * The Angular port of React Flow's `SimpleBezierEdge`.
 *
 * @public
 */
@Component({
  selector: 'ng-flow-simple-bezier-edge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseEdge],
  template: TEMPLATE,
})
export class SimpleBezierEdge extends SimpleBezierEdgeBase {}

/**
 * Internal variant rendered by the EdgeWrapper for the built-in `simplebezier` edge type.
 * Passes `id=undefined` to BaseEdge (matching React).
 *
 * @internal
 */
@Component({
  selector: 'ng-flow-simple-bezier-edge-internal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseEdge],
  template: TEMPLATE,
})
export class SimpleBezierEdgeInternal extends SimpleBezierEdgeBase {
  protected override internal = true;
}
