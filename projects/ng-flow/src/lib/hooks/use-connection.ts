import type { Signal } from '@angular/core';
import { shallow } from 'zustand/shallow';
import { ConnectionState, pointToRendererPoint } from '@xyflow/system';

import { useStore } from './use-store';
import type { InternalNode, Node, ReactFlowStore } from '../types';

function storeSelector(s: ReactFlowStore) {
  return s.connection.inProgress
    ? { ...s.connection, to: pointToRendererPoint(s.connection.to, s.transform) }
    : { ...s.connection };
}

function getSelector<NodeType extends Node = Node, SelectorReturn = ConnectionState<InternalNode<NodeType>>>(
  connectionSelector?: (connection: ConnectionState<InternalNode<NodeType>>) => SelectorReturn
): (s: ReactFlowStore) => SelectorReturn | ConnectionState<InternalNode> {
  if (connectionSelector) {
    const combinedSelector = (s: ReactFlowStore) => {
      const connection = storeSelector(s) as ConnectionState<InternalNode<NodeType>>;
      return connectionSelector(connection);
    };
    return combinedSelector;
  }

  return storeSelector;
}

/**
 * The `useConnection` hook returns a `Signal` of the current connection while there is an
 * active connection interaction. If no interaction is active, the signal's value has `null`
 * for every property. A typical use case is colorizing handles based on the connection state.
 *
 * The ng-flow port of React Flow's `useConnection` — returns a `Signal` instead of the
 * value directly. Must be called in an injection context inside a flow.
 *
 * @public
 * @param connectionSelector - An optional selector to extract a slice of the `ConnectionState`
 * (avoids notifications when data you don't care about changes). If omitted, the entire
 * `ConnectionState` is returned.
 * @returns A `Signal` of the selected connection state.
 */
export function useConnection<
  NodeType extends Node = Node,
  SelectorReturn = ConnectionState<InternalNode<NodeType>>
>(
  connectionSelector?: (connection: ConnectionState<InternalNode<NodeType>>) => SelectorReturn
): Signal<SelectorReturn> {
  const combinedSelector = getSelector<NodeType, SelectorReturn>(connectionSelector);
  return useStore(combinedSelector, shallow) as Signal<SelectorReturn>;
}
