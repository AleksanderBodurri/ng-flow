import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  TemplateRef,
  ViewContainerRef,
  viewChild,
} from '@angular/core';
import { DomPortalOutlet, TemplatePortal } from '@angular/cdk/portal';

import { FlowStore } from '../../store/flow-store';
import type { ReactFlowState } from '../../types';

const selector = (s: ReactFlowState) =>
  s.domNode?.querySelector<HTMLElement>('.react-flow__edgelabel-renderer') ?? null;

/**
 * Edges are SVG-based. To render more complex (HTML) labels, wrap them in
 * `<ng-flow-edge-label-renderer>`: a portal that projects its content into the
 * `react-flow__edgelabel-renderer` div positioned on top of the edges.
 *
 * The Angular port of React Flow's `<EdgeLabelRenderer />`, which uses
 * `createPortal`. Here the projected content lives inside an `<ng-template>` that
 * is attached to the target div via a CDK `DomPortalOutlet` + `TemplatePortal`.
 * If the target div is missing, nothing is rendered.
 *
 * @public
 * @remarks The renderer has no pointer events by default. To add interactions, set
 * `pointer-events: all` and add the `nopan` class on the element you want to interact with.
 */
@Component({
  selector: 'ng-flow-edge-label-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #content>
      <ng-content />
    </ng-template>
  `,
})
export class EdgeLabelRenderer {
  private readonly store = inject(FlowStore);
  private readonly viewContainerRef = inject(ViewContainerRef);

  /** Wraps the projected `<ng-content>` so it can be stamped into the portal outlet. */
  private readonly content = viewChild.required('content', { read: TemplateRef });

  /** The target div read reactively from the store; `null` until the flow mounts. */
  private readonly target = this.store.select(selector);

  private outlet: DomPortalOutlet | null = null;
  private portal: TemplatePortal | null = null;

  constructor() {
    // Re-runs when the target appears/changes or the template resolves; tears down
    // the previous outlet first so a changed/removed target cleans up correctly.
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
