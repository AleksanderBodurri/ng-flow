import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  Background,
  BackgroundVariant,
  type Edge,
  NgFlow,
  NgFlowProvider,
  type Node,
  useEdgesState,
  useNodesState,
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

// This is bad practise. You should either use a controlled or an uncontrolled component.
// This is just an example for testing the API.
@Component({
  selector: 'app-controlled-uncontrolled-flow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="nodesState.nodes()"
      [edges]="edgesState.edges()"
      [defaultNodes]="defaultNodes"
      [defaultEdges]="defaultEdges"
      [onNodesChange]="nodesState.onNodesChange"
      [onEdgesChange]="edgesState.onEdgesChange"
      [defaultEdgeOptions]="defaultEdgeOptions"
      [fitView]="true"
    >
      <ng-flow-background [variant]="BackgroundVariant.Lines" />

      <div style="position: absolute; right: 10px; top: 10px; z-index: 4;">
        <button type="button" (click)="resetTransform()" style="margin-right: 5px;">reset transform</button>
        <button type="button" (click)="updateNodePositions()" style="margin-right: 5px;">change pos</button>
        <button type="button" (click)="updateEdgeColors()" style="margin-right: 5px;">red edges</button>
        <button type="button" (click)="logToObject()">toObject</button>
      </div>
    </ng-flow>
  `,
})
export class ControlledUncontrolledFlow {
  protected readonly BackgroundVariant = BackgroundVariant;
  protected readonly defaultNodes = defaultNodes;
  protected readonly defaultEdges = defaultEdges;
  protected readonly defaultEdgeOptions = defaultEdgeOptions;

  protected readonly nodesState = useNodesState(defaultNodes);
  protected readonly edgesState = useEdgesState(defaultEdges);
  private readonly instance = useReactFlow();

  protected logToObject(): void {
    console.log(this.instance.toObject());
  }

  protected resetTransform(): void {
    this.instance.setViewport({ x: 0, y: 0, zoom: 1 });
  }

  protected updateNodePositions(): void {
    this.instance.setNodes((nodes) =>
      nodes.map((node) => {
        return {
          ...node,
          position: {
            x: Math.random() * 400,
            y: Math.random() * 400,
          },
        };
      })
    );
  }

  protected updateEdgeColors(): void {
    this.instance.setEdges((edges) =>
      edges.map((edge) => {
        return {
          ...edge,
          style: {
            stroke: '#ff5050',
          },
        };
      })
    );
  }
}

@Component({
  selector: 'app-controlled-uncontrolled',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, ControlledUncontrolledFlow],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow-provider style="display:block;height:100%">
      <app-controlled-uncontrolled-flow />
    </ng-flow-provider>
  `,
})
export class ControlledUncontrolledPage {}
