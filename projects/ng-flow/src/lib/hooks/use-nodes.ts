import type { Signal } from '@angular/core';
import { shallow } from 'zustand/shallow';

import { useStore } from './use-store';
import type { Node, ReactFlowState } from '../types';

const nodesSelector = (state: ReactFlowState) => state.nodes;

/**
 * This hook returns a `Signal` of the current nodes. The signal updates **whenever any
 * node changes**, including when a node is selected or moved.
 *
 * The ng-flow port of React Flow's `useNodes` — returns a `Signal<NodeType[]>` instead
 * of the value directly. Must be called in an injection context inside a flow.
 *
 * @public
 * @returns A `Signal` of all nodes currently in the flow.
 *
 * @example
 * ```ts
 * readonly nodes = useNodes();
 * // template: There are currently {{ nodes().length }} nodes!
 * ```
 */
export function useNodes<NodeType extends Node = Node>(): Signal<NodeType[]> {
  return useStore(nodesSelector, shallow) as Signal<NodeType[]>;
}
