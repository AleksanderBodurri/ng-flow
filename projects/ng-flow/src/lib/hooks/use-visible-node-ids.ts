import type { Signal } from '@angular/core';
import { shallow } from 'zustand/shallow';
import { getNodesInside } from '@xyflow/system';

import { useStore } from './use-store';
import type { Node, ReactFlowState } from '../types';

const selector = (onlyRenderVisible: boolean) => (s: ReactFlowState) => {
  return onlyRenderVisible
    ? getNodesInside<Node>(s.nodeLookup, { x: 0, y: 0, width: s.width, height: s.height }, s.transform, true).map(
        (node) => node.id
      )
    : Array.from(s.nodeLookup.keys());
};

/**
 * Hook for getting the visible node ids from the store as a `Signal`.
 *
 * The ng-flow port of React Flow's `useVisibleNodeIds` — returns a `Signal<string[]>`.
 * `onlyRenderVisible` is a static param. Must be called in an injection context inside a flow.
 *
 * @internal
 * @param onlyRenderVisible
 * @returns A `Signal` of the visible node ids.
 */
export function useVisibleNodeIds(onlyRenderVisible: boolean): Signal<string[]> {
  return useStore(selector(onlyRenderVisible), shallow);
}
