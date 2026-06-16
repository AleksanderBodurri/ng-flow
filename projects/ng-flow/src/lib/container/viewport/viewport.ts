import { ChangeDetectionStrategy, Component } from '@angular/core';

import { useStore } from '../../hooks/use-store';
import type { ReactFlowState } from '../../types';

const selector = (s: ReactFlowState) => `translate(${s.transform[0]}px,${s.transform[1]}px) scale(${s.transform[2]})`;

/**
 * The pannable/zoomable layer that all nodes and edges live inside. The Angular port of React Flow's
 * `Viewport` (container/Viewport/index.tsx).
 *
 * The **host is the viewport div** (`.react-flow__viewport.xyflow__viewport.react-flow__container`); its
 * `transform` is driven by the store transform (`translate(x,y) scale(z)`), so panning/zooming moves the
 * whole layer. Children (edge renderer, connection line, node renderer, portals) are projected via
 * `<ng-content>`, exactly mirroring React rendering `{children}` inside the div.
 *
 * @internal
 */
@Component({
  selector: 'ng-flow-viewport',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'react-flow__viewport xyflow__viewport react-flow__container',
    '[style.transform]': 'transform()',
  },
  template: `<ng-content />`,
})
export class Viewport {
  /** `translate(x,y) scale(z)` from the store transform — mirrors React's `useStore(selector)`. */
  protected readonly transform = useStore(selector);
}
