import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
  Background,
  Controls,
  type Edge,
  MiniMap,
  NgFlow,
  NgFlowProvider,
  type Node,
  type Rect,
  useNodesState,
  useReactFlow,
} from 'ng-flow';

const initialNodes: Node[] = [
  {
    id: '0',
    data: { label: 'rectangle' },
    position: { x: 0, y: 0 },
    width: 100,
    height: 100,
    draggable: false,
    style: { opacity: 0.5 },
  },
  { id: '1', type: 'input', data: { label: 'Node 1' }, position: { x: 0, y: 0 }, width: 200, height: 100 },
  { id: '2', data: { label: 'Node 2' }, position: { x: 0, y: 150 } },
  { id: '3', data: { label: 'Node 3' }, position: { x: 250, y: 0 } },
  { id: '4', data: { label: 'Node' }, position: { x: 350, y: 150 }, style: { width: 50, height: 50 } },
];

const initialEdges: Edge[] = [];

const defaultEdgeOptions = { zIndex: 0 };

// The fixed rectangle area tested against by `isNodeIntersecting` (matches the static node id '0').
const fixedRect: Rect = { x: 0, y: 0, width: 100, height: 100 };

/**
 * Inner component rendered UNDER `<ng-flow-provider>` so `useReactFlow()` works in a field
 * initializer. Mirrors React's `BasicFlow`: while a node is dragged, `getIntersectingNodes`
 * returns every node it currently overlaps and each is given the `highlight` className (turning
 * it red); `isNodeIntersecting` additionally tests the dragged node against the fixed top-left
 * rectangle and logs the boolean.
 */
@Component({
  selector: 'app-intersection-inner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Unencapsulated so the `.highlight` class on the flow's node elements is styled.
  encapsulation: ViewEncapsulation.None,
  imports: [NgFlow, Background, Controls, MiniMap],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="ns.nodes()"
      [edges]="edges"
      [onNodesChange]="ns.onNodesChange"
      [onNodeClick]="onNodeClick"
      [onNodeDragStop]="onNodeDragStop"
      [onNodeDrag]="onNodeDrag"
      class="react-flow-basic-example"
      [minZoom]="0.2"
      [maxZoom]="4"
      [fitView]="true"
      [defaultEdgeOptions]="defaultEdgeOptions"
      [selectNodesOnDrag]="false"
    >
      <ng-flow-background />
      <ng-flow-minimap />
      <ng-flow-controls />
    </ng-flow>
  `,
  styles: [
    `
      .react-flow__node.highlight {
        background-color: #ff5050;
        color: white;
      }
    `,
  ],
})
export class IntersectionInner {
  protected readonly edges = initialEdges;
  protected readonly defaultEdgeOptions = defaultEdgeOptions;

  protected readonly ns = useNodesState(initialNodes);

  private readonly flow = useReactFlow();

  protected readonly onNodeDrag = (_: MouseEvent | TouchEvent, node: Node): void => {
    const intersections = this.flow.getIntersectingNodes(node).map((n) => n.id);
    const isIntersecting = this.flow.isNodeIntersecting(node, fixedRect);

    console.log(isIntersecting);

    this.ns.setNodes((ns) =>
      ns.map((n) => ({
        ...n,
        className: intersections.includes(n.id) ? 'highlight' : '',
      }))
    );
  };

  protected readonly onNodeClick = (_: MouseEvent, node: Node): void => console.log('click', node);
  protected readonly onNodeDragStop = (_: MouseEvent | TouchEvent, node: Node): void =>
    console.log('drag stop', node);
}

/**
 * React `Intersection` example (the exported `App`): wraps the flow in a provider so the
 * page-level `useReactFlow()` call resolves the store.
 */
@Component({
  selector: 'app-intersection',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, IntersectionInner],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow-provider>
      <app-intersection-inner />
    </ng-flow-provider>
  `,
})
export class IntersectionPage {}
