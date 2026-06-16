import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import cc from 'classcat';
import { shallow } from 'zustand/shallow';

import { FlowStore } from '../../store/flow-store';
import { containerStyle } from '../../styles/utils';
import type { CSSProperties, ReactFlowState } from '../../types';

/**
 * The three variants are exported as an enum for convenience. You can either import
 * the enum and use it like `BackgroundVariant.Lines` or you can use the raw string
 * value directly.
 *
 * @public
 */
export enum BackgroundVariant {
  Lines = 'lines',
  Dots = 'dots',
  Cross = 'cross',
}

/**
 * Props for the {@link Background} component, documented for reference. In Angular
 * these are expressed as individual `input()`s on the component.
 *
 * @public
 */
export type BackgroundProps = {
  /** When multiple backgrounds are present on the page, each one should have a unique id. */
  id?: string;
  /** Color of the pattern. */
  color?: string;
  /** Color of the background. */
  bgColor?: string;
  /** Class applied to the container. */
  className?: string;
  /** Class applied to the pattern. */
  patternClassName?: string;
  /**
   * The gap between patterns. Passing in a tuple allows you to control the x and y gap
   * independently.
   * @default 20
   */
  gap?: number | [number, number];
  /**
   * The radius of each dot or the size of each rectangle if `BackgroundVariant.Dots` or
   * `BackgroundVariant.Cross` is used. This defaults to 1 or 6 respectively, or ignored if
   * `BackgroundVariant.Lines` is used.
   */
  size?: number;
  /**
   * Offset of the pattern.
   * @default 0
   */
  offset?: number | [number, number];
  /**
   * The stroke thickness used when drawing the pattern.
   * @default 1
   */
  lineWidth?: number;
  /**
   * Variant of the pattern.
   * @default BackgroundVariant.Dots
   */
  variant?: BackgroundVariant;
  /** Style applied to the container. */
  style?: CSSProperties;
};

const defaultSize: Record<BackgroundVariant, number> = {
  [BackgroundVariant.Dots]: 1,
  [BackgroundVariant.Lines]: 1,
  [BackgroundVariant.Cross]: 6,
};

const selector = (s: ReactFlowState) => ({ transform: s.transform, patternId: `pattern-${s.rfId}` });

/**
 * The `<svg ng-flow-background>` component makes it convenient to render different
 * types of backgrounds common in node-based UIs. It comes with three variants:
 * lines, dots and cross.
 *
 * The Angular port of React Flow's `<Background />`. Because it *is* an SVG element,
 * the host uses an attribute selector on `<svg>` so the rendered node is valid SVG.
 *
 * @public
 * @example
 * ```html
 * <svg ng-flow-background color="#ccc" [variant]="BackgroundVariant.Dots"></svg>
 * ```
 *
 * @remarks When combining multiple backgrounds it's important to give each of them a
 * unique `id` input!
 */
@Component({
  selector: 'ng-flow-background',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg:svg [class]="hostClass()" [style]="hostStyle()" data-testid="rf__background">
      <svg:pattern
        [attr.id]="patternId()"
        [attr.x]="patternX()"
        [attr.y]="patternY()"
        [attr.width]="scaledGap()[0]"
        [attr.height]="scaledGap()[1]"
        patternUnits="userSpaceOnUse"
        [attr.patternTransform]="patternTransform()"
      >
        @switch (variant()) {
          @case (BackgroundVariant.Dots) {
            <svg:circle
              [attr.cx]="dotRadius()"
              [attr.cy]="dotRadius()"
              [attr.r]="dotRadius()"
              [class]="dotClass()"
            />
          }
          @default {
            <svg:path [attr.stroke-width]="lineWidth()" [attr.d]="linePath()" [class]="lineClass()" />
          }
        }
      </svg:pattern>
      <svg:rect x="0" y="0" width="100%" height="100%" [attr.fill]="rectFill()" />
    </svg:svg>
  `,
  host: { style: 'display:contents' },
})
export class Background {
  private readonly store = inject(FlowStore);
  private readonly storeData = this.store.select(selector, shallow);

  /** When multiple backgrounds are present on the page, each one should have a unique id. */
  readonly id = input<string>();
  /**
   * Variant of the pattern.
   * @default BackgroundVariant.Dots
   */
  readonly variant = input<BackgroundVariant>(BackgroundVariant.Dots);
  /**
   * The gap between patterns. Only used for dots and cross.
   * @default 20
   */
  readonly gap = input<number | [number, number]>(20);
  /** The radius of each dot or the size of each rectangle. Only used for lines and cross. */
  readonly size = input<number>();
  /**
   * The stroke thickness used when drawing the pattern.
   * @default 1
   */
  readonly lineWidth = input<number>(1);
  /**
   * Offset of the pattern.
   * @default 0
   */
  readonly offset = input<number | [number, number]>(0);
  /** Color of the pattern. */
  readonly color = input<string>();
  /** Color of the background. */
  readonly bgColor = input<string>();
  /** Style applied to the container. */
  readonly style = input<CSSProperties>();
  /** Class applied to the container. */
  readonly className = input<string>();
  /** Class applied to the pattern. */
  readonly patternClassName = input<string>();

  /** Expose the enum to the template for `@switch`/`@case`. */
  protected readonly BackgroundVariant = BackgroundVariant;

  private readonly transform = computed(() => this.storeData().transform);

  private readonly patternSize = computed(() => this.size() || defaultSize[this.variant()]);
  private readonly isCross = computed(() => this.variant() === BackgroundVariant.Cross);

  private readonly gapXY = computed<[number, number]>(() => {
    const gap = this.gap();
    return Array.isArray(gap) ? gap : [gap, gap];
  });

  protected readonly scaledGap = computed<[number, number]>(() => {
    const zoom = this.transform()[2];
    const gapXY = this.gapXY();
    return [gapXY[0] * zoom || 1, gapXY[1] * zoom || 1];
  });

  private readonly scaledSize = computed(() => this.patternSize() * this.transform()[2]);

  private readonly offsetXY = computed<[number, number]>(() => {
    const offset = this.offset();
    return Array.isArray(offset) ? offset : [offset, offset];
  });

  private readonly patternDimensions = computed<[number, number]>(() => {
    const scaledSize = this.scaledSize();
    return this.isCross() ? [scaledSize, scaledSize] : this.scaledGap();
  });

  private readonly scaledOffset = computed<[number, number]>(() => {
    const zoom = this.transform()[2];
    const offsetXY = this.offsetXY();
    const patternDimensions = this.patternDimensions();
    return [
      offsetXY[0] * zoom || 1 + patternDimensions[0] / 2,
      offsetXY[1] * zoom || 1 + patternDimensions[1] / 2,
    ];
  });

  protected readonly patternId = computed(() => `${this.storeData().patternId}${this.id() ?? ''}`);

  protected readonly patternX = computed(() => this.transform()[0] % this.scaledGap()[0]);
  protected readonly patternY = computed(() => this.transform()[1] % this.scaledGap()[1]);

  protected readonly patternTransform = computed(() => {
    const scaledOffset = this.scaledOffset();
    return `translate(-${scaledOffset[0]},-${scaledOffset[1]})`;
  });

  protected readonly dotRadius = computed(() => this.scaledSize() / 2);

  protected readonly linePath = computed(() => {
    const [w, h] = this.patternDimensions();
    return `M${w / 2} 0 V${h} M0 ${h / 2} H${w}`;
  });

  protected readonly dotClass = computed(() =>
    cc(['react-flow__background-pattern', 'dots', this.patternClassName()])
  );

  protected readonly lineClass = computed(() =>
    cc(['react-flow__background-pattern', this.variant(), this.patternClassName()])
  );

  protected readonly rectFill = computed(() => `url(#${this.patternId()})`);

  protected readonly hostClass = computed(() => cc(['react-flow__background', this.className()]));

  protected readonly hostStyle = computed<CSSProperties>(() => ({
    ...this.style(),
    ...containerStyle,
    '--xy-background-color-props': this.bgColor(),
    '--xy-background-pattern-color-props': this.color(),
  }));
}
