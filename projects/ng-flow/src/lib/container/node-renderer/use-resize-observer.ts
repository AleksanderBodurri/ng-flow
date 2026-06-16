import { DestroyRef, inject } from '@angular/core';
import type { InternalNodeUpdate } from '@xyflow/system';

import { useStoreApi } from '../../hooks/use-store';

/**
 * Creates the single shared `ResizeObserver` used by the node renderer for all nodes. The ng-flow port
 * of React Flow's `useResizeObserver` (container/NodeRenderer/useResizeObserver.ts).
 *
 * The observer's callback builds a `Map<string, InternalNodeUpdate>` keyed by each entry's `data-id`
 * (`{ id, nodeElement, force: true }`) and calls the store's `updateNodeInternals`. One observer is
 * created and reused across every `NodeWrapper` (passed down as the `resizeObserver` input) — this is the
 * key perf decision from React: shared work lives in the renderer, not per-node. Returns the observer (or
 * `null` in environments without `ResizeObserver`, e.g. SSR). Disconnected on destroy via `DestroyRef`.
 *
 * Must be called in an injection context inside a flow.
 *
 * @internal
 */
export function useResizeObserver(): ResizeObserver | null {
  const store = useStoreApi();
  const destroyRef = inject(DestroyRef);

  if (typeof ResizeObserver === 'undefined') {
    return null;
  }

  const resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
    const updates = new Map<string, InternalNodeUpdate>();
    entries.forEach((entry: ResizeObserverEntry) => {
      const id = entry.target.getAttribute('data-id') as string;
      updates.set(id, {
        id,
        nodeElement: entry.target as HTMLDivElement,
        force: true,
      });
    });

    store.getState().updateNodeInternals(updates);
  });

  destroyRef.onDestroy(() => resizeObserver.disconnect());

  return resizeObserver;
}
