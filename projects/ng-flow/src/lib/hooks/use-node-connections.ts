import { computed, effect, type Signal } from '@angular/core';
import {
  areConnectionMapsEqual,
  errorMessages,
  handleConnectionChange,
  type NodeConnection,
  type UseNodeConnectionsParams,
} from '@xyflow/system';

import { useStore } from './use-store';
import { useNodeId } from '../contexts/node-id';
import type { ReactFlowState } from '../types';

const error014 = errorMessages['error014']();

/**
 * This hook returns a `Signal` of the connections on a specific node, optionally filtered
 * by handle type (`'source'` / `'target'`) or handle id.
 *
 * The ng-flow port of React Flow's `useNodeConnections`. Must be called in an injection
 * context inside a node (it resolves the owning node id via `useNodeId()` when `id` is
 * omitted) — it both reads from the store and registers an `effect()` for the
 * `onConnect` / `onDisconnect` callbacks (React's `prevConnections` ref becomes a plain
 * closure variable). Cleanup is automatic via the surrounding `DestroyRef`.
 *
 * @public
 * @returns A `Signal<NodeConnection[]>`.
 *
 * @example
 * ```ts
 * readonly connections = useNodeConnections({ handleType: 'target', handleId: 'my-handle' });
 * ```
 */
export function useNodeConnections({
  id,
  handleType,
  handleId,
  onConnect,
  onDisconnect,
}: UseNodeConnectionsParams = {}): Signal<NodeConnection[]> {
  const nodeId = useNodeId();
  const currentNodeId = id ?? nodeId;

  if (!currentNodeId) {
    throw new Error(error014);
  }

  const connections = useStore(
    (state: ReactFlowState) =>
      state.connectionLookup.get(
        `${currentNodeId}${handleType ? (handleId ? `-${handleType}-${handleId}` : `-${handleType}`) : ''}`
      ),
    areConnectionMapsEqual
  );

  // React's `useRef<Map | null>(null)` — non-reactive imperative state, so a plain variable.
  let prevConnections: Map<string, NodeConnection> | null = null;

  effect(() => {
    const next = connections();
    // @todo discuss if onConnect/onDisconnect should be called when the component mounts/unmounts
    if (prevConnections && prevConnections !== next) {
      const _connections = next ?? new Map();
      handleConnectionChange(prevConnections, _connections, onDisconnect);
      handleConnectionChange(_connections, prevConnections, onConnect);
    }

    prevConnections = next ?? new Map();
  });

  return computed(() => Array.from(connections()?.values() ?? []));
}
