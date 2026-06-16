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
  s.domNode?.querySelector<HTMLElement>('.react-flow__viewport-portal') ?? null;

/**
 * Adds content into the same viewport where nodes and edges are rendered, so it
 * shares their coordinate system and is affected by zooming and panning.
 *
 * The Angular port of React Flow's `<ViewportPortal />`, which uses `createPortal`.
 * Here the projected content lives inside an `<ng-template>` that is attached to the
 * `react-flow__viewport-portal` div via a CDK `DomPortalOutlet` + `TemplatePortal`.
 * If the target div is missing, nothing is rendered.
 *
 * @public
 * @example
 * ```html
 * <ng-flow-viewport-portal>
 *   <div style="transform: translate(100px, 100px); position: absolute;">
 *     This div is positioned at [100, 100] on the flow.
 *   </div>
 * </ng-flow-viewport-portal>
 * ```
 */
@Component({
  selector: 'ng-flow-viewport-portal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #content>
      <ng-content />
    </ng-template>
  `,
})
export class ViewportPortal {
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
