import type { Signal } from '@angular/core';
import { shallow } from 'zustand/shallow';
import { isEdgeVisible } from '@xyflow/system';

import { useStore } from './use-store';
import type { ReactFlowState } from '../types';

/**
 * Hook for getting the visible edge ids from the store as a `Signal`.
 *
 * The ng-flow port of React Flow's `useVisibleEdgeIds` — returns a `Signal<string[]>`.
 * `onlyRenderVisible` is a static param. Must be called in an injection context inside a flow.
 *
 * @internal
 * @param onlyRenderVisible
 * @returns A `Signal` of the visible edge ids.
 */
export function useVisibleEdgeIds(onlyRenderVisible: boolean): Signal<string[]> {
  return useStore((s: ReactFlowState) => {
    if (!onlyRenderVisible) {
      return s.edges.map((edge) => edge.id);
    }

    const visibleEdgeIds = [];

    if (s.width && s.height) {
      for (const edge of s.edges) {
        const sourceNode = s.nodeLookup.get(edge.source);
        const targetNode = s.nodeLookup.get(edge.target);

        if (
          sourceNode &&
          targetNode &&
          isEdgeVisible({
            sourceNode,
            targetNode,
            width: s.width,
            height: s.height,
            transform: s.transform,
          })
        ) {
          visibleEdgeIds.push(edge.id);
        }
      }
    }

    return visibleEdgeIds;
  }, shallow);
}
