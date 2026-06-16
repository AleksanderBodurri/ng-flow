import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { type Edge, type Node, useOnSelectionChange } from 'ng-flow';

/**
 * Mirrors React's `SelectionLogger`: a component rendered INSIDE the flow that subscribes via
 * `useOnSelectionChange`. On every selection change it logs `(id, nodes, edges)` to the console
 * (like React) and also surfaces the latest counts on-page.
 *
 * Because the hook registers/cleans up through Angular's `DestroyRef`, removing this component
 * from the template (the conditional second logger) automatically unsubscribes it.
 */
@Component({
  selector: 'app-selection-logger',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="logger">
      <strong>{{ id() }}</strong>
      <span>nodes: {{ nodeCount() }}, edges: {{ edgeCount() }}</span>
    </div>
  `,
  styles: [
    `
      .logger {
        display: flex;
        gap: 8px;
        font-size: 12px;
      }
    `,
  ],
})
export class SelectionLogger {
  readonly id = input.required<string>();

  protected readonly nodeCount = signal(0);
  protected readonly edgeCount = signal(0);

  constructor() {
    useOnSelectionChange({
      onChange: ({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
        console.log(this.id(), nodes, edges);
        this.nodeCount.set(nodes.length);
        this.edgeCount.set(edges.length);
      },
    });
  }
}
