import { effect, ElementRef, isSignal, type Signal } from '@angular/core';
import { errorMessages, getDimensions } from '@xyflow/system';

import { useStoreApi } from './use-store';

type ElementInput = HTMLDivElement | ElementRef<HTMLDivElement> | null | undefined;

function resolveEl(input: ElementInput | Signal<ElementInput>): HTMLDivElement | null {
  const value = isSignal(input) ? input() : input;
  if (!value) {
    return null;
  }
  return value instanceof ElementRef ? value.nativeElement : value;
}

/**
 * Keeps the store's `width`/`height` in sync with the flow's host element via a
 * `ResizeObserver` plus a `window` resize listener. The ng-flow port of React Flow's
 * `useResizeHandler`.
 *
 * Accepts the host element as a plain element, an `ElementRef`, or a `Signal` of either.
 * Sets up the observers in an `effect()` once the element is available and tears them down
 * on cleanup (automatic via `DestroyRef`). Guards `window`/`ResizeObserver` for SSR.
 *
 * Must be called in an injection context inside a flow.
 *
 * @internal
 */
export function useResizeHandler(domNode: ElementInput | Signal<ElementInput>): void {
  const store = useStoreApi();

  effect((onCleanup) => {
    const node = resolveEl(domNode);

    if (!node || typeof window === 'undefined') {
      return;
    }

    /*
     * Suppress the "container has no size" warning during the initial mount/layout race
     * (the ResizeObserver follows up with the real size a frame later). After the first
     * frame, a persistent 0×0 measurement is a genuine "forgot to size the container" bug
     * and still warns — matching React Flow's intent without the transient false positive.
     */
    let canWarn = false;
    const updateDimensions = () => {
      if (!node || !(node.checkVisibility?.() ?? true)) {
        return false;
      }
      const size = getDimensions(node);

      if ((size.height === 0 || size.width === 0) && canWarn) {
        store.getState().onError?.('004', errorMessages['error004']());
      }

      store.setState({ width: size.width || 500, height: size.height || 500 });

      return undefined;
    };

    updateDimensions();
    // A properly-sized container has layout within a couple frames; a genuinely unsized one
    // stays 0×0. Wait past the mount/route-transition race before the 0×0 warning can fire.
    const warnTimer = window.setTimeout(() => {
      canWarn = true;
    }, 200);
    window.addEventListener('resize', updateDimensions);

    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => updateDimensions()) : null;
    resizeObserver?.observe(node);

    onCleanup(() => {
      window.clearTimeout(warnTimer);
      window.removeEventListener('resize', updateDimensions);
      resizeObserver?.unobserve(node);
    });
  });
}
