import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { getBezierPath, type InternalNode, Position } from 'ng-flow';

import { getEdgeParams } from './utils';

@Component({
  selector: 'app-floating-edges-connection-line',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (path(); as p) {
      <svg:g>
        <svg:path fill="none" stroke="#222" [attr.stroke-width]="1.5" class="animated" [attr.d]="p" />
        <svg:circle [attr.cx]="toX()" [attr.cy]="toY()" fill="#fff" [attr.r]="3" stroke="#222" [attr.stroke-width]="1.5" />
      </svg:g>
    }
  `,
})
export class FloatingEdgesConnectionLine {
  readonly toX = input(0);
  readonly toY = input(0);
  readonly fromPosition = input<Position>(Position.Bottom);
  readonly toPosition = input<Position>(Position.Top);
  readonly fromNode = input<InternalNode>();

  protected readonly path = computed(() => {
    const fromNode = this.fromNode();
    if (!fromNode) {
      return null;
    }

    const targetNode = {
      id: 'connection-target',
      measured: { width: 1, height: 1 },
      internals: { positionAbsolute: { x: this.toX(), y: this.toY() } },
    } as unknown as InternalNode;

    const { sx, sy } = getEdgeParams(fromNode, targetNode);

    return getBezierPath({
      sourceX: sx,
      sourceY: sy,
      sourcePosition: this.fromPosition(),
      targetPosition: this.toPosition(),
      targetX: this.toX(),
      targetY: this.toY(),
    })[0];
  });
}
