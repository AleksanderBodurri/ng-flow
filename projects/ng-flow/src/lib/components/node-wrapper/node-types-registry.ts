import type { Type } from '@angular/core';
import { errorMessages, type OnError } from '@xyflow/system';

import type { NodeTypes } from '../../types';
import { builtinNodeTypes } from './node-wrapper.utils';

/** The resolved node component plus the effective type string used for the node's CSS class. */
export type ResolvedNodeType = {
  /** The component class to render for this node. */
  component: Type<unknown>;
  /**
   * The effective node type. Equals the requested type when it resolves, otherwise `'default'`
   * (matching React Flow falling back to the default node when a type is unknown).
   */
  nodeType: string;
};

/**
 * Resolves a node `type` string to the component that renders it, merging user-supplied
 * `nodeTypes` over the {@link builtinNodeTypes}. The Angular port of how React Flow's
 * `NodeWrapper` resolves `nodeTypes?.[type] || builtinNodeTypes[type]`, including the
 * `'default'` fallback and the `onError('003')` warning when a type is unknown.
 *
 * @internal
 */
export function resolveNodeType(
  type: string | undefined,
  nodeTypes: NodeTypes | undefined,
  onError?: OnError
): ResolvedNodeType {
  let nodeType = type || 'default';
  let component = nodeTypes?.[nodeType] || builtinNodeTypes[nodeType];

  if (component === undefined) {
    onError?.('003', errorMessages['error003'](nodeType));
    nodeType = 'default';
    component = nodeTypes?.['default'] || builtinNodeTypes['default'];
  }

  return { component, nodeType };
}
