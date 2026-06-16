import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BaseEdge, getBezierPath, Position } from 'ng-flow';

/**
 * React `Edges/CustomEdge`: a bezier BaseEdge plus an SVG `<textPath>` label that follows
 * the edge curve (text routed along the path via `href="#{id}"`).
 */
@Component({
  selector: 'app-edges-custom-edge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseEdge],
  template: `
    <svg:g ng-flow-base-edge [id]="id()" [path]="path()" />
    <svg:text>
      <svg:textPath
        [attr.href]="'#' + id()"
        style="font-size: 12px"
        startOffset="50%"
        text-anchor="middle"
      >{{ data()?.text }}</svg:textPath>
    </svg:text>
  `,
})
export class CustomEdge {
  readonly id = input<string>();
  readonly sourceX = input.required<number>();
  readonly sourceY = input.required<number>();
  readonly targetX = input.required<number>();
  readonly targetY = input.required<number>();
  readonly sourcePosition = input<Position>(Position.Bottom);
  readonly targetPosition = input<Position>(Position.Top);
  readonly data = input<{ text?: string }>();

  protected readonly path = computed(
    () =>
      getBezierPath({
        sourceX: this.sourceX(),
        sourceY: this.sourceY(),
        sourcePosition: this.sourcePosition(),
        targetX: this.targetX(),
        targetY: this.targetY(),
        targetPosition: this.targetPosition(),
      })[0]
  );
}
