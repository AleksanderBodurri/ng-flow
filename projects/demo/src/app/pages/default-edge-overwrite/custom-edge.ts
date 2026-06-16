import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { getBezierPath } from 'ng-flow';

/**
 * Mirrors the React `CustomEdge` in DefaultEdgeOverwrite: a bare red dashed bezier path
 * (no BaseEdge), registered as the `default` edge type. The single edge uses an
 * `unregistered` type which falls back to `default`, so it renders with this component.
 */
@Component({
  selector: 'app-default-edge-overwrite-edge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg:path
      [attr.d]="path()"
      stroke="red"
      [attr.stroke-width]="3"
      fill="none"
      stroke-dasharray="5,5"
    />
  `,
})
export class CustomEdge {
  readonly sourceX = input.required<number>();
  readonly sourceY = input.required<number>();
  readonly targetX = input.required<number>();
  readonly targetY = input.required<number>();

  protected readonly path = computed(
    () =>
      getBezierPath({
        sourceX: this.sourceX(),
        sourceY: this.sourceY(),
        targetX: this.targetX(),
        targetY: this.targetY(),
      })[0]
  );
}
