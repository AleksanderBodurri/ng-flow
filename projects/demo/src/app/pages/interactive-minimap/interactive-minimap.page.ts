import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  MiniMap,
  NgFlow,
  NgFlowProvider,
  type Node,
  useReactFlow,
  type XYPosition,
} from 'ng-flow';

const onNodeDrag = (_: MouseEvent | TouchEvent, node: Node): void => console.log('drag', node);
const onNodeDragStop = (_: MouseEvent | TouchEvent, node: Node): void => console.log('drag stop', node);
const onNodeClick = (_: MouseEvent, node: Node): void => console.log('click', node);

const initialNodes: Node[] = [
  { id: '1', data: { label: 'Node 1' }, position: { x: 0, y: 0 } },
  { id: '2', data: { label: 'Node 2' }, position: { x: 0, y: 200 } },
  { id: '3', data: { label: 'Node 3' }, position: { x: 200, y: 0 } },

  { id: '4', data: { label: 'Node 4' }, position: { x: 1000, y: 0 } },
  { id: '5', data: { label: 'Node 5' }, position: { x: 1000, y: 200 } },
  { id: '6', data: { label: 'Node 6' }, position: { x: 800, y: 0 } },

  { id: '7', data: { label: 'Node 4' }, position: { x: 0, y: 1000 } },
  { id: '8', data: { label: 'Node 5' }, position: { x: 0, y: 800 } },
  { id: '9', data: { label: 'Node 6' }, position: { x: 200, y: 1000 } },

  { id: '10', data: { label: 'Node 4' }, position: { x: 1000, y: 1000 } },
  { id: '11', data: { label: 'Node 5' }, position: { x: 800, y: 1000 } },
  { id: '12', data: { label: 'Node 6' }, position: { x: 1000, y: 800 } },
];

const initialEdges: Edge[] = [];

const defaultEdgeOptions = { zIndex: 0 };

/**
 * Inner component rendered UNDER `<ng-flow-provider>` so `useReactFlow()` resolves in the
 * field initializer. Mirrors React's `BasicFlow`: imperative buttons (reset transform,
 * change pos, toggle classnames, toObject, inverse-pan toggle) plus a pannable/zoomable
 * `MiniMap` whose `inversePan` is toggled and which logs `onClick`/`onNodeClick`.
 */
@Component({
  selector: 'app-interactive-minimap-inner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background, Controls, MiniMap],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [defaultNodes]="initialNodes"
      [defaultEdges]="initialEdges"
      [onNodeClick]="onNodeClick"
      [onNodeDragStop]="onNodeDragStop"
      [onNodeDrag]="onNodeDrag"
      class="react-flow-basic-example"
      [minZoom]="0.2"
      [maxZoom]="4"
      [defaultEdgeOptions]="defaultEdgeOptions"
      [selectNodesOnDrag]="false"
      [fitView]="true"
    >
      <ng-flow-background [variant]="BackgroundVariant.Dots" />
      <ng-flow-minimap
        (onClick)="onMiniMapClick($event.event, $event.position)"
        (onNodeClick)="onMiniMapNodeClick($event.event, $event.node)"
        [pannable]="true"
        [zoomable]="true"
        [inversePan]="inverse()"
      />
      <ng-flow-controls />

      <div style="position: absolute; right: 10px; top: 10px; z-index: 4">
        <button (click)="resetTransform()" style="margin-right: 5px">reset transform</button>
        <button (click)="updatePos()" style="margin-right: 5px">change pos</button>
        <button (click)="toggleClassnames()" style="margin-right: 5px">toggle classnames</button>
        <button (click)="logToObject()" style="margin-right: 5px">toObject</button>
        <button (click)="toggleInverse()" style="margin-right: 5px">
          {{ inverse() ? 'un-inverse pan' : 'inverse pan' }}
        </button>
      </div>
    </ng-flow>
  `,
})
export class InteractiveMinimapInner {
  protected readonly BackgroundVariant = BackgroundVariant;
  protected readonly initialNodes = initialNodes;
  protected readonly initialEdges = initialEdges;
  protected readonly defaultEdgeOptions = defaultEdgeOptions;
  protected readonly onNodeClick = onNodeClick;
  protected readonly onNodeDrag = onNodeDrag;
  protected readonly onNodeDragStop = onNodeDragStop;

  protected readonly inverse = signal(false);

  private readonly instance = useReactFlow();

  protected updatePos(): void {
    this.instance.setNodes((nodes) =>
      nodes.map((node) => {
        node.position = {
          x: Math.random() * 400,
          y: Math.random() * 400,
        };
        return node;
      })
    );
  }

  protected logToObject(): void {
    console.log(this.instance.toObject());
  }

  protected resetTransform(): void {
    this.instance.setViewport({ x: 0, y: 0, zoom: 1 });
  }

  protected toggleInverse(): void {
    this.inverse.update((v) => !v);
  }

  protected toggleClassnames(): void {
    this.instance.setNodes((nodes) =>
      nodes.map((node) => {
        node.className = node.className === 'light' ? 'dark' : 'light';
        return node;
      })
    );
  }

  protected onMiniMapClick(_event: MouseEvent, pos: XYPosition): void {
    console.log(pos);
  }

  protected onMiniMapNodeClick(_event: MouseEvent, node: Node): void {
    console.log(node);
  }
}

/**
 * Angular port of React Flow's `InteractiveMinimap` example. Wraps the inner flow in
 * `<ng-flow-provider>` so the imperative `useReactFlow()` API is available.
 */
@Component({
  selector: 'app-interactive-minimap',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, InteractiveMinimapInner],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow-provider>
      <app-interactive-minimap-inner />
    </ng-flow-provider>
  `,
})
export class InteractiveMinimapPage {}
