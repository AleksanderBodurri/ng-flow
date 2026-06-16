import type { Signal } from '@angular/core';
import { nodeHasDimensions } from '@xyflow/system';

import { useStore } from './use-store';
import type { ReactFlowState } from '../types';

export type UseNodesInitializedOptions = {
  /** @default false */
  includeHiddenNodes?: boolean;
};

const selector = (options: UseNodesInitializedOptions) => (s: ReactFlowState) => {
  if (!options.includeHiddenNodes) {
    return s.nodesInitialized;
  }

  if (s.nodeLookup.size === 0) {
    return false;
  }

  for (const [, { internals }] of s.nodeLookup) {
    if (internals.handleBounds === undefined || !nodeHasDimensions(internals.userNode)) {
      return false;
    }
  }

  return true;
};

/**
 * This hook tells you whether all the nodes in a flow have been measured and given a width
 * and height. When you add a node, the signal reads `false`, then `true` once measured.
 *
 * The ng-flow port of React Flow's `useNodesInitialized` — returns a `Signal<boolean>`
 * instead of the value directly. Must be called in an injection context inside a flow.
 *
 * @public
 * @returns A `Signal<boolean>` of whether the nodes have been initialized.
 */
export function useNodesInitialized(
  options: UseNodesInitializedOptions = {
    includeHiddenNodes: false,
  }
): Signal<boolean> {
  return useStore(selector(options));
}
