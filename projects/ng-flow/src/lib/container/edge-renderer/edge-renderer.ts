import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { shallow } from 'zustand/shallow';
import { isEdgeVisible, type OnReconnect } from '@xyflow/system';

import { EdgeWrapper, type EdgeMouseEvent } from '../../components/edge-wrapper/edge-wrapper';
import { MarkerDefinitions } from './marker-definitions';
import { FlowStore } from '../../store/flow-store';
import type {
  Edge,
  EdgeMouseHandler,
  EdgeTypes,
  Node,
  ReactFlowState,
} from '../../types';
import type { EdgeWrapperProps } from '../../types/edges';

const selector = (s: ReactFlowState) => ({
  edgesFocusable: s.edgesFocusable,
  edgesReconnectable: s.edgesReconnectable,
  elementsSelectable: s.elementsSelectable,
  connectionMode: s.connectionMode,
  onError: s.onError,
});

/**
 * Renders all visible edges plus the shared arrowhead marker `<defs>`. The Angular port of React Flow's
 * `EdgeRenderer` (container/EdgeRenderer/index.tsx).
 *
 * The **host is the `.react-flow__edges` div**. Inside it, {@link MarkerDefinitions} renders the markers,
 * then one {@link EdgeWrapper} (`<svg ng-flow-edge-wrapper>`) is rendered per visible edge id. Visible ids
 * come from {@link useVisibleEdgeIds}. The store-shared flags (`edgesFocusable`, `edgesReconnectable`,
 * `elementsSelectable`, `onError`) are read once here (React's `useStore(selector, shallow)`) and drilled
 * into each wrapper, exactly like React.
 *
 * React passed mouse callbacks (`onEdgeClick`, …) as props to `EdgeWrapper`. ng-flow's `EdgeWrapper`
 * exposes them as `output()`s, so here they are wired as event bindings that invoke the user callbacks
 * with `(event, edge)` — preserving the React call contract. `hasClickHandler` is forwarded so the wrapper
 * can reproduce React's `inactive: !isSelectable && !onClick`.
 *
 * @internal
 */
@Component({
  selector: 'div[ng-flow-edge-renderer]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EdgeWrapper, MarkerDefinitions],
  host: {
    'class': 'react-flow__edges',
  },
  template: `
    <svg ng-flow-marker-definitions [defaultColor]="defaultMarkerColor()" [rfId]="rfId()"></svg>

    @for (id of edgeIds(); track id) {
      <svg
        ng-flow-edge-wrapper
        [id]="id"
        [edgesFocusable]="flags().edgesFocusable"
        [edgesReconnectable]="flags().edgesReconnectable"
        [elementsSelectable]="flags().elementsSelectable"
        [noPanClassName]="noPanClassName()"
        [onReconnect]="onReconnect()"
        [reconnectRadius]="reconnectRadius()"
        [onReconnectStart]="onReconnectStart()"
        [onReconnectEnd]="onReconnectEnd()"
        [rfId]="rfId()"
        [onError]="flags().onError"
        [edgeTypes]="edgeTypes()"
        [disableKeyboardA11y]="disableKeyboardA11y()"
        [hasClickHandler]="!!onEdgeClick()"
        (edgeClick)="forward(onEdgeClick(), $event)"
        (edgeDoubleClick)="forward(onEdgeDoubleClick(), $event)"
        (edgeContextMenu)="forward(onEdgeContextMenu(), $event)"
        (edgeMouseEnter)="forward(onEdgeMouseEnter(), $event)"
        (edgeMouseMove)="forward(onEdgeMouseMove(), $event)"
        (edgeMouseLeave)="forward(onEdgeMouseLeave(), $event)"
      ></svg>
    }
  `,
})
export class EdgeRenderer<EdgeType extends Edge = Edge> {
  readonly defaultMarkerColor = input<string | null>(null);
  readonly onlyRenderVisibleElements = input<boolean>(false);
  readonly rfId = input<string>();
  readonly edgeTypes = input<EdgeTypes>();
  readonly noPanClassName = input<string>('');
  readonly reconnectRadius = input<EdgeWrapperProps['reconnectRadius']>();
  readonly disableKeyboardA11y = input<boolean>(false);

  // Reconnect callbacks — forwarded as references into each EdgeWrapper.
  readonly onReconnect = input<OnReconnect<EdgeType>>();
  readonly onReconnectStart = input<EdgeWrapperProps<EdgeType>['onReconnectStart']>();
  readonly onReconnectEnd = input<EdgeWrapperProps<EdgeType>['onReconnectEnd']>();

  // Mouse callbacks — React props; here invoked from each wrapper's outputs with `(event, edge)`.
  readonly onEdgeClick = input<(event: MouseEvent, edge: EdgeType) => void>();
  readonly onEdgeDoubleClick = input<EdgeMouseHandler<EdgeType>>();
  readonly onEdgeContextMenu = input<EdgeMouseHandler<EdgeType>>();
  readonly onEdgeMouseEnter = input<EdgeMouseHandler<EdgeType>>();
  readonly onEdgeMouseMove = input<EdgeMouseHandler<EdgeType>>();
  readonly onEdgeMouseLeave = input<EdgeMouseHandler<EdgeType>>();

  private readonly store = inject(FlowStore) as unknown as FlowStore<Node, EdgeType>;
  /** Base-typed view of the store for the shared selectors that operate on the generic `Edge` type. */
  private readonly baseStore = this.store as unknown as FlowStore;

  /** Store-shared edge flags — React's `useStore(selector, shallow)`. */
  protected readonly flags = this.baseStore.select(selector, shallow);

  /**
   * Visible edge ids — the port of `useVisibleEdgeIds(onlyRenderVisibleElements)`. The selector is
   * inlined (vs. calling the hook directly) so the `onlyRenderVisibleElements` *input* is read inside
   * the selector and stays reactive, since signal inputs aren't yet populated at field-init time.
   */
  protected readonly edgeIds = this.baseStore.select((s: ReactFlowState) => {
    if (!this.onlyRenderVisibleElements()) {
      return s.edges.map((edge) => edge.id);
    }

    const visibleEdgeIds: string[] = [];

    if (s.width && s.height) {
      for (const edge of s.edges) {
        const sourceNode = s.nodeLookup.get(edge.source);
        const targetNode = s.nodeLookup.get(edge.target);

        if (
          sourceNode &&
          targetNode &&
          isEdgeVisible({
            sourceNode,
            targetNode,
            width: s.width,
            height: s.height,
            transform: s.transform,
          })
        ) {
          visibleEdgeIds.push(edge.id);
        }
      }
    }

    return visibleEdgeIds;
  }, shallow);

  /** Invoke a user `(event, edge)` callback from a wrapper output, if one is wired. */
  protected forward(
    handler: ((event: MouseEvent, edge: EdgeType) => void) | undefined,
    payload: EdgeMouseEvent<EdgeType>
  ): void {
    handler?.(payload.event, payload.edge);
  }
}
