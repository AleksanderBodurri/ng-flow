import { effect, isSignal, type Signal } from '@angular/core';
import type { EdgeChange } from '@xyflow/system';

import { useStoreApi } from './use-store';
import type { Edge, Node } from '../types';

/** Accept either a plain value or a `Signal` of it. */
type ValueOrSignal<T> = T | Signal<T>;

type EdgesChangeMiddlewareFn<EdgeType extends Edge = Edge> = (
  changes: EdgeChange<EdgeType>[]
) => EdgeChange<EdgeType>[];

/**
 * Registers a middleware function that transforms edge changes before they are applied.
 * The ng-flow port of React Flow's `experimental_useOnEdgesChangeMiddleware`.
 *
 * A unique `Symbol` keys this registration in the store's `onEdgesChangeMiddlewareMap`
 * (matching React's per-instance `useState(() => Symbol())`). An `effect()` (re)registers
 * `fn` and removes it on cleanup/destroy (via `DestroyRef`). `fn` may be a plain function or
 * a `Signal` of one — re-registration is automatic when it changes (no need to memoize).
 *
 * Must be called in an injection context inside a flow.
 *
 * @public
 * @param fn - Middleware function.
 */
export function experimental_useOnEdgesChangeMiddleware<EdgeType extends Edge = Edge>(
  fn: ValueOrSignal<EdgesChangeMiddlewareFn<EdgeType>>
): void {
  const store = useStoreApi<Node, EdgeType>();
  const symbol = Symbol();

  effect((onCleanup) => {
    const middleware = isSignal(fn) ? fn() : fn;
    const { onEdgesChangeMiddlewareMap } = store.getState();
    onEdgesChangeMiddlewareMap.set(symbol, middleware);

    onCleanup(() => {
      store.getState().onEdgesChangeMiddlewareMap.delete(symbol);
    });
  });
}
