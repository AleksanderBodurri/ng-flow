import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Background, BackgroundVariant, type Node, NgFlow } from 'ng-flow';

import { CustomNode } from './custom-node';

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
    type: 'unregistered',
    position: { x: 100, y: 100 },
    className: 'light',
  },
];

@Component({
  selector: 'app-default-node-overwrite',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow [defaultNodes]="nodes" [nodeTypes]="nodeTypes" [fitView]="true">
      <ng-flow-background [variant]="BackgroundVariant.Lines" />
    </ng-flow>
  `,
})
export class DefaultNodeOverwritePage {
  protected readonly BackgroundVariant = BackgroundVariant;
  protected readonly nodes = initialNodes;
  // Overwrite the built-in `default` node type. Node 2's `unregistered` type falls back to it.
  protected readonly nodeTypes = { default: CustomNode };
}
