import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { type CSSProperties, getStraightPath } from 'ng-flow';

@Component({
  selector: 'app-easy-connect-connection-line',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg:g>
      <svg:path [style]="connectionLineStyle()" fill="none" [attr.d]="edgePath()" />
      <svg:circle [attr.cx]="toX()" [attr.cy]="toY()" fill="black" [attr.r]="3" stroke="black" [attr.stroke-width]="1.5" />
    </svg:g>
  `,
})
export class EasyConnectConnectionLine {
  readonly fromX = input(0);
  readonly fromY = input(0);
  readonly toX = input(0);
  readonly toY = input(0);
  readonly connectionLineStyle = input<CSSProperties>();

  protected readonly edgePath = computed(
    () =>
      getStraightPath({
        sourceX: this.fromX(),
        sourceY: this.fromY(),
        targetX: this.toX(),
        targetY: this.toY(),
      })[0]
  );
}
