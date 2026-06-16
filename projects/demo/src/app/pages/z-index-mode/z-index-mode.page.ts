import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  addEdge,
  Background,
  type Connection,
  Controls,
  type Edge,
  MiniMap,
  NgFlow,
  NgFlowProvider,
  type Node,
  Panel,
  Position,
  useEdgesState,
  useNodesState,
  type ZIndexMode,
} from 'ng-flow';

const nodeDefaults = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
};

const initialNodes: Node[] = [
  { id: 'A', type: 'input', position: { x: 0, y: 150 }, data: { label: 'A' }, ...nodeDefaults },
  { id: 'B', position: { x: 250, y: 0 }, data: { label: 'B' }, ...nodeDefaults },
  { id: 'C', position: { x: 250, y: 150 }, data: { label: 'C' }, ...nodeDefaults },

  // group 1
  { id: 'D', position: { x: 0, y: 300 }, width: 200, height: 200, data: { label: 'D' }, ...nodeDefaults },
  { id: 'E', parentId: 'D', position: { x: 10, y: 10 }, data: { label: 'E' }, ...nodeDefaults },

  // group 2
  { id: 'F', position: { x: 250, y: 300 }, width: 200, height: 200, data: { label: 'F' }, ...nodeDefaults },
  { id: 'G', parentId: 'F', position: { x: 10, y: 10 }, data: { label: 'G' }, ...nodeDefaults },

  // group 3
  { id: 'H', position: { x: 500, y: 300 }, width: 200, height: 200, data: { label: 'H' }, ...nodeDefaults },
  { id: 'I', parentId: 'H', position: { x: 10, y: 10 }, data: { label: 'I' }, ...nodeDefaults },
];

const initialEdges: Edge[] = [
  { id: 'A-B', source: 'A', target: 'B' },
  { id: 'A-C', source: 'A', target: 'C' },
];

/**
 * Inner component rendered UNDER `<ng-flow-provider>` so `useNodesState`/`useEdgesState`
 * resolve in field initializers. Mirrors React's `ZIndexModeFlow`: a `<select>` switches
 * `zIndexMode` between manual/basic/auto over parent/child node groups.
 */
@Component({
  selector: 'app-z-index-mode-inner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background, Controls, MiniMap, Panel],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="nodesState.nodes()"
      [edges]="edgesState.edges()"
      [onNodesChange]="nodesState.onNodesChange"
      [onEdgesChange]="edgesState.onEdgesChange"
      [onConnect]="onConnect"
      [zIndexMode]="zIndexMode()"
      [fitView]="true"
    >
      <ng-flow-minimap />
      <ng-flow-background />
      <ng-flow-controls />

      <ng-flow-panel position="top-right">
        <select [value]="zIndexMode()" (change)="onChange($event)" data-testid="zindexmode-select">
          <option value="manual">manual</option>
          <option value="basic">basic</option>
          <option value="auto">auto</option>
        </select>
      </ng-flow-panel>
    </ng-flow>
  `,
})
export class ZIndexModeInner {
  protected readonly zIndexMode = signal<ZIndexMode>('auto');
  protected readonly nodesState = useNodesState(initialNodes);
  protected readonly edgesState = useEdgesState(initialEdges);

  protected readonly onConnect = (params: Connection): void => {
    this.edgesState.setEdges((eds) => addEdge(params, eds));
  };

  protected onChange(evt: Event): void {
    this.zIndexMode.set((evt.target as HTMLSelectElement).value as ZIndexMode);
  }
}

/**
 * Angular port of React Flow's `ZIndexMode` example. Wraps the inner flow in
 * `<ng-flow-provider>` so the node/edge state hooks are available.
 */
@Component({
  selector: 'app-z-index-mode',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, ZIndexModeInner],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow-provider>
      <app-z-index-mode-inner />
    </ng-flow-provider>
  `,
})
export class ZIndexModePage {}
