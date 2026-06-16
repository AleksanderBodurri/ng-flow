import { ChangeDetectionStrategy, Component } from '@angular/core';
import { type Node, NgFlow, useNodesState } from 'ng-flow';

/**
 * Mirrors React `NodeSelectionBug`. A button adds two nodes that arrive with
 * `selected: true`, while first clearing `selected` on all existing nodes
 * (`nodes.map((node) => ({ ...node, selected: false }))`).
 *
 * The flow is controlled via `useNodesState` and `[onNodesChange]`. Node ids are
 * produced from a plain counter (React's `useRef(0)`), incremented twice per click.
 */
@Component({
  selector: 'app-node-selection-bug',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow],
  host: { style: 'display:block;height:100%' },
  template: `
    <button type="button" (click)="addNodes()">Click me to add nodes that are already selected.</button>
    <ng-flow [nodes]="ns.nodes()" [onNodesChange]="ns.onNodesChange" [fitView]="true"></ng-flow>
  `,
})
export class NodeSelectionBugPage {
  protected readonly ns = useNodesState<Node>([
    {
      id: '0',
      position: { x: 0, y: 0 },
      data: { label: 'Rectangle Select Me First' },
    },
  ]);

  // React: `const id = useRef(0)` — a mutable counter incremented twice per click.
  private id = 0;

  protected addNodes(): void {
    this.ns.setNodes((nodes) => [
      ...nodes.map((node) => ({ ...node, selected: false })),
      {
        id: (++this.id).toString(),
        position: { x: -100, y: 100 * Math.floor((this.id + 1) / 2) },
        data: { label: `Button Node ${this.id}` },
        selected: true,
      },
      {
        id: (++this.id).toString(),
        position: { x: 100, y: (100 * this.id) / 2 },
        data: { label: `Button Node ${this.id}` },
        selected: true,
      },
    ]);
  }
}
