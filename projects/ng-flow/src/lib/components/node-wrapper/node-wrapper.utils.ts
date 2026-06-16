import type { XYPosition } from '@xyflow/system';

import { DefaultNode } from '../nodes/default-node';
import { GroupNode } from '../nodes/group-node';
import { InputNode } from '../nodes/input-node';
import { OutputNode } from '../nodes/output-node';
import type { InternalNode, Node, NodeTypes } from '../../types';

/** Per-key position delta applied when moving a selected node with the arrow keys. */
export const arrowKeyDiffs: Record<string, XYPosition> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

/**
 * Maps each built-in node `type` string to the Angular component that renders it.
 * The Angular port of React Flow's `builtinNodeTypes` (NodeWrapper/utils.tsx).
 */
export const builtinNodeTypes: NodeTypes = {
  input: InputNode,
  default: DefaultNode,
  output: OutputNode,
  group: GroupNode,
};

/**
 * Computes the inline `width`/`height` written onto a node's host element before/after its
 * handle bounds have been measured. The Angular port of React Flow's `getNodeInlineStyleDimensions`.
 */
export function getNodeInlineStyleDimensions<NodeType extends Node = Node>(
  node: InternalNode<NodeType>
): {
  width: number | string | null | undefined;
  height: number | string | null | undefined;
} {
  if (node.internals.handleBounds === undefined) {
    return {
      width: node.width ?? node.initialWidth ?? node.style?.['width'],
      height: node.height ?? node.initialHeight ?? node.style?.['height'],
    };
  }

  return {
    width: node.width ?? node.style?.['width'],
    height: node.height ?? node.style?.['height'],
  };
}
