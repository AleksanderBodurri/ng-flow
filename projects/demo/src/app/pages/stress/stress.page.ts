import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  inject,
  Injector,
  signal,
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
  NgFlow,
  NgFlowProvider,
  type Node,
  type NodeChange,
  Panel,
  useReactFlow,
} from 'ng-flow';

import {
  FrameRecorder,
  generateMouseEventParamsTargetingNode,
  nextFrame,
} from './performance-utils';
import { getNodesAndEdges } from './utils';

const { nodes: initialNodes, edges: initialEdges } = getNodesAndEdges(25, 25);

@Component({
  selector: 'app-stress-flow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Controls, Background, Panel],
  host: { style: 'display:block;height:100%' },
  template: `
    @if (mounted()) {
      <ng-flow
        [nodes]="nodes()"
        [edges]="edges()"
        [onConnect]="onConnect"
        [onNodesChange]="onNodesChange"
        [onEdgesChange]="onEdgeChange"
        [minZoom]="0.2"
        [fitView]="true"
      >
        <ng-flow-controls />
        <ng-flow-background />

        <ng-flow-panel position="top-right">
          <button type="button" (click)="selectNode()">select node</button>
          <button type="button" (click)="dragInViewport()">drag node within the viewport</button>
          <button type="button" (click)="dragOutsideViewport()">drag node outside of the viewport</button>
          <button type="button" (click)="remount()">re-mount</button>
          <button type="button" (click)="updatePos()">change pos</button>
          <button type="button" (click)="updateElements()">update elements</button>
          <button type="button" (click)="addElement()">Add element</button>
        </ng-flow-panel>
      </ng-flow>
    }
  `,
})
export class StressFlow {
  private readonly injector = inject(Injector);

  protected readonly nodes = signal<Node[]>(initialNodes);
  protected readonly edges = signal<Edge[]>(initialEdges);
  protected readonly mounted = signal(true);

  private readonly instance = useReactFlow();

  protected readonly onConnect = (connection: Connection): void => {
    this.edges.update((eds) => addEdge(connection, eds));
  };

  protected readonly onNodesChange = (changes: NodeChange[]): void => {
    this.nodes.update((ns) => applyNodeChanges(changes, ns));
  };

  protected readonly onEdgeChange = (changes: EdgeChange[]): void => {
    this.edges.update((es) => applyEdgeChanges(changes, es));
  };

  protected async dragInViewport(): Promise<void> {
    // Note: selecting specifically node 18, as it’s normally located in the right part of the viewport –
    // which means dragging it left is safe to do without scrolling the viewport.
    const nodeElement = document.querySelector('.react-flow__node[data-id="18"]');
    if (!nodeElement) throw new Error('Node with id 18 not found');

    const frameRecorder = new FrameRecorder();

    // Hold down the mouse
    frameRecorder.setStage('mousedown');
    const mouseDownEvent = generateMouseEventParamsTargetingNode(nodeElement);
    nodeElement.dispatchEvent(new MouseEvent('mousedown', mouseDownEvent));
    await nextFrame();

    // Start at the node position and move the mouse 5px to the left on every frame
    frameRecorder.setStage('mousemove');
    let currentXPosition = mouseDownEvent.clientX;
    for (let iteration = 0; iteration < 20; ++iteration) {
      const movementX = -5;
      currentXPosition += movementX;

      nodeElement.dispatchEvent(
        new MouseEvent('mousemove', {
          ...mouseDownEvent,
          clientX: currentXPosition,
          screenX: currentXPosition,
          movementX,
        })
      );
      await nextFrame();
    }

    // Release the mouse
    frameRecorder.setStage('mouseup');
    nodeElement.dispatchEvent(
      new MouseEvent('mouseup', {
        ...mouseDownEvent,
        clientX: currentXPosition,
        screenX: currentXPosition,
      })
    );
    await nextFrame();

    // Log the results
    await frameRecorder.endRecordingAsync();
    console.log('Frame durations:', frameRecorder.getFrames());
    console.log(
      'Frame durations for Observable (copy and paste to https://observablehq.com/@iamakulov/long-frame-visualizer):',
      frameRecorder.getFramesForObservable()
    );
  }

  protected async dragOutsideViewport(): Promise<void> {
    const currentNodes = this.nodes();
    const randomNodeIndex = Math.floor(Math.random() * currentNodes.length);
    const nodeElement = document.querySelector(
      `.react-flow__node[data-id="${currentNodes[randomNodeIndex].id}"]`
    );
    if (!nodeElement) throw new Error('Node not found');

    const frameRecorder = new FrameRecorder();

    // Hold down the mouse
    frameRecorder.setStage('mousedown');
    const mouseDownEvent = generateMouseEventParamsTargetingNode(nodeElement);
    nodeElement.dispatchEvent(new MouseEvent('mousedown', mouseDownEvent));
    await nextFrame();

    // Move the mouse to the top of the viewport (so that the viewport starts
    // scrolling up). Then, wiggle the mouse up and down to keep the viewport
    // scrolling.
    frameRecorder.setStage('mousemove');
    let currentYPosition = 50;
    for (let iteration = 0; iteration < 20; ++iteration) {
      const movementY = Math.random() > 0.5 ? +2 : -2;
      currentYPosition += movementY;

      nodeElement.dispatchEvent(
        new MouseEvent('mousemove', {
          ...mouseDownEvent,
          clientY: currentYPosition,
          screenY: currentYPosition,
          movementY,
        })
      );
      await nextFrame();
    }

    // Release the mouse
    frameRecorder.setStage('mouseup');
    nodeElement.dispatchEvent(
      new MouseEvent('mouseup', {
        ...mouseDownEvent,
        clientY: currentYPosition,
        screenY: currentYPosition,
      })
    );
    await nextFrame();

    // Log the results
    await frameRecorder.endRecordingAsync();
    console.log('Frame durations:', frameRecorder.getFrames());
    console.log(
      'Frame durations for Observable (copy and paste to https://observablehq.com/@iamakulov/long-frame-visualizer):',
      frameRecorder.getFramesForObservable()
    );
  }

  protected async selectNode(): Promise<void> {
    const currentNodes = this.nodes();
    const randomNodeIndex = Math.floor(Math.random() * currentNodes.length);
    const nodeElement = document.querySelector(
      `.react-flow__node[data-id="${currentNodes[randomNodeIndex].id}"]`
    );
    if (!nodeElement) throw new Error('Node not found');

    const frameRecorder = new FrameRecorder();

    const mouseEvent = generateMouseEventParamsTargetingNode(nodeElement);

    // mousedown
    frameRecorder.setStage('mousedown');
    nodeElement.dispatchEvent(new MouseEvent('mousedown', mouseEvent));
    await nextFrame();

    // click
    frameRecorder.setStage('click');
    nodeElement.dispatchEvent(new MouseEvent('click', mouseEvent));
    await nextFrame();

    // mouseup
    frameRecorder.setStage('mouseup');
    nodeElement.dispatchEvent(new MouseEvent('mouseup', mouseEvent));
    await nextFrame();

    // Log the results
    await frameRecorder.endRecordingAsync();
    console.log('Frame durations:', frameRecorder.getFrames());
    console.log(
      'Frame durations for Observable (copy and paste to https://observablehq.com/@iamakulov/long-frame-visualizer):',
      frameRecorder.getFramesForObservable()
    );
  }

  // Mirrors React's `remount()` + `useEffect([key])`: force a fresh mount of the
  // flow and record the frames that the remount produces.
  protected remount(): void {
    const frameRecorder = new FrameRecorder();
    this.mounted.set(false);
    afterNextRender(
      {
        write: () => {
          this.mounted.set(true);
          afterNextRender(
            {
              write: () => {
                frameRecorder.endRecordingAsync().then(() => {
                  console.log('Frame durations:', frameRecorder.getFrames());
                  console.log(
                    'Frame durations for Observable (copy and paste to https://observablehq.com/@iamakulov/long-frame-visualizer):',
                    frameRecorder.getFramesForObservable()
                  );
                });
              },
            },
            { injector: this.injector }
          );
        },
      },
      { injector: this.injector }
    );
  }

  protected updatePos(): void {
    this.nodes.update((nds) =>
      nds.map((n) => ({
        ...n,
        position: {
          x: Math.random() * window.innerWidth * 4,
          y: Math.random() * window.innerHeight * 4,
        },
      }))
    );
    this.instance.fitView();
  }

  protected updateElements(): void {
    const grid = Math.ceil(Math.random() * 10);
    const initialElements = getNodesAndEdges(grid, grid);
    this.nodes.set(initialElements.nodes);
    this.edges.set(initialElements.edges);
  }

  protected addElement(): void {
    this.nodes.update((nds) => [
      ...nds,
      {
        id: (nds.length + 1).toString(),
        position: { x: 0, y: 0 },
        data: { label: `Node ${nds.length + 1}` },
      },
    ]);
  }
}

@Component({
  selector: 'app-stress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, StressFlow],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow-provider style="display:block;height:100%">
      <app-stress-flow />
    </ng-flow-provider>
  `,
})
export class StressPage {}
