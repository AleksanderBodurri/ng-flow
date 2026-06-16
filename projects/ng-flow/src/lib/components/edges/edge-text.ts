import { NgTemplateOutlet } from '@angular/common';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  type ElementRef,
  input,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import type { Rect } from '@xyflow/system';

import type { CSSProperties, EdgeLabel } from '../../types';

/**
 * Helper component to display text within a custom edge. The Angular port of
 * React Flow's `<EdgeText />`.
 *
 * The host **is** a `<g>` (attribute selector) so it paints inside `<svg>`. React measured
 * the rendered `<text>` with `getBBox()` in a `useEffect`; here a `viewChild` + `afterRenderEffect`
 * writes the measured `Rect` into a signal that drives the wrapper transform and background-rect size.
 *
 * Pass plain text/number via `[label]`, or project a custom template as children
 * (`<svg:g ng-flow-edge-text>…</svg:g>`), mirroring React's `children` prop.
 *
 * @public
 */
@Component({
  selector: 'g[ng-flow-edge-text]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  template: `
    @if (label()) {
      @if (labelShowBg()) {
        <svg:rect
          [attr.width]="bgWidth()"
          [attr.x]="-labelBgPadding()[0]"
          [attr.y]="-labelBgPadding()[1]"
          [attr.height]="bgHeight()"
          class="react-flow__edge-textbg"
          [style]="labelBgStyle()"
          [attr.rx]="labelBgBorderRadius()"
          [attr.ry]="labelBgBorderRadius()"
        />
      }
      <svg:text
        #textEl
        class="react-flow__edge-text"
        [attr.y]="textY()"
        dy="0.3em"
        [style]="labelStyle()"
      >@if (labelTemplate(); as tpl) {<ng-container [ngTemplateOutlet]="tpl" />} @else {<ng-container>{{ label() }}</ng-container>}<ng-content /></svg:text>
    }
  `,
  host: {
    '[class]': 'hostClass()',
    '[attr.transform]': 'transform()',
    '[attr.visibility]': 'visibility()',
  },
})
export class EdgeText {
  readonly x = input.required<number>();
  readonly y = input.required<number>();
  readonly label = input<EdgeLabel>();
  readonly labelStyle = input<CSSProperties>();
  readonly labelShowBg = input(true);
  readonly labelBgStyle = input<CSSProperties>();
  readonly labelBgPadding = input<[number, number]>([2, 4]);
  readonly labelBgBorderRadius = input(2);
  readonly className = input<string>();

  private readonly textEl = viewChild<ElementRef<SVGTextElement>>('textEl');
  private readonly edgeTextBbox = signal<Rect>({ x: 1, y: 0, width: 0, height: 0 });

  /** A `TemplateRef` label is rendered via `ngTemplateOutlet`; string/number labels are interpolated. */
  protected readonly labelTemplate = computed(() => {
    const label = this.label();
    return label instanceof TemplateRef ? label : null;
  });
  protected readonly hostClass = computed(() => {
    const cn = this.className();
    return cn ? `react-flow__edge-textwrapper ${cn}` : 'react-flow__edge-textwrapper';
  });
  protected readonly transform = computed(() => {
    const bbox = this.edgeTextBbox();
    return `translate(${this.x() - bbox.width / 2} ${this.y() - bbox.height / 2})`;
  });
  protected readonly visibility = computed(() => (this.edgeTextBbox().width ? 'visible' : 'hidden'));
  protected readonly bgWidth = computed(() => this.edgeTextBbox().width + 2 * this.labelBgPadding()[0]);
  protected readonly bgHeight = computed(() => this.edgeTextBbox().height + 2 * this.labelBgPadding()[1]);
  protected readonly textY = computed(() => this.edgeTextBbox().height / 2);

  constructor() {
    afterRenderEffect({
      read: () => {
        // Re-measure whenever the label changes (matches React's [label] effect dep).
        this.label();
        const el = this.textEl()?.nativeElement;
        if (el) {
          const textBbox = el.getBBox();
          const current = this.edgeTextBbox();
          if (
            current.x !== textBbox.x ||
            current.y !== textBbox.y ||
            current.width !== textBbox.width ||
            current.height !== textBbox.height
          ) {
            this.edgeTextBbox.set({
              x: textBbox.x,
              y: textBbox.y,
              width: textBbox.width,
              height: textBbox.height,
            });
          }
        }
      },
    });
  }
}
