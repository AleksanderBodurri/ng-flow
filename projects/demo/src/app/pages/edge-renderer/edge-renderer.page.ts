import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  type Connection,
  Controls,
  type Edge,
  type EdgeChange,
  type KeyCode,
  MiniMap,
  NgFlow,
  type Node,
  type NodeChange,
} from 'ng-flow';

// Reuse the Edges example's custom edge components (mirrors React's EdgeRenderer importing
// `./CustomEdge` / `./CustomEdge2`, which are the same components the Edges example uses).
import { CustomEdge } from '../edges/custom-edge';
import { CustomEdge2 } from '../edges/custom-edge2';
import { getElements } from './get-elements';

const { nodes: initialNodes, edges: initialEdges } = getElements();

/**
 * React `EdgeRenderer` example. Same flow as `Edges` (custom bezier edges with EdgeLabelRenderer
 * labels), but this page additionally exercises custom key codes on the flow:
 *  - selectionKeyCode = 'a+s'   (hold A and S together to draw a selection)
 *  - multiSelectionKeyCode = ['ShiftLeft','ShiftRight']
 *  - deleteKeyCode = ['AltLeft+KeyD','Backspace']
 *  - zoomActivationKeyCode = 'z'
 * Node/edge data is built by the shared `getElements()` util.
 */
@Component({
  selector: 'app-edge-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background, Controls, MiniMap],
  host: { style: 'display:block;height:100%' },
  template: `
    <!-- TemplateRef label for edge e5-6 (React passed two tspan elements as the label). -->
    <ng-template #tspanLabel>
      <svg:tspan>i am using</svg:tspan>
      <svg:tspan [attr.dy]="10" [attr.x]="0">{{ tspanText }}</svg:tspan>
    </ng-template>

    <ng-flow
      [nodes]="nodes()"
      [edges]="edges()"
      [onNodesChange]="onNodesChange"
      [onEdgesChange]="onEdgesChange"
      [onNodeClick]="onNodeClick"
      [onConnect]="onConnect"
      [onNodeDragStop]="onNodeDragStop"
      [snapToGrid]="true"
      [edgeTypes]="edgeTypes"
      [onEdgeClick]="onEdgeClick"
      [onEdgeDoubleClick]="onEdgeDoubleClick"
      [onEdgeMouseEnter]="onEdgeMouseEnter"
      [onEdgeMouseMove]="onEdgeMouseMove"
      [onEdgeMouseLeave]="onEdgeMouseLeave"
      [selectionKeyCode]="selectionKeyCode"
      [multiSelectionKeyCode]="multiSelectionKeyCode"
      [deleteKeyCode]="deleteKeyCode"
      [zoomActivationKeyCode]="zoomActivationKeyCode"
    >
      <ng-flow-minimap />
      <ng-flow-controls />
      <ng-flow-background />
    </ng-flow>
  `,
})
export class EdgeRendererPage {
  protected readonly edgeTypes = { custom: CustomEdge, custom2: CustomEdge2 };
  // Literal text "<tspan>" rendered inside the second tspan (held as data to avoid a raw `<`).
  protected readonly tspanText = '<tspan>';

  // Custom key codes (the distinguishing feature of the EdgeRenderer example).
  protected readonly selectionKeyCode: KeyCode = 'a+s';
  protected readonly multiSelectionKeyCode: KeyCode = ['ShiftLeft', 'ShiftRight'];
  protected readonly deleteKeyCode: KeyCode = ['AltLeft+KeyD', 'Backspace'];
  protected readonly zoomActivationKeyCode: KeyCode = 'z';

  protected readonly nodes = signal<Node[]>(initialNodes);
  protected readonly edges = signal<Edge[]>(initialEdges);

  private readonly tspanLabel = viewChild.required<TemplateRef<unknown>>('tspanLabel');

  constructor() {
    // Assign the TemplateRef label to edge e5-6 once the template is available.
    afterNextRender(() => {
      const tpl = this.tspanLabel();
      this.edges.update((eds) => eds.map((e) => (e.id === 'e5-6' ? { ...e, label: tpl } : e)));
    });
  }

  protected readonly onNodesChange = (changes: NodeChange[]): void => {
    this.nodes.update((nds) => applyNodeChanges(changes, nds));
  };

  protected readonly onEdgesChange = (changes: EdgeChange[]): void => {
    this.edges.update((eds) => applyEdgeChanges(changes, eds));
  };

  protected readonly onConnect = (params: Connection): void => {
    this.edges.update((eds) => addEdge(params, eds));
  };

  protected readonly onNodeClick = (_: MouseEvent, node: Node): void => console.log('click', node);
  protected readonly onNodeDragStop = (_: MouseEvent | TouchEvent, node: Node): void =>
    console.log('drag stop', node);
  protected readonly onEdgeClick = (_: MouseEvent, edge: Edge): void => console.log('click', edge);
  protected readonly onEdgeDoubleClick = (_: MouseEvent, edge: Edge): void => console.log('dblclick', edge);
  protected readonly onEdgeMouseEnter = (_: MouseEvent, edge: Edge): void => console.log('enter', edge);
  protected readonly onEdgeMouseMove = (_: MouseEvent, edge: Edge): void => console.log('move', edge);
  protected readonly onEdgeMouseLeave = (_: MouseEvent, edge: Edge): void => console.log('leave', edge);
}
