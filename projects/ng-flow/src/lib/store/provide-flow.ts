import { inject, type Provider } from '@angular/core';

import { FlowBatchService } from './flow-batch';
import { FlowStore } from './flow-store';

/**
 * Providers for a single flow's store + batch service.
 *
 * Mirrors React Flow's `Wrapper` reuse-or-create logic: each provider reuses an
 * ancestor's instance if one exists (e.g. an `<ng-flow-provider>` above), otherwise
 * it creates a fresh one. So `<ng-flow>` shares its parent provider's store when
 * wrapped, and owns its own store when standalone — and two sibling `<ng-flow>`s
 * each get isolated stores.
 *
 * Placed on `<ng-flow>` and `<ng-flow-provider>` via the component `providers` array.
 */
export function provideFlow(): Provider[] {
  return [
    {
      provide: FlowStore,
      useFactory: () => inject(FlowStore, { optional: true, skipSelf: true }) ?? new FlowStore(),
    },
    {
      provide: FlowBatchService,
      useFactory: () => inject(FlowBatchService, { optional: true, skipSelf: true }) ?? new FlowBatchService(),
    },
  ];
}
