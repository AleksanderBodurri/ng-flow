import type { UpdateNodeInternals, InternalNodeUpdate } from '@xyflow/system';

import { useStoreApi } from './use-store';

/**
 * Returns a function that tells ng-flow to update the internal state of one or more nodes
 * after you have programmatically added/removed handles or changed a handle position. The
 * ng-flow port of React Flow's `useUpdateNodeInternals`.
 *
 * The returned callback builds an `InternalNodeUpdate` map (`force: true`) by querying the
 * DOM for `.react-flow__node[data-id="..."]` within the flow's `domNode`, then calls
 * `updateNodeInternals` inside `requestAnimationFrame`. Reads live state via `getState()`.
 *
 * Must be called in an injection context inside a flow.
 *
 * @public
 * @returns `(id: string | string[]) => void`.
 */
export function useUpdateNodeInternals(): UpdateNodeInternals {
  const store = useStoreApi();

  return ((id: string | string[]) => {
    const { domNode, updateNodeInternals } = store.getState();
    const updateIds = Array.isArray(id) ? id : [id];
    const updates = new Map<string, InternalNodeUpdate>();

    updateIds.forEach((updateId) => {
      const nodeElement = domNode?.querySelector(`.react-flow__node[data-id="${updateId}"]`) as HTMLDivElement;

      if (nodeElement) {
        updates.set(updateId, { id: updateId, nodeElement, force: true });
      }
    });

    requestAnimationFrame(() => updateNodeInternals(updates, { triggerFitView: false }));
  }) as UpdateNodeInternals;
}
