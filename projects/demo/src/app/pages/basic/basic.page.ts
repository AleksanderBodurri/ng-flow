import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  type FitViewOptions,
  MiniMap,
  NgFlow,
  NgFlowProvider,
  type Node,
  Panel,
  useReactFlow,
} from 'ng-flow';

const initialNodes: Node[] = [
  { id: '1', type: 'input', data: { label: 'Node 1' }, position: { x: 250, y: 5 }, className: 'light' },
  { id: '2', data: { label: 'Node 2' }, position: { x: 100, y: 100 }, className: 'light' },
  { id: '3', data: { label: 'Node 3' }, position: { x: 400, y: 100 }, className: 'light' },
  { id: '4', data: { label: 'Node 4' }, position: { x: 400, y: 200 }, className: 'light' },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3' },
];

const defaultEdgeOptions = {};
const fitViewOptions: FitViewOptions = {
  padding: { top: '100px', left: '0%', right: '10%', bottom: 0.1 },
};

@Component({
  selector: 'app-basic-flow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background, Controls, MiniMap, Panel],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [defaultNodes]="initialNodes"
      [defaultEdges]="initialEdges"
      [onNodesChange]="logChange"
      [onNodeClick]="onNodeClick"
      [onNodeDragStart]="onNodeDragStart"
      [onNodeDrag]="onNodeDrag"
      [onNodeDragStop]="onNodeDragStop"
      [onSelectionDragStart]="printSelection('selection drag start')"
      [onSelectionDrag]="printSelection('selection drag')"
      [onSelectionDragStop]="printSelection('selection drag stop')"
      class="react-flow-basic-example"
      [style.display]="isHidden() ? 'none' : 'block'"
      [minZoom]="0.2"
      [maxZoom]="4"
      [fitView]="true"
      [fitViewOptions]="fitViewOptions"
      [defaultEdgeOptions]="defaultEdgeOptions"
      [selectNodesOnDrag]="false"
      [elevateEdgesOnSelect]="true"
      [elevateNodesOnSelect]="false"
      [autoPanOnSelection]="true"
      [nodeDragThreshold]="0"
    >
      <ng-flow-background [variant]="BackgroundVariant.Dots" />
      <ng-flow-minimap />
      <ng-flow-controls />
      <ng-flow-panel position="top-right">
        <button type="button" (click)="resetTransform()">reset transform</button>
        <button type="button" (click)="updatePos()">change pos</button>
        <button type="button" (click)="toggleClassnames()">toggle classnames</button>
        <button type="button" (click)="logToObject()">toObject</button>
        <button type="button" (click)="deleteSelectedElements()">deleteSelectedElements</button>
        <button type="button" (click)="deleteSomeElements()">deleteSomeElements</button>
        <button type="button" (click)="onSetNodes()">setNodes</button>
        <button type="button" (click)="onUpdateNode()">updateNode</button>
        <button type="button" (click)="addNode()">addNode</button>
      </ng-flow-panel>
    </ng-flow>
    <button type="button" (click)="toggleVisibility()" style="position:absolute;z-index:10;right:10px;top:100px">
      {{ isHidden() ? 'Show' : 'Hide' }} Flow
    </button>
  `,
})
export class BasicFlow {
  protected readonly BackgroundVariant = BackgroundVariant;
  protected readonly initialNodes = initialNodes;
  protected readonly initialEdges = initialEdges;
  protected readonly defaultEdgeOptions = defaultEdgeOptions;
  protected readonly fitViewOptions = fitViewOptions;
  protected readonly isHidden = signal(false);

  private readonly flow = useReactFlow();

  protected readonly logChange = (changes: unknown) => console.log(changes);
  protected readonly onNodeClick = (_: MouseEvent, node: Node) => console.log('click', node);
  protected readonly onNodeDragStart = (_: MouseEvent | TouchEvent, node: Node, nodes: Node[]) =>
    console.log('drag start', node, nodes);
  protected readonly onNodeDrag = (_: MouseEvent | TouchEvent, node: Node, nodes: Node[]) =>
    console.log('drag', node, nodes);
  protected readonly onNodeDragStop = (_: MouseEvent | TouchEvent, node: Node, nodes: Node[]) =>
    console.log('drag stop', node, nodes);
  protected readonly printSelection =
    (name: string) =>
    (_: MouseEvent, nodes: Node[]): void =>
      console.log(name, nodes);

  protected resetTransform(): void {
    this.flow.setViewport({ x: 0, y: 0, zoom: 1 });
  }

  protected updatePos(): void {
    this.flow.setNodes((nodes) =>
      nodes.map((node) => ({ ...node, position: { x: Math.random() * 400, y: Math.random() * 400 } }))
    );
  }

  protected toggleClassnames(): void {
    this.flow.setNodes((nodes) =>
      nodes.map((node) => ({ ...node, className: node.className === 'light' ? 'dark' : 'light' }))
    );
  }

  protected logToObject(): void {
    console.log(this.flow.toObject());
  }

  protected deleteSelectedElements(): void {
    const selectedNodes = this.flow.getNodes().filter((node) => node.selected);
    const selectedEdges = this.flow.getEdges().filter((edge) => edge.selected);
    this.flow.deleteElements({ nodes: selectedNodes, edges: selectedEdges });
  }

  protected deleteSomeElements(): void {
    this.flow.deleteElements({ nodes: [{ id: '2' }], edges: [{ id: 'e1-3' }] });
  }

  protected onSetNodes(): void {
    this.flow.setNodes([
      { id: 'a', position: { x: 0, y: 0 }, data: { label: 'Node a' } },
      { id: 'b', position: { x: 0, y: 150 }, data: { label: 'Node b' } },
    ]);
    this.flow.setEdges([{ id: 'a-b', source: 'a', target: 'b' }]);
    this.flow.fitView();
  }

  protected onUpdateNode(): void {
    this.flow.updateNodeData('1', { label: 'update' });
    this.flow.updateNodeData('2', { label: 'update' });
  }

  protected addNode(): void {
    this.flow.addNodes({
      id: `${Math.random()}`,
      data: { label: 'Node' },
      position: { x: Math.random() * 300, y: Math.random() * 300 },
      className: 'light',
    });
    this.flow.fitView();
  }

  protected toggleVisibility(): void {
    this.isHidden.update((v) => !v);
  }
}

/**
 * Angular port of React Flow's Basic example — the kitchen-sink showcase with the full
 * imperative `useReactFlow` API exercised via panel buttons. Wrapped in `<ng-flow-provider>`
 * so the inner flow component can call `useReactFlow()` (mirrors React's `<ReactFlowProvider>`).
 */
@Component({
  selector: 'app-basic',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, BasicFlow],
  host: { style: 'display:block;height:100%' },
  template: `<ng-flow-provider style="display:block;height:100%"><app-basic-flow /></ng-flow-provider>`,
})
export class BasicPage {}
