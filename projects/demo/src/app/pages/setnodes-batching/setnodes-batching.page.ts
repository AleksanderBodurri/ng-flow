import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  NgFlow,
  NgFlowProvider,
  type Node,
  Panel,
  useReactFlow,
} from 'ng-flow';

// The three nodes that the batched calls progressively add (React's `a`, `b`, `c`).
const a: Node = { id: 'a', data: { label: 'A' }, position: { x: 250, y: 5 } };
const b: Node = { id: 'b', data: { label: 'B' }, position: { x: 100, y: 100 } };
const c: Node = { id: 'c', data: { label: 'C' }, position: { x: 400, y: 100 } };

/**
 * Inner component rendered UNDER `<ng-flow-provider>` so `useReactFlow()` resolves the store.
 * Mirrors React's `SetNotesBatchingFlow`. The flow starts EMPTY (`defaultNodes={[]}`); each
 * button queues MULTIPLE imperative calls inside a single synchronous handler to verify they
 * are batched into one render:
 *  - "queue multiple setNodes calls": replace, then two functional appends, then a functional map.
 *  - "queue multiple updateNode calls": runs the above, then 6 `updateNode` calls (position +
 *    label updates for a/b/c), each via a functional updater.
 */
@Component({
  selector: 'app-setnodes-batching-inner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background, MiniMap, Controls, Panel],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      class="react-flow-basic-example"
      [defaultNodes]="[]"
      [defaultEdges]="[]"
      [minZoom]="0.2"
      [maxZoom]="4"
      [fitView]="true"
    >
      <ng-flow-background [variant]="BackgroundVariant.Dots" />
      <ng-flow-minimap />
      <ng-flow-controls />
      <ng-flow-panel position="top-right">
        <button type="button" (click)="triggerMultipleSetNodes()">queue multiple setNodes calls</button>
        <button type="button" (click)="triggerMultipleUpdateNodes()">queue multiple updateNode calls</button>
      </ng-flow-panel>
    </ng-flow>
  `,
})
export class SetNodesBatchingInner {
  private readonly flow = useReactFlow();

  protected triggerMultipleSetNodes(): void {
    this.flow.setNodes([a]);
    this.flow.setNodes((nodes) => [...nodes, b]);
    this.flow.setNodes((nodes) => [...nodes, c]);
    this.flow.setNodes((nodes) =>
      nodes.map((node) =>
        node.id === 'a' ? { ...node, position: { x: node.position.x + 20, y: node.position.y + 20 } } : node
      )
    );
  }

  protected triggerMultipleUpdateNodes(): void {
    this.triggerMultipleSetNodes();
    this.flow.updateNode('a', (a) => ({ position: { x: a.position.x + 20, y: a.position.y + 20 } }));
    this.flow.updateNode('b', (b) => ({ position: { x: b.position.x + 20, y: b.position.y + 20 } }));
    this.flow.updateNode('c', (c) => ({ position: { x: c.position.x + 20, y: c.position.y + 20 } }));
    this.flow.updateNode('a', (a) => ({ data: { ...a.data, label: `A ${Date.now()}` } }));
    this.flow.updateNode('b', (b) => ({ data: { ...b.data, label: `B ${Date.now()}` } }));
    this.flow.updateNode('c', (c) => ({ data: { ...c.data, label: `C ${Date.now()}` } }));
  }

  protected readonly BackgroundVariant = BackgroundVariant;
}

@Component({
  selector: 'app-setnodes-batching',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, SetNodesBatchingInner],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow-provider style="display:block;height:100%">
      <app-setnodes-batching-inner />
    </ng-flow-provider>
  `,
})
export class SetNodesBatchingPage {}
