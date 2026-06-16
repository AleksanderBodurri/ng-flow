import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  type EdgeChange,
  NgFlow,
  type NodeChange,
  type OnSelectionChangeParams,
} from 'ng-flow';

import { FlowStateService } from './state';

/**
 * Redux example — mirrors React Flow's `Redux/index.tsx`, but the external store is an Angular
 * signal-based service (`FlowStateService`) instead of `react-redux` + `@reduxjs/toolkit`.
 *
 * The flow is fully controlled by the service: `nodes`/`edges` are read from its signals and
 * every `onNodesChange`/`onEdgesChange`/`onSelectionChange` is dispatched back into it (the
 * Angular analogue of `dispatch(onNodesChange(e))`). The service is provided here, so it scopes
 * to this page the way React's `<Provider store={store}>` scoped the store to the example.
 */
@Component({
  selector: 'app-redux',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow],
  host: { style: 'display:block;height:100%' },
  providers: [FlowStateService],
  template: `
    <ng-flow
      [nodes]="store.nodes()"
      [edges]="store.edges()"
      [onNodesChange]="onNodesChange"
      [onEdgesChange]="onEdgesChange"
      [onSelectionChange]="onSelectionChange"
      [fitView]="true"
      attributionPosition="top-right"
    />
  `,
})
export class ReduxPage {
  protected readonly store = inject(FlowStateService);

  protected readonly onNodesChange = (changes: NodeChange[]): void => this.store.onNodesChange(changes);
  protected readonly onEdgesChange = (changes: EdgeChange[]): void => this.store.onEdgesChange(changes);
  protected readonly onSelectionChange = (params: OnSelectionChangeParams): void =>
    this.store.setSelectedNodesAndEdges(params);
}
