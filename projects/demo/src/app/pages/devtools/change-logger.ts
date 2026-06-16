import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { type NodeChange, type OnNodesChange, useStore, useStoreApi } from 'ng-flow';

/** Renders a single intercepted `NodeChange`, branching on its discriminated `type`. */
@Component({
  selector: 'app-devtools-change-info',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [JsonPipe],
  template: `
    <div style="margin-bottom: 4px;">
      <div>node id: {{ id() }}</div>
      <div>
        @switch (change().type) {
          @case ('add') {
            {{ asAny(change()).item | json }}
          }
          @case ('dimensions') {
            {{ asAny(change()).dimensions?.width }} &times; {{ asAny(change()).dimensions?.height }}
          }
          @case ('position') {
            position: {{ asAny(change()).position?.x?.toFixed(1) }}, {{ asAny(change()).position?.y?.toFixed(1) }}
          }
          @case ('remove') {
            remove
          }
          @case ('replace') {
            {{ asAny(change()).item | json }}
          }
          @case ('select') {
            {{ asAny(change()).selected ? 'select' : 'unselect' }}
          }
        }
      </div>
    </div>
  `,
})
export class DevtoolsChangeInfo {
  readonly change = input.required<NodeChange>();

  protected readonly id = computed(() => {
    const c = this.change() as { id?: string };
    return 'id' in c && c.id !== undefined ? c.id : '-';
  });

  /** Narrowing helper for the template — the `@switch` guarantees the active field exists. */
  protected asAny(change: NodeChange): any {
    return change;
  }
}

/**
 * Change Logger overlay. Mirrors React Flow's DevTools `ChangeLogger`.
 *
 * It grabs the store's current `onNodesChange` handler (via `useStore`) and — once — swaps
 * in a wrapper (via `useStoreApi().setState`) that first forwards to the user's handler, then
 * prepends each `NodeChange` to a capped log. Replicates React's `onNodesChangeIntercepted`
 * ref using a plain boolean guard inside an `effect`.
 */
@Component({
  selector: 'app-devtools-change-logger',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DevtoolsChangeInfo],
  template: `
    <div class="react-flow__devtools-changelogger">
      <div class="react-flow__devtools-title">Change Logger</div>
      @if (changes().length === 0) {
        no changes triggered
      } @else {
        @for (change of changes(); track $index) {
          <app-devtools-change-info [change]="change" />
        }
      }
    </div>
  `,
})
export class DevtoolsChangeLogger {
  /** Max number of changes kept in the log (oldest dropped first). */
  readonly limit = input(20);

  private readonly storeOnNodesChange = useStore((s) => s.onNodesChange);
  private readonly store = useStoreApi();

  protected readonly changes = signal<NodeChange[]>([]);

  private intercepted = false;

  constructor() {
    effect(() => {
      const userOnNodesChange = this.storeOnNodesChange();

      if (!userOnNodesChange || this.intercepted) {
        return;
      }

      this.intercepted = true;
      const limit = this.limit();

      const onNodesChangeLogger: OnNodesChange = (changes) => {
        userOnNodesChange(changes);

        this.changes.update((current) => {
          let next = current;
          for (const change of changes) {
            if (next.length >= limit) {
              next = next.slice(0, limit - 1);
            }
            next = [change, ...next];
          }
          return next;
        });
      };

      this.store.setState({ onNodesChange: onNodesChangeLogger });
    });
  }
}
