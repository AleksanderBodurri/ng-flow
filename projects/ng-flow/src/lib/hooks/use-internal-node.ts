import type { Signal } from '@angular/core';
import { shallow } from 'zustand/shallow';

import { useStore } from './use-store';
import type { InternalNode, Node, ReactFlowState } from '../types';

/**
 * This hook returns a `Signal` of the internal representation of a specific node. The
 * signal updates **whenever the node changes**, including when it is selected or moved.
 *
 * The ng-flow port of React Flow's `useInternalNode`. The `id` is a static string param
 * (React used a `useCallback`-memoized selector keyed on `id`; here the selector simply
 * closes over the `id` argument). Must be called in an injection context inside a flow.
 *
 * @public
 * @param id - The id of the node you want to observe.
 * @returns A `Signal` of the `InternalNode` for the given id (or `undefined`).
 *
 * @example
 * ```ts
 * readonly internalNode = useInternalNode('node-1');
 * readonly position = computed(() => this.internalNode()?.internals.positionAbsolute);
 * ```
 */
export function useInternalNode<NodeType extends Node = Node>(
  id: string
): Signal<InternalNode<NodeType> | undefined> {
  return useStore(
    (s: ReactFlowState) => s.nodeLookup.get(id) as InternalNode<NodeType> | undefined,
    shallow
  );
}
