import { effect } from '@angular/core';

import { useReactFlow } from './use-react-flow';
import { useStore } from './use-store';
import type { OnInit, Node, Edge, ReactFlowState } from '../types';

const viewportInitializedSelector = (s: ReactFlowState) => !!s.panZoom;

/**
 * Calls the `onInit` handler once the viewport has initialized. The ng-flow port of React
 * Flow's `useOnInitHandler`.
 *
 * React watched `rfInstance.viewportInitialized` (a reactive value) as an effect dependency;
 * here we drive the `effect()` from the underlying store selector `!!s.panZoom` (which is
 * what `viewportInitialized` reflects) so it fires reactively. Fires once via `setTimeout`,
 * guarded by a plain `isInitialized` flag (React's ref). Cleanup is automatic via `DestroyRef`.
 *
 * Must be called in an injection context inside a flow.
 *
 * @internal
 */
export function useOnInitHandler<NodeType extends Node = Node, EdgeType extends Edge = Edge>(
  onInit: OnInit<NodeType, EdgeType> | undefined
): void {
  const rfInstance = useReactFlow<NodeType, EdgeType>();
  const viewportInitialized = useStore(viewportInitializedSelector);

  // React's `useRef<boolean>(false)` — non-reactive imperative state, so a plain variable.
  let isInitialized = false;

  effect(() => {
    if (!isInitialized && viewportInitialized() && onInit) {
      setTimeout(() => onInit(rfInstance), 1);
      isInitialized = true;
    }
  });
}
