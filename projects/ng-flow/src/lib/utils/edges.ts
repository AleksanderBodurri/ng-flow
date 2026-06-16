import {
  addEdge as addEdgeSystem,
  createDevWarn,
  reconnectEdge as reconnectEdgeSystem,
  type AddEdgeOptions,
  type Connection,
  type EdgeBase,
  type ReconnectEdgeOptions,
} from '@xyflow/system';

const defaultOnError = createDevWarn('ng-flow', 'https://reactflow.dev/');

/**
 * Adds a new edge (from an edge object or a {@link Connection}) to an edges array.
 * @public
 */
export function addEdge<EdgeType extends EdgeBase>(
  edgeParams: EdgeType | Connection,
  edges: EdgeType[],
  options: AddEdgeOptions = {}
): EdgeType[] {
  return addEdgeSystem(edgeParams, edges, {
    ...options,
    onError: options.onError ?? defaultOnError,
  });
}

/**
 * Reconnects an existing edge to a new source/target {@link Connection}.
 * @public
 */
export function reconnectEdge<EdgeType extends EdgeBase>(
  oldEdge: EdgeType,
  newConnection: Connection,
  edges: EdgeType[],
  options: ReconnectEdgeOptions = { shouldReplaceId: true }
): EdgeType[] {
  return reconnectEdgeSystem(oldEdge, newConnection, edges, {
    ...options,
    onError: options.onError ?? defaultOnError,
  });
}
