import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { type CSSProperties, getBezierPath, injectStore } from 'ng-flow';

import { getEdgeParams } from './utils';

@Component({
  selector: 'app-floating-edges-edge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (path(); as p) {
      <svg:g class="react-flow__connection">
        <svg:path [attr.id]="id()" class="react-flow__edge-path" [attr.d]="p" [style]="style()" />
      </svg:g>
    }
  `,
})
export class FloatingEdgesEdge {
  readonly id = input<string>();
  readonly source = input<string>('');
  readonly target = input<string>('');
  readonly style = input<CSSProperties>();

  private readonly store = injectStore();

  private readonly nodes = computed(() => {
    const s = this.store.state();
    return {
      sourceNode: s.nodeLookup.get(this.source()),
      targetNode: s.nodeLookup.get(this.target()),
    };
  });

  protected readonly path = computed(() => {
    const { sourceNode, targetNode } = this.nodes();
    if (!sourceNode || !targetNode) {
      return null;
    }

    const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);

    return getBezierPath({
      sourceX: sx,
      sourceY: sy,
      sourcePosition: sourcePos,
      targetPosition: targetPos,
      targetX: tx,
      targetY: ty,
    })[0];
  });
}
