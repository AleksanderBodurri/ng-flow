import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { shallow } from 'zustand/shallow';
import { getNodesInside, type CoordinateExtent } from '@xyflow/system';

import { NodeWrapper } from '../../components/node-wrapper/node-wrapper';
import { FlowStore } from '../../store/flow-store';
import { containerStyle } from '../../styles/utils';
import { useResizeObserver } from './use-resize-observer';
import type { Node, NodeMouseHandler, NodeTypes, ReactFlowState } from '../../types';

const selector = (s: ReactFlowState) => ({
  nodesDraggable: s.nodesDraggable,
  nodesConnectable: s.nodesConnectable,
  nodesFocusable: s.nodesFocusable,
  elementsSelectable: s.elementsSelectable,
  onError: s.onError,
});

/**
 * Renders all visible nodes. The Angular port of React Flow's `NodeRenderer`
 * (container/NodeRenderer/index.tsx).
 *
 * The **host is the `.react-flow__nodes` div** (full-bleed `containerStyle`). One {@link NodeWrapper}
 * (`<ng-flow-node-wrapper>`) is rendered per visible node id. As in React, this renderer does all the
 * work that can be *shared* between nodes — it subscribes once to the shared flags
 * (`nodesDraggable`/`nodesConnectable`/`nodesFocusable`/`elementsSelectable`/`onError`) and creates the
 * single shared `ResizeObserver` ({@link useResizeObserver}) — then drills them into each wrapper. The
 * heavy per-node logic lives inside `NodeWrapper`, so this component only re-renders the `@for` list when
 * the set of visible node ids changes.
 *
 * The per-node mouse callbacks are `NodeWrapper` function inputs (matching ng-flow's `NodeWrapper`), so
 * they're forwarded directly as inputs rather than wired as outputs.
 *
 * @internal
 */
@Component({
  selector: 'div[ng-flow-node-renderer]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NodeWrapper],
  host: {
    'class': 'react-flow__nodes',
    '[style]': 'containerStyle',
  },
  template: `
    @for (id of nodeIds(); track id) {
      <ng-flow-node-wrapper
        [id]="id"
        [nodeTypes]="nodeTypes()"
        [nodeExtent]="nodeExtent()"
        [onClick]="onNodeClick()"
        [onMouseEnter]="onNodeMouseEnter()"
        [onMouseMove]="onNodeMouseMove()"
        [onMouseLeave]="onNodeMouseLeave()"
        [onContextMenu]="onNodeContextMenu()"
        [onDoubleClick]="onNodeDoubleClick()"
        [noDragClassName]="noDragClassName()"
        [noPanClassName]="noPanClassName()"
        [rfId]="rfId()"
        [disableKeyboardA11y]="disableKeyboardA11y()"
        [resizeObserver]="resizeObserver"
        [nodesDraggable]="flags().nodesDraggable"
        [nodesConnectable]="flags().nodesConnectable"
        [nodesFocusable]="flags().nodesFocusable"
        [elementsSelectable]="flags().elementsSelectable"
        [nodeClickDistance]="nodeClickDistance()"
        [onError]="flags().onError"
      />
    }
  `,
})
export class NodeRenderer<NodeType extends Node = Node> {
  readonly onlyRenderVisibleElements = input<boolean>(false);
  readonly noPanClassName = input<string>('');
  readonly noDragClassName = input<string>('');
  readonly rfId = input<string>('');
  readonly disableKeyboardA11y = input<boolean>(false);
  readonly nodeExtent = input<CoordinateExtent>();
  readonly nodeTypes = input<NodeTypes>();
  readonly nodeClickDistance = input<number>();

  // Per-node mouse callbacks — React props; NodeWrapper consumes them as function inputs.
  readonly onNodeClick = input<NodeMouseHandler<NodeType>>();
  readonly onNodeDoubleClick = input<NodeMouseHandler<NodeType>>();
  readonly onNodeMouseEnter = input<NodeMouseHandler<NodeType>>();
  readonly onNodeMouseMove = input<NodeMouseHandler<NodeType>>();
  readonly onNodeMouseLeave = input<NodeMouseHandler<NodeType>>();
  readonly onNodeContextMenu = input<NodeMouseHandler<NodeType>>();

  protected readonly containerStyle = containerStyle;

  private readonly store = inject(FlowStore);

  /** Store-shared node flags — React's `useStore(selector, shallow)`. */
  protected readonly flags = this.store.select(selector, shallow);

  /** The single shared `ResizeObserver` drilled into every `NodeWrapper`. */
  protected readonly resizeObserver = useResizeObserver();

  /**
   * Visible node ids — the port of `useVisibleNodeIds(onlyRenderVisibleElements)`. The selector is
   * inlined (vs. calling the hook directly) so the `onlyRenderVisibleElements` *input* is read inside
   * the selector and stays reactive, since signal inputs aren't yet populated at field-init time.
   */
  protected readonly nodeIds = this.store.select((s: ReactFlowState) => {
    return this.onlyRenderVisibleElements()
      ? getNodesInside<Node>(s.nodeLookup, { x: 0, y: 0, width: s.width, height: s.height }, s.transform, true).map(
          (node) => node.id
        )
      : Array.from(s.nodeLookup.keys());
  }, shallow);
}
