import { effect, isSignal, type Signal } from '@angular/core';

import { useStoreApi } from './use-store';
import type { OnSelectionChangeFunc, Node, Edge } from '../types';

/** Accept either a plain value or a `Signal` of it. */
type ValueOrSignal<T> = T | Signal<T>;

export type UseOnSelectionChangeOptions<NodeType extends Node = Node, EdgeType extends Edge = Edge> = {
  /** The handler to register. */
  onChange: ValueOrSignal<OnSelectionChangeFunc<NodeType, EdgeType>>;
};

/**
 * Listens for changes to node and edge selection. The provided `onChange` is called whenever
 * the selection of either nodes or edges changes. The ng-flow port of React Flow's
 * `useOnSelectionChange`.
 *
 * Registers the handler into the store's `onSelectionChangeHandlers` array via an `effect()`
 * and removes it on cleanup (and on destroy via `DestroyRef`). `onChange` may be a plain
 * function or a `Signal` of one — re-registration happens automatically when it changes
 * (so, unlike React, you do not need to memoize it).
 *
 * Must be called in an injection context inside a flow.
 *
 * @public
 */
export function useOnSelectionChange<NodeType extends Node = Node, EdgeType extends Edge = Edge>({
  onChange,
}: UseOnSelectionChangeOptions<NodeType, EdgeType>): void {
  const store = useStoreApi<NodeType, EdgeType>();

  effect((onCleanup) => {
    const handler: OnSelectionChangeFunc<NodeType, EdgeType> = isSignal(onChange)
      ? (onChange() as OnSelectionChangeFunc<NodeType, EdgeType>)
      : onChange;
    const nextOnSelectionChangeHandlers = [...store.getState().onSelectionChangeHandlers, handler];
    store.setState({ onSelectionChangeHandlers: nextOnSelectionChangeHandlers });

    onCleanup(() => {
      const nextHandlers = store.getState().onSelectionChangeHandlers.filter((fn) => fn !== handler);
      store.setState({ onSelectionChangeHandlers: nextHandlers });
    });
  });
}
