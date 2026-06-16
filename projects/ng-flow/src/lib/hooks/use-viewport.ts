import type { Signal } from '@angular/core';
import { shallow } from 'zustand/shallow';
import type { Viewport } from '@xyflow/system';

import { useStore } from './use-store';
import type { ReactFlowState } from '../types';

const viewportSelector = (state: ReactFlowState): Viewport => ({
  x: state.transform[0],
  y: state.transform[1],
  zoom: state.transform[2],
});

/**
 * The `useViewport` hook is a convenient way to read the current state of the
 * {@link Viewport}. The returned signal updates **whenever the viewport changes**.
 *
 * The ng-flow port of React Flow's `useViewport` — returns a `Signal<Viewport>` instead
 * of the value directly. Must be called in an injection context inside a flow.
 *
 * @public
 * @returns A `Signal` of the current viewport (`{ x, y, zoom }`).
 *
 * @example
 * ```ts
 * readonly viewport = useViewport();
 * // template: ({{ viewport().x }}, {{ viewport().y }}) zoom {{ viewport().zoom }}
 * ```
 */
export function useViewport(): Signal<Viewport> {
  return useStore(viewportSelector, shallow);
}
