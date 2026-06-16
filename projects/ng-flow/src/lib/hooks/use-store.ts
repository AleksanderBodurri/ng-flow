import { inject, type Signal } from '@angular/core';

import { FlowStore } from '../store/flow-store';
import type { Edge, Node, ReactFlowState } from '../types';

/**
 * Subscribe to a slice of the flow's internal state. The ng-flow equivalent of React
 * Flow's `useStore(selector, equalityFn)` — but returns a `Signal<T>` instead of a value.
 *
 * Must be called in an injection context (field initializer / constructor) inside a flow.
 *
 * @public
 * @example
 * ```ts
 * readonly nodes = useStore((state) => state.nodes);
 * ```
 */
export function useStore<StateSlice = unknown>(
  selector: (state: ReactFlowState) => StateSlice,
  equalityFn?: (a: StateSlice, b: StateSlice) => boolean
): Signal<StateSlice> {
  return inject(FlowStore).select(selector as (s: ReactFlowState) => StateSlice, equalityFn);
}

/**
 * Access the flow store directly (its `getState` / `setState` / `subscribe` / `select`).
 * The ng-flow equivalent of React Flow's `useStoreApi()`. Returns the `FlowStore` service.
 *
 * @public
 */
export function useStoreApi<NodeType extends Node = Node, EdgeType extends Edge = Edge>(): FlowStore<
  NodeType,
  EdgeType
> {
  return inject(FlowStore) as unknown as FlowStore<NodeType, EdgeType>;
}

/** Alias for {@link useStoreApi} that reads naturally as Angular DI. */
export const injectStore = useStoreApi;
