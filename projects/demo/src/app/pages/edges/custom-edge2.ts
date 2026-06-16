import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BaseEdge, EdgeText, getBezierPath, Position } from 'ng-flow';

/**
 * React `Edges/CustomEdge2`: a bezier BaseEdge plus an `EdgeText` label with a red
 * background. Clicking the label logs the edge data (React's `onClick`).
 */
@Component({
  selector: 'app-edges-custom-edge2',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseEdge, EdgeText],
  template: `
    <svg:g ng-flow-base-edge [id]="id()" [path]="path()" />
    <svg:g
      ng-flow-edge-text
      [x]="labelX()"
      [y]="labelY()"
      [label]="data()?.text"
      [labelStyle]="{ fill: 'white' }"
      [labelShowBg]="true"
      [labelBgStyle]="{ fill: 'red' }"
      [labelBgPadding]="[2, 4]"
      [labelBgBorderRadius]="2"
      (click)="onLabelClick()"
    />
  `,
})
export class CustomEdge2 {
  readonly id = input<string>();
  readonly sourceX = input.required<number>();
  readonly sourceY = input.required<number>();
  readonly targetX = input.required<number>();
  readonly targetY = input.required<number>();
  readonly sourcePosition = input<Position>(Position.Bottom);
  readonly targetPosition = input<Position>(Position.Top);
  readonly data = input<{ text?: string }>();

  private readonly pathData = computed(() =>
    getBezierPath({
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
