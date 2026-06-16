import { effect } from '@angular/core';
import type { OnViewportChange } from '@xyflow/system';

import { useStoreApi } from './use-store';

export type UseOnViewportChangeOptions = {
  /** Gets called when the viewport starts changing. */
  onStart?: OnViewportChange;
  /** Gets called when the viewport changes. */
  onChange?: OnViewportChange;
  /** Gets called when the viewport stops changing. */
  onEnd?: OnViewportChange;
};

/**
 * Registers viewport-change callbacks (`onStart` / `onChange` / `onEnd`) into the store.
 * The ng-flow port of React Flow's `useOnViewportChange`.
 *
 * Three `effect()`s write the handlers into the store (mirroring React's three `useEffect`s).
 * Cleanup is automatic via `DestroyRef`. The handlers are plain functions (as in React); if
 * you need them to react to changing inputs, recreate the call in your own reactive context.
 *
 * Must be called in an injection context inside a flow.
 *
 * @public
 */
export function useOnViewportChange({ onStart, onChange, onEnd }: UseOnViewportChangeOptions = {}): void {
  const store = useStoreApi();

  effect(() => {
    store.setState({ onViewportChangeStart: onStart });
  });

  effect(() => {
    store.setState({ onViewportChange: onChange });
  });

  effect(() => {
    store.setState({ onViewportChangeEnd: onEnd });
  });
}
