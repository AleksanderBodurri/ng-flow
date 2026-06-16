import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { EdgeText, getSmoothStepPath, Position } from 'ng-flow';

/**
 * React `Edges/CustomEdge3`: a smoothstep edge with `pathLength={100}` so the dash
 * animation (defined in the global CSS below, keyed on the `.react-flow__edge-custom3`
 * group class the edge wrapper applies) draws the whole edge once on mount. Plus an
 * `EdgeText` label slightly above the midpoint.
 *
 * React used `<BaseEdge pathLength={100} />`, but `pathLength` is not a BaseEdge input, so
 * the visible + interaction paths are rendered directly here (mirroring BaseEdge's markup).
 * The `react-flow__edge-path` class keeps the default edge styling; the dash presentation
 * attributes (`stroke-dasharray` / `stroke-dashoffset`) are inherited from the group via the
 * unencapsulated CSS, and `pathLength="100"` normalizes the dash to the full edge length.
 */
@Component({
  selector: 'app-edges-custom-edge3',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [EdgeText],
  template: `
    <svg:path
      [attr.id]="id()"
      [attr.d]="path()"
      class="react-flow__edge-path"
      fill="none"
      [attr.pathLength]="100"
    />
    <svg:path
      [attr.d]="path()"
      fill="none"
      [attr.stroke-opacity]="0"
      [attr.stroke-width]="20"
      class="react-flow__edge-interaction"
    />
    <svg:g
      ng-flow-edge-text
      [x]="labelX()"
      [y]="labelY() - 5"
      [label]="data()?.text"
      [labelBgStyle]="{ fill: 'transparent' }"
      (click)="onLabelClick()"
    />
  `,
  styles: [
    `
      @keyframes react-flow-edge-dash {
        from {
          stroke-dashoffset: 100;
        }
        to {
          stroke-dashoffset: 0;
        }
      }

      .react-flow__edge-custom3 {
        stroke-dasharray: 100;
        stroke-dashoffset: 100;
        animation: react-flow-edge-dash 1s linear forwards;
      }
    `,
  ],
})
export class CustomEdge3 {
  readonly id = input<string>();
  readonly sourceX = input.required<number>();
  readonly sourceY = input.required<number>();
  readonly targetX = input.required<number>();
  readonly targetY = input.required<number>();
  readonly sourcePosition = input<Position>(Position.Bottom);
  readonly targetPosition = input<Position>(Position.Top);
  readonly data = input<{ text?: string }>();

  private readonly pathData = computed(() =>
    getSmoothStepPath({
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

  protected onLabelClick(): void {
    console.log(this.data());
  }
}
