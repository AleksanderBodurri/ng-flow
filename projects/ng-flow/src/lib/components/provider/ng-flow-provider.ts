import { ChangeDetectionStrategy, Component, inject, input, type OnInit } from '@angular/core';
import type { CoordinateExtent, NodeOrigin, ZIndexMode } from '@xyflow/system';

import { FlowStore } from '../../store/flow-store';
import { provideFlow } from '../../store/provide-flow';
import type { Edge, FitViewOptions, Node } from '../../types';

/**
 * Shares a single flow store with components rendered outside of `<ng-flow>`.
 *
 * Wrap `<ng-flow>` (and any siblings that use `injectFlow()` / `injectStore()`) in
 * `<ng-flow-provider>` to give them access to the same internal state. The Angular
 * port of React Flow's `ReactFlowProvider`.
 *
 * @public
 */
@Component({
  selector: 'ng-flow-provider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideFlow()],
  // display:contents so the provider is layout-transparent (like React's context-only
  // provider) — the wrapped <ng-flow> sizes to the provider's parent.
  host: { style: 'display: contents' },
  template: '<ng-content />',
})
export class NgFlowProvider implements OnInit {
  private readonly flowStore = inject(FlowStore);

  readonly initialNodes = input<Node[]>();
  readonly initialEdges = input<Edge[]>();
  readonly defaultNodes = input<Node[]>();
  readonly defaultEdges = input<Edge[]>();
  readonly initialWidth = input<number>();
  readonly initialHeight = input<number>();
  readonly fitView = input<boolean>();
  readonly initialFitViewOptions = input<FitViewOptions>();
  readonly initialMinZoom = input<number>();
  readonly initialMaxZoom = input<number>();
  readonly nodeOrigin = input<NodeOrigin>();
  readonly nodeExtent = input<CoordinateExtent>();
  readonly zIndexMode = input<ZIndexMode>();

  ngOnInit(): void {
    this.flowStore.initialize({
      nodes: this.initialNodes(),
      edges: this.initialEdges(),
      defaultNodes: this.defaultNodes(),
      defaultEdges: this.defaultEdges(),
      width: this.initialWidth(),
      height: this.initialHeight(),
      fitView: this.fitView(),
      fitViewOptions: this.initialFitViewOptions(),
      minZoom: this.initialMinZoom(),
      maxZoom: this.initialMaxZoom(),
      nodeOrigin: this.nodeOrigin(),
      nodeExtent: this.nodeExtent(),
      zIndexMode: this.zIndexMode(),
    });
  }
}
