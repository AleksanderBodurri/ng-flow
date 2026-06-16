import { isEdgeBase, isNodeBase } from '@xyflow/system';

import type { Edge, Node } from '../types';

/**
 * Test whether an object is usable as a {@link Node}. Acts as a TypeScript type guard.
 * @public
 */
export const isNode = <NodeType extends Node = Node>(element: unknown): element is NodeType =>
  isNodeBase<NodeType>(element);

/**
 * Test whether an object is usable as an {@link Edge}. Acts as a TypeScript type guard.
 * @public
 */
export const isEdge = <EdgeType extends Edge = Edge>(element: unknown): element is EdgeType =>
  isEdgeBase<EdgeType>(element);
