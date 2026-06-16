import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { type Node, useNodes, ViewportPortal } from 'ng-flow';

/**
 * Node Inspector overlay. Mirrors React Flow's DevTools `NodeInspector`:
 * reads the live `useNodes()` signal and renders, for every node, a small info box
 * positioned in flow (viewport) space just below the node — so it pans/zooms with
 * the graph. Boxes are drawn via `<ng-flow-viewport-portal>` (React's `<ViewportPortal>`).
 *
 * Dimensions come from `node.measured` (set by ng-flow once a node is measured); nodes
 * without a measured size are skipped, exactly as the React version returns `null`.
 */
@Component({
  selector: 'app-devtools-node-inspector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ViewportPortal, JsonPipe],
  template: `
    <ng-flow-viewport-portal>
      <div class="react-flow__devtools-nodeinspector">
        @for (info of infos(); track info.id) {
          <div
            class="react-flow__devtools-nodeinfo"
            [style.position]="'absolute'"
            [style.transform]="'translate(' + info.x + 'px, ' + (info.y + info.height) + 'px)'"
            [style.width.px]="info.width * 2"
          >
            <div>id: {{ info.id }}</div>
            <div>type: {{ info.type }}</div>
            <div>position: {{ info.x.toFixed(1) }}, {{ info.y.toFixed(1) }}</div>
            <div>dimensions: {{ info.width }} &times; {{ info.height }}</div>
            <div>data: {{ info.data | json }}</div>
          </div>
        }
      </div>
    </ng-flow-viewport-portal>
  `,
})
export class DevtoolsNodeInspector {
  private readonly nodes = useNodes();

  /** One info entry per measured node (unmeasured nodes are filtered out). */
  protected readonly infos = computed(() =>
    this.nodes()
      .map((node: Node) => ({
        id: node.id,
        type: node.type || 'default',
        x: node?.position?.x || 0,
        y: node?.position?.y || 0,
        width: node.measured?.width || 0,
        height: node.measured?.height || 0,
        data: node.data,
      }))
      .filter((info) => info.width && info.height)
  );
}
