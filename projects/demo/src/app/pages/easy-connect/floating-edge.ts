import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { type CSSProperties, getStraightPath, injectStore } from 'ng-flow';

import { getEdgeParams } from './utils';

@Component({
  selector: 'app-easy-connect-edge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (path(); as p) {
      <svg:path
        [attr.id]="id()"
        class="react-flow__edge-path"
        [attr.d]="p"
        [attr.marker-end]="markerEnd()"
        [style]="style()"
      />
    }
  `,
})
export class EasyConnectEdge {
  readonly id = input<string>();
  readonly source = input<string>('');
  readonly target = input<string>('');
  readonly markerEnd = input<string>();
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

    const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode);

    return getStraightPath({
      sourceX: sx,
      sourceY: sy,
      targetX: tx,
      targetY: ty,
    })[0];
  });
}
