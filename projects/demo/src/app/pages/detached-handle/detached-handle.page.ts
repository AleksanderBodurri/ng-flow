import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Background, BackgroundVariant, type Edge, NgFlow, type Node } from 'ng-flow';

import { DetachedHandleNode } from './detached-handle-node';

const initialNodes: Node[] = [
  { id: '1', data: { label: 'Node 1' }, position: { x: 250, y: 5 } },
  { id: '2', data: { label: 'Node 2' }, position: { x: 50, y: 100 } },
  { id: '3', data: { label: 'Node 3' }, position: { x: 450, y: 100 } },
];

const initialEdges: Edge[] = [];

@Component({
  selector: 'app-detached-handle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background],
  host: { style: 'display:block;height:100%' },
  styles: [
    `
      :host ::ng-deep .detached-handle {
        position: absolute;
        top: 50%;
        left: 1rem;
        transform: translateY(-50%);
        width: 2rem;
        height: 2rem;
        border: none;
        border-radius: 50%;
      }
    `,
  ],
  template: `
    <ng-flow
      [defaultNodes]="nodes"
      [defaultEdges]="edges"
      [connectionRadius]="10"
      [nodeTypes]="nodeTypes"
      [fitView]="true"
    >
      <ng-flow-background [variant]="BackgroundVariant.Lines" />
    </ng-flow>
  `,
})
export class DetachedHandlePage {
  protected readonly BackgroundVariant = BackgroundVariant;
  protected readonly nodeTypes = { default: DetachedHandleNode };
  protected readonly nodes = initialNodes;
  protected readonly edges = initialEdges;
}
