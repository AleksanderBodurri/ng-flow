import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { createMarkerIds, type MarkerProps } from '@xyflow/system';

import { FlowStore } from '../../store/flow-store';
import { MarkerSymbol } from './marker-symbols';

/**
 * Renders the shared `<defs>` of arrowhead markers used by edges' `markerStart`/`markerEnd`. The Angular
 * port of React Flow's `MarkerDefinitions` + inner `Marker` (container/EdgeRenderer/MarkerDefinitions.tsx).
 *
 * The **host is the `<svg class="react-flow__marker">`** (attribute selector `svg[ng-flow-marker-definitions]`,
 * `aria-hidden`) so the markers live in the SVG namespace. Marker ids are computed with `createMarkerIds`
 * (deduped, sorted), namespaced by the flow's `rfId` so multiple flows on a page don't collide. Each marker
 * renders a `<svg:marker class="react-flow__arrowhead">` wrapping a {@link MarkerSymbol}.
 *
 * Unlike React (which returns `null` when there are no markers), the host `<svg>` is always present here
 * (it's an attribute-selector element authored by the edge renderer); its `<defs>` is simply empty when
 * there are no markers, which is visually identical.
 *
 * @internal
 */
@Component({
  selector: 'svg[ng-flow-marker-definitions]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MarkerSymbol],
  host: {
    'class': 'react-flow__marker',
    'aria-hidden': 'true',
  },
  template: `
    <svg:defs>
      @for (marker of markers(); track marker.id) {
        <svg:marker
          class="react-flow__arrowhead"
          [id]="marker.id"
          [attr.markerWidth]="markerWidth(marker)"
          [attr.markerHeight]="markerHeight(marker)"
          viewBox="-10 -10 20 20"
          [attr.markerUnits]="marker.markerUnits ?? 'strokeWidth'"
          [attr.orient]="marker.orient ?? 'auto-start-reverse'"
          refX="0"
          refY="0"
        >
          <svg:polyline
            ng-flow-marker-symbol
            [type]="marker.type"
            [color]="marker.color ?? 'none'"
            [strokeWidth]="marker.strokeWidth ?? 1"
            [onError]="onError()"
          ></svg:polyline>
        </svg:marker>
      }
    </svg:defs>
  `,
})
export class MarkerDefinitions {
  readonly defaultColor = input<string | null>(null);
  readonly rfId = input<string>();

  private readonly store = inject(FlowStore);

  private readonly edges = this.store.select((s) => s.edges);
  private readonly defaultEdgeOptions = this.store.select((s) => s.defaultEdgeOptions);

  /** `onError` is read from the store (React's `useMarkerSymbol` reads it via `useStoreApi`). */
  protected readonly onError = this.store.select((s) => s.onError);

  /** Deduped, sorted marker definitions — mirrors React's `useMemo(createMarkerIds(...))`. */
  protected readonly markers = computed<MarkerProps[]>(() =>
    createMarkerIds(this.edges(), {
      id: this.rfId(),
      defaultColor: this.defaultColor(),
      defaultMarkerStart: this.defaultEdgeOptions()?.markerStart,
      defaultMarkerEnd: this.defaultEdgeOptions()?.markerEnd,
    })
  );

  protected markerWidth(marker: MarkerProps): string {
    return `${marker.width ?? 12.5}`;
  }
  protected markerHeight(marker: MarkerProps): string {
    return `${marker.height ?? 12.5}`;
  }
}
