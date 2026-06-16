import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  addEdge,
  Background,
  type ColorMode,
  type Connection,
  Controls,
  type Edge,
  MiniMap,
  type Node,
  NgFlow,
  Panel,
  Position,
  useEdgesState,
  useNodesState,
} from 'ng-flow';

const nodeDefaults = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
};

const initialNodes: Node[] = [
  { id: 'A', type: 'input', position: { x: 0, y: 150 }, data: { label: 'A' }, ...nodeDefaults },
  { id: 'B', position: { x: 250, y: 0 }, data: { label: 'B' }, ...nodeDefaults },
  { id: 'C', position: { x: 250, y: 150 }, data: { label: 'C' }, ...nodeDefaults },
  { id: 'D', position: { x: 250, y: 300 }, data: { label: 'D' }, ...nodeDefaults },
];

const initialEdges: Edge[] = [
  { id: 'A-B', source: 'A', target: 'B' },
  { id: 'A-C', source: 'A', target: 'C' },
  { id: 'A-D', source: 'A', target: 'D' },
];

@Component({
  selector: 'app-color-mode',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background, Controls, MiniMap, Panel],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="ns.nodes()"
      [edges]="es.edges()"
      [onNodesChange]="ns.onNodesChange"
      [onEdgesChange]="es.onEdgesChange"
      [onConnect]="onConnect"
      [colorMode]="colorMode()"
      [fitView]="true"
    >
      <ng-flow-minimap />
      <ng-flow-background />
      <ng-flow-controls />

      <ng-flow-panel position="top-right">
        <select (change)="onChange($event)" data-testid="colormode-select">
          <option value="light">light</option>
          <option value="dark">dark</option>
          <option value="system">system</option>
        </select>
      </ng-flow-panel>
    </ng-flow>
  `,
})
export class ColorModePage {
  protected readonly colorMode = signal<ColorMode>('light');
  protected readonly ns = useNodesState(initialNodes);
  protected readonly es = useEdgesState(initialEdges);

  protected readonly onConnect = (params: Connection | Edge): void => {
    console.log('on connect', params);
    this.es.setEdges((eds) => addEdge(params, eds));
  };

  protected onChange(evt: Event): void {
    this.colorMode.set((evt.target as HTMLSelectElement).value as ColorMode);
  }
}
