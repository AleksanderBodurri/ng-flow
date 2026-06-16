import { ChangeDetectionStrategy, Component } from '@angular/core';
import { type Node, type ReactFlowState, useReactFlow, useStore } from 'ng-flow';

/**
 * React `Provider/Sidebar`: lives OUTSIDE the `<ng-flow>` (but inside the provider) and reads the
 * flow's internal state live via `useStore` — the zoom/pan `transform` and each node's current
 * position (which update in real time as you pan/zoom or drag nodes). The "select all" button
 * uses `useReactFlow().setNodes` to mark every node selected.
 *
 * `useStore(selector)` returns a `Signal`, so the template reads `nodeInfos()` / `transform()`.
 */
@Component({
  selector: 'app-provider-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="aside">
      <div class="description">
        This is an example of how you can access the internal state outside of the ng-flow component.
      </div>
      <div class="title">Zoom & pan transform</div>
      <div class="transform">
        [{{ transform()[0].toFixed(2) }}, {{ transform()[1].toFixed(2) }}, {{ transform()[2].toFixed(2) }}]
      </div>
      <div class="title">Nodes</div>
      @for (info of nodeInfos(); track $index) {
        <div>{{ info }}</div>
      }

      <div class="selectall">
        <button type="button" (click)="selectAll()">select all nodes</button>
      </div>
    </aside>
  `,
  styles: [
    `
      .aside {
        border-right: 1px solid #eee;
        padding: 15px 10px;
        font-size: 12px;
        background: #fcfcfc;
      }

      .description {
        margin-bottom: 10px;
      }

      .title {
        font-weight: 700;
        margin-bottom: 5px;
      }

      .transform {
        margin-bottom: 20px;
      }

      .selectall {
        margin-top: 10px;
      }
    `,
  ],
})
export class ProviderSidebar {
  private readonly flow = useReactFlow();

  protected readonly nodeInfos = useStore((store: ReactFlowState) =>
    store.nodes.map((n) => `Node ${n.id} - x: ${n.position.x.toFixed(2)}, y: ${n.position.y.toFixed(2)}`)
  );

  protected readonly transform = useStore((store: ReactFlowState) => store.transform);

  protected selectAll(): void {
    this.flow.setNodes((nodes: Node[]) => nodes.map((n) => ({ ...n, selected: true })));
  }
}
