import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { NodeToolbar, type ReactFlowState, useStore } from 'ng-flow';

// Mirrors React's `selectedNodesSelector`: the ids of every currently-selected node.
const selectedNodesSelector = (state: ReactFlowState): string[] =>
  state.nodes.filter((node) => node.selected).map((node) => node.id);

/**
 * React `NodeToolbar/SelectedNodesToolbar`: a single toolbar rendered for the whole
 * multi-selection by passing the array of selected node ids to `NodeToolbar.nodeId`.
 * It's only visible when more than one node is selected.
 */
@Component({
  selector: 'app-selected-nodes-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NodeToolbar],
  template: `
    <ng-flow-node-toolbar [nodeId]="selectedNodeIds()" [isVisible]="isVisible()">
      <button>Selection action</button>
    </ng-flow-node-toolbar>
  `,
})
export class SelectedNodesToolbar {
  protected readonly selectedNodeIds = useStore(selectedNodesSelector);
  protected readonly isVisible = computed(() => this.selectedNodeIds().length > 1);
}
