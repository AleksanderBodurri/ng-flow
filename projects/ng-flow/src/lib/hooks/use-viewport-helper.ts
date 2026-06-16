import {
  pointToRendererPoint,
  getViewportForBounds,
  type XYPosition,
  rendererPointToPoint,
  SnapGrid,
} from '@xyflow/system';

import { useStoreApi } from './use-store';
import type { ViewportHelperFunctions } from '../types';

/**
 * Builds the viewport helper functions, delegating to `store.getState().panZoom` and the
 * `@xyflow/system` math helpers. The ng-flow port of React Flow's `useViewportHelper`.
 *
 * Returns a plain object of functions (React used `useMemo`; in Angular a stable object
 * built once is enough since each method reads live state via `getState()`). The async
 * methods stay promise-based and resolve to `false` when `panZoom` is absent.
 *
 * Must be called in an injection context inside a flow.
 *
 * @internal
 * @returns The {@link ViewportHelperFunctions}.
 */
export function useViewportHelper(): ViewportHelperFunctions {
  const store = useStoreApi();

  return {
    zoomIn: async (options) => {
      const { panZoom } = store.getState();

      return panZoom ? panZoom.scaleBy(1.2, options) : false;
    },
    zoomOut: async (options) => {
      const { panZoom } = store.getState();

      return panZoom ? panZoom.scaleBy(1 / 1.2, options) : false;
    },
    zoomTo: async (zoomLevel, options) => {
      const { panZoom } = store.getState();

      return panZoom ? panZoom.scaleTo(zoomLevel, options) : false;
    },
    getZoom: () => store.getState().transform[2],
    setViewport: async (viewport, options) => {
      const {
        transform: [tX, tY, tZoom],
        panZoom,
      } = store.getState();

      if (!panZoom) {
        return false;
      }

      await panZoom.setViewport(
        {
          x: viewport.x ?? tX,
          y: viewport.y ?? tY,
          zoom: viewport.zoom ?? tZoom,
        },
        options
      );

      return true;
    },
    getViewport: () => {
      const [x, y, zoom] = store.getState().transform;
      return { x, y, zoom };
    },
    setCenter: async (x, y, options) => {
      return store.getState().setCenter(x, y, options);
    },
    fitBounds: async (bounds, options) => {
      const { width, height, minZoom, maxZoom, panZoom } = store.getState();
      const viewport = getViewportForBounds(bounds, width, height, minZoom, maxZoom, options?.padding ?? 0.1);

      if (!panZoom) {
        return false;
      }

      await panZoom.setViewport(viewport, {
        duration: options?.duration,
        ease: options?.ease,
        interpolate: options?.interpolate,
      });

      return true;
    },
    screenToFlowPosition: (
      clientPosition: XYPosition,
      options: { snapToGrid?: boolean; snapGrid?: SnapGrid } = {}
    ) => {
      const { transform, snapGrid, snapToGrid, domNode } = store.getState();

      if (!domNode) {
        return clientPosition;
      }

      const { x: domX, y: domY } = domNode.getBoundingClientRect();
      const correctedPosition = {
        x: clientPosition.x - domX,
        y: clientPosition.y - domY,
      };
      const _snapGrid = options.snapGrid ?? snapGrid;
      const _snapToGrid = options.snapToGrid ?? snapToGrid;

      return pointToRendererPoint(correctedPosition, transform, _snapToGrid, _snapGrid);
    },
    flowToScreenPosition: (flowPosition: XYPosition) => {
      const { transform, domNode } = store.getState();

      if (!domNode) {
        return flowPosition;
      }

      const { x: domX, y: domY } = domNode.getBoundingClientRect();
      const rendererPosition = rendererPointToPoint(flowPosition, transform);

      return {
        x: rendererPosition.x + domX,
        y: rendererPosition.y + domY,
      };
    },
  };
}
