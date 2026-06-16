import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Background, BackgroundVariant, type Edge, type Node, NgFlow } from 'ng-flow';

import { CustomEdge } from './custom-edge';

const initialNodes: Node[] = [
  {
    id: '1',
    data: { label: 'Node 1' },
    position: { x: 250, y: 5 },
    className: 'light',
  },
  {
    id: '2',
    data: { label: 'Node 2' },
    position: { x: 100, y: 100 },
    className: 'light',
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'unregistered', // This will fallback to custom default
  },
];

@Component({
  selector: 'app-default-edge-overwrite',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow [defaultNodes]="nodes" [defaultEdges]="edges" [edgeTypes]="edgeTypes" [fitView]="true">
      <ng-flow-background [variant]="BackgroundVariant.Lines" />
    </ng-flow>
  `,
})
export class DefaultEdgeOverwritePage {
  protected readonly BackgroundVariant = BackgroundVariant;
  protected readonly nodes = initialNodes;
  protected readonly edges = initialEdges;
  // Overwrite the built-in `default` edge type; the `unregistered` edge falls back to it.
  protected readonly edgeTypes = { default: CustomEdge };
}
