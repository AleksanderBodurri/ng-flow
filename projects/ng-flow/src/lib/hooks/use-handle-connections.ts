import { computed, effect, type Signal } from '@angular/core';
import {
  Connection,
  HandleConnection,
  HandleType,
  areConnectionMapsEqual,
  handleConnectionChange,
} from '@xyflow/system';

import { useStore } from './use-store';
import { useNodeId } from '../contexts/node-id';
import type { ReactFlowState } from '../types';

export type UseHandleConnectionsParams = {
  /** What type of handle connections do you want to observe? */
  type: HandleType;
  /** The handle id (this is only needed if the node has multiple handles of the same type). */
  id?: string | null;
  /** If node id is not provided, the node id from the node-id context is used. */
  nodeId?: string;
  /** Gets called when a connection is established. */
  onConnect?: (connections: Connection[]) => void;
  /** Gets called when a connection is removed. */
  onDisconnect?: (connections: Connection[]) => void;
};

/**
 * Check if a `Handle` is connected to another `Handle` and get the connections as a `Signal`.
 *
 * The ng-flow port of React Flow's `useHandleConnections`. Must be called in an injection
 * context inside a node — it reads the store and registers an `effect()` for the
 * `onConnect` / `onDisconnect` callbacks. Cleanup is automatic via `DestroyRef`.
 *
 * @public
 * @deprecated Use {@link useNodeConnections} instead.
 * @returns A `Signal<HandleConnection[]>`.
 */
export function useHandleConnections({
  type,
  id,
  nodeId,
  onConnect,
  onDisconnect,
}: UseHandleConnectionsParams): Signal<HandleConnection[]> {
  console.warn(
    '[DEPRECATED] `useHandleConnections` is deprecated. Instead use `useNodeConnections` https://reactflow.dev/api-reference/hooks/useNodeConnections'
  );

  const _nodeId = useNodeId();
  const currentNodeId = nodeId ?? _nodeId;

  const connections = useStore(
    (state: ReactFlowState) => state.connectionLookup.get(`${currentNodeId}-${type}${id ? `-${id}` : ''}`),
    areConnectionMapsEqual
  );

  // React's `useRef<Map | null>(null)` — non-reactive imperative state, so a plain variable.
  let prevConnections: Map<string, HandleConnection> | null = null;

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
