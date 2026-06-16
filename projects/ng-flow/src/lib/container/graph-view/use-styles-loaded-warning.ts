import { afterNextRender, isDevMode } from '@angular/core';
import { errorMessages } from '@xyflow/system';

import { useStoreApi } from '../../hooks/use-store';

/**
 * Warns (dev only) once if the React Flow CSS hasn't been loaded — detected by the `.react-flow__pane`
 * not having the expected `z-index: 1`. The ng-flow port of React Flow's `useStylesLoadedWarning`
 * (container/GraphView/useStylesLoadedWarning.ts).
 *
 * React ran the check in a mount `useEffect`; here it runs once in `afterNextRender` (after the pane
 * exists), guarded by a plain `checked` flag. Calls `onError('013')` if the style contract is violated.
 * No-op outside dev mode. Must be called in an injection context inside a flow.
 *
 * @internal
 */
export function useStylesLoadedWarning(): void {
  const store = useStoreApi();

  // React's `useRef(false)` — fires the check at most once.
  let checked = false;

  afterNextRender(() => {
    if (!isDevMode()) {
      return;
    }
    if (!checked) {
      const pane = document.querySelector('.react-flow__pane');

      if (pane && !(window.getComputedStyle(pane).zIndex === '1')) {
        store.getState().onError?.('013', errorMessages['error013']('angular'));
      }

      checked = true;
    }
  });
}
