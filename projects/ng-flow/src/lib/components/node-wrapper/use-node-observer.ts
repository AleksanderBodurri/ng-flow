import { DestroyRef, effect, inject } from '@angular/core';

import { useStoreApi } from '../../hooks/use-store';
import type { InternalNode } from '../../types';

/**
 * Parameters for {@link useNodeObserver}. Each value is supplied as an accessor (a `Signal` or
 * plain getter) so the observer reacts to changes the same way React's effect deps did.
 */
export type UseNodeObserverParams = {
  /** The node's chrome element (already rendered by `NodeWrapper`). */
  nodeElement: () => HTMLDivElement | null;
  node: () => InternalNode;
  nodeType: () => string;
  hasDimensions: () => boolean;
  resizeObserver: () => ResizeObserver | null;
};

/**
 * Handles ResizeObserver registration + internal updates for a node element. The Angular port of
 * React Flow's `useNodeObserver`.
 *
 * React returned a `nodeRef` for the wrapper to attach; in Angular the wrapper already owns its
 * host element and passes it in via `nodeElement`. Three `useEffect`s become three `effect()`s:
 * (1) (re)observe the element when it becomes available / un-initialized, (2) unobserve on destroy,
 * (3) push `updateNodeInternals` when `type`/`sourcePosition`/`targetPosition` change.
 *
 * Must be called in an injection context inside a flow.
 *
 * @internal
 */
export function useNodeObserver(params: UseNodeObserverParams): void {
  const store = useStoreApi();
  const destroyRef = inject(DestroyRef);

  // React's `useRef`s — imperative, persist across effect runs. Seeded lazily on the first
  // effect run (NOT at construction) so we don't read required inputs before they're set.
  let observedNode: HTMLElement | null = null;
  let seeded = false;
  let prevSourcePosition: InternalNode['sourcePosition'];
  let prevTargetPosition: InternalNode['targetPosition'];
  let prevType: string;

  // Effect 1: keep the element under observation (matches deps [isInitialized, node.hidden]).
  effect(() => {
    const node = params.node();
    const nodeElement = params.nodeElement();
    const resizeObserver = params.resizeObserver();
    const isInitialized = params.hasDimensions() && !!node.internals.handleBounds;

    if (nodeElement && !node.hidden && (!isInitialized || observedNode !== nodeElement)) {
      if (observedNode) {
        resizeObserver?.unobserve(observedNode);
      }
      resizeObserver?.observe(nodeElement);
      observedNode = nodeElement;
    }
  });

  // Effect 2: unobserve on teardown (React's empty-deps cleanup effect).
  destroyRef.onDestroy(() => {
    if (observedNode) {
      params.resizeObserver()?.unobserve(observedNode);
      observedNode = null;
    }
  });

  // Effect 3: when type/source/target position change programmatically, refresh internals so edges update.
  effect(() => {
    const node = params.node();
    const nodeType = params.nodeType();
    const nodeElement = params.nodeElement();
    // Track the reactive deps explicitly (matches React's [node.id, nodeType, sourcePosition, targetPosition]).
    const sourcePosition = node.sourcePosition;
    const targetPosition = node.targetPosition;

    // Seed prev values on the first run so the initial pass registers no change (matches React).
    if (!seeded) {
      seeded = true;
      prevType = nodeType;
      prevSourcePosition = sourcePosition;
      prevTargetPosition = targetPosition;
      return;
    }

    if (nodeElement) {
      const typeChanged = prevType !== nodeType;
      const sourcePosChanged = prevSourcePosition !== sourcePosition;
      const targetPosChanged = prevTargetPosition !== targetPosition;

      if (typeChanged || sourcePosChanged || targetPosChanged) {
        prevType = nodeType;
        prevSourcePosition = sourcePosition;
        prevTargetPosition = targetPosition;

        store
          .getState()
          .updateNodeInternals(new Map([[node.id, { id: node.id, nodeElement, force: true }]]));
      }
    }
  });
}
