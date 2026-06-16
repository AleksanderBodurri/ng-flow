import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { experimental_useOnNodesChangeMiddleware, type NodeChange } from 'ng-flow';

/**
 * React `RestrictExtent`: a checkbox that, while enabled, registers a node-changes middleware
 * clamping every node `position` (and the `position` of `add`/`replace` items) to the given
 * `[minX, maxX] × [minY, maxY]` extent before the changes are applied.
 *
 * The ng-flow `experimental_useOnNodesChangeMiddleware` accepts a `Signal<fn>`, so a `computed`
 * middleware that closes over the `isEnabled` signal re-registers automatically on toggle
 * (mirroring React's `useCallback` dependency array). When disabled the middleware is a no-op
 * pass-through. Must live under `<ng-flow-provider>` so the store is available.
 */
@Component({
  selector: 'app-middlewares-restrict-extent',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" [checked]="isEnabled()" (change)="onToggle($event)" />
        {{ label() }}
      </label>
    </div>
  `,
})
export class MiddlewaresRestrictExtent {
  readonly label = input('Restrict Extent');
  readonly minX = input(-Infinity);
  readonly minY = input(-Infinity);
  readonly maxX = input(Infinity);
  readonly maxY = input(Infinity);

  protected readonly isEnabled = signal(false);

  // Recomputed when the bounds or the enabled flag change; the hook re-registers on change.
  private readonly middleware = computed(() => {
    const enabled = this.isEnabled();
    const minX = this.minX();
    const minY = this.minY();
    const maxX = this.maxX();
    const maxY = this.maxY();

    return (changes: NodeChange[]): NodeChange[] => {
      if (!enabled) return changes;
      return changes.map((change) => {
        const { type } = change;
        if (type === 'position') {
          const { position } = change;
          if (position) {
            position.x = Math.min(Math.max(position.x, minX), maxX);
            position.y = Math.min(Math.max(position.y, minY), maxY);
            change.position = position;
          }
        } else if (type === 'add' || type === 'replace') {
          const { item } = change;
          if (item) {
            item.position.x = Math.min(Math.max(item.position.x, minX), maxX);
            item.position.y = Math.min(Math.max(item.position.y, minY), maxY);
            change.item = item;
          }
        }
        return change;
      });
    };
  });

  constructor() {
    experimental_useOnNodesChangeMiddleware(this.middleware);
  }

  protected onToggle(event: Event): void {
    this.isEnabled.set((event.target as HTMLInputElement).checked);
  }
}
