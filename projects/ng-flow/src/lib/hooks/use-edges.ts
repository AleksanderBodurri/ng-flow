import type { Signal } from '@angular/core';
import { shallow } from 'zustand/shallow';

import { useStore } from './use-store';
import type { Edge, ReactFlowState } from '../types';

const edgesSelector = (state: ReactFlowState) => state.edges;

/**
 * This hook returns a `Signal` of the current edges. The signal updates **whenever any
 * edge changes**.
 *
 * The ng-flow port of React Flow's `useEdges` — returns a `Signal<EdgeType[]>` instead
 * of the value directly. Must be called in an injection context inside a flow.
 *
 * @public
 * @returns A `Signal` of all edges currently in the flow.
 *
 * @example
 * ```ts
 * readonly edges = useEdges();
 * // template: There are currently {{ edges().length }} edges!
 * ```
 */
export function useEdges<EdgeType extends Edge = Edge>(): Signal<EdgeType[]> {
  return useStore(edgesSelector, shallow) as Signal<EdgeType[]>;
}
