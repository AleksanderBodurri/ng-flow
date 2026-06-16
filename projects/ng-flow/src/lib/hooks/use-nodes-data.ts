import type { Signal } from '@angular/core';
import { DistributivePick, shallowNodeData } from '@xyflow/system';

import { useStore } from './use-store';
import type { Node, ReactFlowState } from '../types';

/**
 * This hook lets you subscribe to changes of one or more nodes' `data` object. Returns a
 * `Signal` of an object (single id) or array of objects (array of ids), each with `id`,
 * `type` and `data`.
 *
 * The ng-flow port of React Flow's `useNodesData` — returns a `Signal` instead of the
 * value directly. The id(s) are static params (React memoized the selector on them; here
 * the selector closes over the argument). Must be called in an injection context inside a flow.
 *
 * @public
 */
export function useNodesData<NodeType extends Node = Node>(
  /** The id of the node to get the data from. */
  nodeId: string
): Signal<DistributivePick<NodeType, 'id' | 'type' | 'data'> | null>;
export function useNodesData<NodeType extends Node = Node>(
  /** The ids of the nodes to get the data from. */
  nodeIds: string[]
): Signal<DistributivePick<NodeType, 'id' | 'type' | 'data'>[]>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useNodesData(nodeIds: any): any {
  return useStore((s: ReactFlowState) => {
    const data = [];
    const isArrayOfIds = Array.isArray(nodeIds);
    const _nodeIds = isArrayOfIds ? nodeIds : [nodeIds];

    for (const nodeId of _nodeIds) {
      const node = s.nodeLookup.get(nodeId);
      if (node) {
        data.push({
          id: node.id,
          type: node.type,
          data: node.data,
        });
      }
    }

    return isArrayOfIds ? data : data[0] ?? null;
  }, shallowNodeData);
}
