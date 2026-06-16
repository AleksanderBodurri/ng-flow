import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { errorMessages, MarkerType, type OnError } from '@xyflow/system';

import type { CSSProperties } from '../../types';

/**
 * Renders the SVG symbol (polyline) inside an arrowhead `<marker>`. The Angular port of React Flow's
 * `MarkerSymbols` (`ArrowSymbol` / `ArrowClosedSymbol` + `useMarkerSymbol`) from
 * container/EdgeRenderer/MarkerSymbols.tsx.
 *
 * The **host is the `<svg:polyline>`** (attribute selector `polyline[ng-flow-marker-symbol]`) so the shape
 * paints inside the marker's SVG namespace. A `@switch` on `type` selects the points/class (`arrow` open
 * vs `arrowclosed` filled). For an unknown marker type it emits `onError('009')` and renders nothing
 * (the host stays inert with no points), matching React's `useMarkerSymbol` returning `null`.
 *
 * @internal
 */
@Component({
  selector: 'polyline[ng-flow-marker-symbol]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    '[class]': 'symbolClass()',
    '[attr.fill]': 'fill()',
    '[attr.points]': 'points()',
    '[style]': 'symbolStyle()',
  },
  template: ``,
})
export class MarkerSymbol {
  readonly type = input.required<MarkerType | `${MarkerType}`>();
  readonly color = input<string>('none');
  readonly strokeWidth = input<number>(1);
  readonly onError = input<OnError>();

  /** Mirror React's `Object.prototype.hasOwnProperty.call(MarkerSymbols, type)` existence check. */
  private readonly isKnown = computed(() => {
    const t = this.type();
    const known = t === MarkerType.Arrow || t === MarkerType.ArrowClosed;
    if (!known) {
      this.onError()?.('009', errorMessages['error009'](t));
    }
    return known;
  });

  /**
   * `points` for the chosen marker type — `null` for an unknown type so nothing paints
   * (React's `useMarkerSymbol` returns `null` and the marker renders no symbol).
   */
  protected readonly points = computed<string | null>(() => {
    if (!this.isKnown()) {
      return null;
    }
    return this.type() === MarkerType.ArrowClosed ? '-5,-4 0,0 -5,4 -5,-4' : '-5,-4 0,0 -5,4';
  });

  /** React used `className="arrow"` for the open symbol and `"arrowclosed"` for the closed one. */
  protected readonly symbolClass = computed<string>(() =>
    this.isKnown() && this.type() === MarkerType.ArrowClosed ? 'arrowclosed' : 'arrow'
  );

  /** Closed arrows fill with the color; open arrows never fill. */
  protected readonly fill = computed<string>(() =>
    this.isKnown() && this.type() === MarkerType.ArrowClosed && this.color() ? this.color() : 'none'
  );

  /** Mirror React's inline `style={{ strokeWidth, ...(color && { stroke }) }}`. */
  protected readonly symbolStyle = computed<CSSProperties>(() => {
    const style: CSSProperties = { strokeWidth: this.strokeWidth() };
    if (this.color()) {
      style['stroke'] = this.color();
    }
    return style;
  });
}
