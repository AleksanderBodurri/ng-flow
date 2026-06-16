import { effect, isSignal, type Signal } from '@angular/core';
import type { NodeChange } from '@xyflow/system';

import { useStoreApi } from './use-store';
import type { Edge, Node } from '../types';

/** Accept either a plain value or a `Signal` of it. */
type ValueOrSignal<T> = T | Signal<T>;

type NodesChangeMiddlewareFn<NodeType extends Node = Node> = (
  changes: NodeChange<NodeType>[]
) => NodeChange<NodeType>[];

/**
 * Registers a middleware function that transforms node changes before they are applied.
 * The ng-flow port of React Flow's `experimental_useOnNodesChangeMiddleware`.
 *
 * A unique `Symbol` keys this registration in the store's `onNodesChangeMiddlewareMap`
 * (matching React's per-instance `useState(() => Symbol())`). An `effect()` (re)registers
 * `fn` and removes it on cleanup/destroy (via `DestroyRef`). `fn` may be a plain function or
 * a `Signal` of one — re-registration is automatic when it changes (no need to memoize).
 *
 * Must be called in an injection context inside a flow.
 *
 * @public
 * @param fn - Middleware function.
 */
export function experimental_useOnNodesChangeMiddleware<NodeType extends Node = Node>(
  fn: ValueOrSignal<NodesChangeMiddlewareFn<NodeType>>
): void {
  const store = useStoreApi<NodeType, Edge>();
  const symbol = Symbol();

  effect((onCleanup) => {
    const middleware = isSignal(fn) ? fn() : fn;
    const { onNodesChangeMiddlewareMap } = store.getState();
    onNodesChangeMiddlewareMap.set(symbol, middleware);

    onCleanup(() => {
      store.getState().onNodesChangeMiddlewareMap.delete(symbol);
    });
  });
}
