import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  TemplateRef,
  ViewContainerRef,
  viewChild,
} from '@angular/core';
import { DomPortalOutlet, TemplatePortal } from '@angular/cdk/portal';
import cc from 'classcat';
import { getEdgeToolbarTransform } from '@xyflow/system';

import { FlowStore } from '../../store/flow-store';
import type { CSSProperties, Edge, ReactFlowState } from '../../types';

/**
 * Props for the {@link EdgeToolbar} component, documented for reference. In Angular
 * these are expressed as individual `input()`s on the component.
 *
 * @public
 */
export type EdgeToolbarProps = {
  /** An edge toolbar must be attached to an edge. */
  edgeId: string;
  /** The `x` position of the edge toolbar. */
  x: number;
  /** The `y` position of the edge toolbar. */
  y: number;
  /**
   * If `true`, edge toolbar is visible even if edge is not selected.
   * @default false
   */
  isVisible?: boolean;
  /**
   * Align the toolbar relative to the passed x position.
   * @default "center"
   */
  alignX?: 'left' | 'center' | 'right';
  /**
   * Align the toolbar relative to the passed y position.
   * @default "center"
   */
  alignY?: 'top' | 'center' | 'bottom';
  /** Class applied to the toolbar wrapper. */
  className?: string;
  /** Style applied to the toolbar wrapper. */
  style?: CSSProperties;
};

const zoomSelector = (state: ReactFlowState) => state.transform[2];

const portalTargetSelector = (s: ReactFlowState) =>
  s.domNode?.querySelector<HTMLElement>('.react-flow__edgelabel-renderer') ?? null;

/**
 * This component can render a toolbar or tooltip to one side of a custom edge. This
 * toolbar doesn't scale with the viewport so that the content stays the same size.
 *
 * The Angular port of React Flow's `<EdgeToolbar />`. Its content is projected,
 * wrapped in a positioned `react-flow__edge-toolbar` div, and rendered into the
 * `react-flow__edgelabel-renderer` element via a CDK `DomPortalOutlet` + `TemplatePortal`.
 *
 * @public
 * @example
 * ```html
 * <ng-flow-edge-toolbar [edgeId]="id" [x]="centerX" [y]="centerY" [isVisible]="true">
 *   <button>Click me</button>
 * </ng-flow-edge-toolbar>
 * ```
 */
@Component({
  selector: 'ng-flow-edge-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #content>
      @if (isActive()) {
        <div [style]="wrapperStyle()" [class]="wrapperClass()" [attr.data-id]="dataId()">
          <ng-content />
        </div>
      }
    </ng-template>
  `,
})
export class EdgeToolbar {
  private readonly store = inject(FlowStore);
  private readonly viewContainerRef = inject(ViewContainerRef);

  /** An edge toolbar must be attached to an edge. */
  readonly edgeId = input.required<string>();
  /** The `x` position of the edge toolbar. */
  readonly x = input.required<number>();
  /** The `y` position of the edge toolbar. */
  readonly y = input.required<number>();
  /**
   * If `true`, edge toolbar is visible even if edge is not selected.
   * @default false
   */
  readonly isVisible = input<boolean>();
  /**
   * Align the toolbar relative to the passed x position.
   * @default "center"
   */
  readonly alignX = input<'left' | 'center' | 'right'>('center');
  /**
   * Align the toolbar relative to the passed y position.
   * @default "center"
   */
  readonly alignY = input<'top' | 'center' | 'bottom'>('center');
  /** Class applied to the toolbar wrapper. */
  readonly className = input<string>();
  /** Style applied to the toolbar wrapper. */
  readonly style = input<CSSProperties>();

  /** Wraps the projected `<ng-content>` so it can be stamped into the portal outlet. */
  private readonly content = viewChild.required('content', { read: TemplateRef });

  /** The target div read reactively from the store; `null` until the flow mounts. */
  private readonly target = this.store.select(portalTargetSelector);

  private readonly zoom = this.store.select(zoomSelector);
  private readonly edgeLookup = this.store.select((s) => s.edgeLookup);
  private readonly edge = computed<Edge | undefined>(() => this.edgeLookup().get(this.edgeId()));

  protected readonly isActive = computed(() => {
    const isVisible = this.isVisible();
    return typeof isVisible === 'boolean' ? isVisible : !!this.edge()?.selected;
  });

  protected readonly dataId = computed(() => this.edge()?.id ?? '');

  protected readonly wrapperClass = computed(() => cc(['react-flow__edge-toolbar', this.className()]));

  protected readonly wrapperStyle = computed<CSSProperties>(() => {
    const zIndex = (this.edge()?.zIndex ?? 0) + 1;
    const transform = getEdgeToolbarTransform(this.x(), this.y(), this.zoom(), this.alignX(), this.alignY());

    return {
      position: 'absolute',
      transform,
      zIndex,
      pointerEvents: 'all',
      transformOrigin: '0 0',
      ...this.style(),
    };
  });

  private outlet: DomPortalOutlet | null = null;
  private portal: TemplatePortal | null = null;

  constructor() {
    // Attach the template into the edge-label renderer whenever the target appears/changes;
    // the `@if (isActive())` inside the template handles "render nothing when not active".
    effect(() => {
      const target = this.target();
      const template = this.content();

      this.teardown();

      if (target && template) {
        this.outlet = new DomPortalOutlet(target);
        this.portal = new TemplatePortal(template, this.viewContainerRef);
        this.outlet.attach(this.portal);
      }
    });

    inject(DestroyRef).onDestroy(() => this.teardown());
  }

  private teardown(): void {
    if (this.portal?.isAttached) {
      this.portal.detach();
    }
    this.outlet?.dispose();
    this.portal = null;
    this.outlet = null;
  }
}
