import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  Background,
  BackgroundVariant,
  type Edge,
  type Node,
  NgFlow,
  NgFlowProvider,
  Panel,
  useReactFlow,
} from 'ng-flow';

const defaultNodes: Node[] = [
  {
    id: '1',
    type: 'input',
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
  {
    id: '3',
    type: 'output',
    data: { label: 'Node 3' },
    position: { x: 400, y: 100 },
    className: 'light',
  },
  {
    id: '4',
    data: { label: 'Node 4' },
    position: { x: 400, y: 200 },
    className: 'light',
  },
];

const defaultEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
];

const defaultEdgeOptions = {
  animated: true,
};

@Component({
  selector: 'app-default-nodes-flow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background, Panel],
  template: `
    <ng-flow
      [defaultNodes]="defaultNodes"
      [defaultEdges]="defaultEdges"
      [defaultEdgeOptions]="defaultEdgeOptions"
      [fitView]="true"
    >
      <ng-flow-background [variant]="BackgroundVariant.Lines" />

      <ng-flow-panel position="top-right">
        <button (click)="resetTransform()">reset transform</button>
        <button (click)="updateNodePositions()">change pos</button>
        <button (click)="updateEdgeColors()">red edges</button>
        <button (click)="logToObject()">toObject</button>
      </ng-flow-panel>
    </ng-flow>
  `,
})
export class DefaultNodesFlowComponent {
  protected readonly BackgroundVariant = BackgroundVariant;
  protected readonly defaultNodes = defaultNodes;
  protected readonly defaultEdges = defaultEdges;
  protected readonly defaultEdgeOptions = defaultEdgeOptions;

  private readonly instance = useReactFlow();

  protected logToObject(): void {
    console.log(this.instance.toObject());
  }

  protected resetTransform(): void {
    this.instance.setViewport({ x: 0, y: 0, zoom: 1 });
  }

  protected updateNodePositions(): void {
    this.instance.setNodes((nodes) =>
      nodes.map((node) => ({
        ...node,
        position: {
          x: Math.random() * 400,
          y: Math.random() * 400,
        },
      }))
    );
  }

  protected updateEdgeColors(): void {
    this.instance.setEdges((edges) =>
      edges.map((edge) => ({
        ...edge,
        style: {
          stroke: '#ff5050',
        },
      }))
    );
  }
}

@Component({
  selector: 'app-default-nodes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, DefaultNodesFlowComponent],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow-provider>
      <app-default-nodes-flow />
    </ng-flow-provider>
  `,
})
export class DefaultNodesPage {}
