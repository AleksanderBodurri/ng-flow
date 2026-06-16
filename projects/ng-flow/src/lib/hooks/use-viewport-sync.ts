import { effect, isSignal, type Signal } from '@angular/core';
import type { Viewport } from '@xyflow/system';

import { useStore, useStoreApi } from './use-store';
import type { ReactFlowState } from '../types';

const selector = (state: ReactFlowState) => state.panZoom?.syncViewport;

/** Accept either a plain value or a `Signal` of it. */
type ValueOrSignal<T> = T | Signal<T>;

/**
 * Syncs a controlled `viewport` with the panZoom instance. The ng-flow port of React Flow's
 * `useViewportSync`.
 *
 * When the controlled viewport changes, calls `panZoom.syncViewport(viewport)` and writes
 * `transform` back to the store. `viewport` may be a plain value or a `Signal` (so a
 * controlled-viewport input can be passed directly). Reactive via an `effect()`; cleanup is
 * automatic via `DestroyRef`.
 *
 * Must be called in an injection context inside a flow.
 *
 * @internal
 * @param viewport
 */
export function useViewportSync(viewport?: ValueOrSignal<Viewport | undefined>): void {
  const syncViewport = useStore(selector);
  const store = useStoreApi();

  effect(() => {
    const vp = isSignal(viewport) ? viewport() : viewport;
    if (vp) {
      syncViewport()?.(vp);
      store.setState({ transform: [vp.x, vp.y, vp.zoom] });
    }
  });
}
