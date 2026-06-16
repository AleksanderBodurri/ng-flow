import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  addEdge,
  type Connection,
  type Edge,
  type Node,
  NgFlow,
  Panel,
  useEdgesState,
  useNodesState,
} from 'ng-flow';

const initNodes: Node[] = [
  {
    id: '1a',
    type: 'input',
    data: { label: 'Node 1' },
    position: { x: 250, y: 5 },
    className: 'light',
    ariaLabel: 'Input Node 1',
  },
  {
    id: '2a',
    data: { label: 'Node 2' },
    position: { x: 100, y: 100 },
    className: 'light',
    ariaLabel: 'Default Node 2',
  },
  {
    id: '3a',
    data: { label: 'Node 3' },
    position: { x: 400, y: 100 },
    className: 'light',
  },
  {
    id: '4a',
    data: { label: 'Node 4' },
    position: { x: 400, y: 200 },
    className: 'light',
  },
];

const initEdges: Edge[] = [
  { id: 'e1-2', source: '1a', target: '2a', ariaLabel: undefined },
  { id: 'e1-3', source: '1a', target: '3a' },
];

const onPaneClick = (): void => console.log('pane click');

@Component({
  selector: 'app-click-distance',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Panel],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="ns.nodes()"
      [edges]="es.edges()"
      [onNodesChange]="ns.onNodesChange"
      [onEdgesChange]="es.onEdgesChange"
      [onConnect]="onConnect"
      [paneClickDistance]="paneClickDistance()"
      [onPaneClick]="onPaneClick"
    >
      <ng-flow-panel position="top-right">
        <input
          type="range"
          [min]="0"
          [max]="100"
          [value]="paneClickDistance()"
          (input)="onDistanceChange($event)"
        />
        click distance: {{ paneClickDistance() }}
      </ng-flow-panel>
    </ng-flow>
  `,
})
export class ClickDistancePage {
  protected readonly ns = useNodesState(initNodes);
  protected readonly es = useEdgesState(initEdges);
  protected readonly paneClickDistance = signal(0);

  protected readonly onPaneClick = onPaneClick;

  protected readonly onConnect = (params: Connection | Edge): void =>
    this.es.setEdges((eds) => addEdge(params, eds));

  protected onDistanceChange(evt: Event): void {
    this.paneClickDistance.set(+(evt.target as HTMLInputElement).value);
  }
}
