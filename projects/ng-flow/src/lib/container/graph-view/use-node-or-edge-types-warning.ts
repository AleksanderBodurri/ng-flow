import { effect, isDevMode, type Signal } from '@angular/core';
import { errorMessages } from '@xyflow/system';

import { useStoreApi } from '../../hooks/use-store';
import type { EdgeTypes, NodeTypes } from '../../types';

const emptyTypes = {};

/**
 * Warns (dev only) when the `nodeTypes`/`edgeTypes` object identity changes between renders — a common
 * mistake that recreates all components. The ng-flow port of React Flow's `useNodeOrEdgeTypesWarning`
 * (container/GraphView/useNodeOrEdgeTypesWarning.ts).
 *
 * Accepts a `Signal` of the types object (so it can react to changes); an `effect()` compares the new
 * object against the previous one (plain field, React's `useRef`) key-by-key and calls `onError('002')`
 * on a mismatch. No-op outside dev mode. Must be called in an injection context inside a flow.
 *
 * @internal
 */
export function useNodeOrEdgeTypesWarning(nodeOrEdgeTypes: Signal<NodeTypes | EdgeTypes | undefined>): void {
  const store = useStoreApi();

  /*
   * React's `useRef(nodeOrEdgeTypes)` captures the initial prop value at first render. In Angular,
   * inputs aren't readable at construction, so seed `prev` lazily on the first effect run (when the
   * input IS set) and skip the comparison that run — matching React's "first render = no change".
   */
  let prev: Record<string, unknown> | undefined;

  effect(() => {
    const current = (nodeOrEdgeTypes() as Record<string, unknown>) ?? emptyTypes;

    if (!isDevMode()) {
      return;
    }

    if (prev === undefined) {
      prev = current;
      return;
    }

    const usedKeys = new Set([...Object.keys(prev), ...Object.keys(current)]);

    for (const key of usedKeys) {
      if (prev[key] !== current[key]) {
        store.getState().onError?.('002', errorMessages['error002']());
        break;
      }
    }

    prev = current;
  });
}
