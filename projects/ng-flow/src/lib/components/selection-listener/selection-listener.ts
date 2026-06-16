/*
 * This is a helper component for calling the onSelectionChange listener.
 * It mirrors React Flow's internal `<SelectionListener />`: it fans selection
 * changes out to the `onSelectionChange` input AND to every handler registered in
 * the store (via the `useOnSelectionChange` equivalent). It renders nothing.
 */
import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { shallow } from 'zustand/shallow';

import { FlowStore } from '../../store/flow-store';
import type { Edge, Node, OnSelectionChangeFunc, ReactFlowState } from '../../types';

const selector = (s: ReactFlowState) => {
  const selectedNodes: Node[] = [];
  const selectedEdges: Edge[] = [];

  for (const [, node] of s.nodeLookup) {
    if (node.selected) {
      selectedNodes.push(node.internals.userNode);
    }
  }

  for (const [, edge] of s.edgeLookup) {
    if (edge.selected) {
      selectedEdges.push(edge);
    }
  }

  return { selectedNodes, selectedEdges };
};

type SelectorSlice = ReturnType<typeof selector>;

const selectId = (obj: Node | Edge) => obj.id;

function areEqual(a: SelectorSlice, b: SelectorSlice): boolean {
  return (
    shallow(a.selectedNodes.map(selectId), b.selectedNodes.map(selectId)) &&
    shallow(a.selectedEdges.map(selectId), b.selectedEdges.map(selectId))
  );
}

const changeSelector = (s: ReactFlowState) => !!s.onSelectionChangeHandlers;

/**
 * Behavioral component that calls `onSelectionChange` (and the store-registered
 * handlers) whenever the set of selected nodes/edges changes. Renders nothing.
 */
@Component({
  selector: 'ng-flow-selection-listener',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export class SelectionListener {
  private readonly store = inject(FlowStore);

  /** Optional callback fired with the current selection whenever it changes. */
  readonly onSelectionChange = input<OnSelectionChangeFunc>();

  /**
   * Selected nodes/edges, deduped by id arrays with the same custom equality as
   * React's `useStore(selector, areEqual)` — so the signal only changes identity
   * when the selected *ids* change.
   */
  private readonly selected = this.store.select(selector, areEqual);

  /**
   * Mirrors React's `changeSelector` gate. `onSelectionChangeHandlers` is always an
   * array, so this is truthy whenever the store exists — matching the source, where
   * the inner listener is effectively always mounted.
   */
  private readonly storeHasSelectionChangeHandlers = this.store.select(changeSelector);

  constructor() {
    effect(() => {
      // Track all three the way React's effect deps do: the deduped selection, the
      // callback input, and the gate. The store handler list is read imperatively at
      // fire time (matching `store.getState().onSelectionChangeHandlers.forEach`).
      const { selectedNodes, selectedEdges } = this.selected();
      const onSelectionChange = this.onSelectionChange();
      const active = onSelectionChange != null || this.storeHasSelectionChangeHandlers();

      if (!active) {
        return;
      }

      const params = { nodes: selectedNodes, edges: selectedEdges };

      onSelectionChange?.(params);
      this.store.getState().onSelectionChangeHandlers.forEach((fn) => fn(params));
    });
  }
}
