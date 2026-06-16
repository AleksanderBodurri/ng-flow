import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import localforage from 'localforage';
import {
  type Edge,
  type Node,
  type ReactFlowJsonObject,
  useReactFlow,
} from 'ng-flow';

localforage.config({
  name: 'react-flow',
  storeName: 'flows',
});

const flowKey = 'example-flow';

const getNodeId = () => `randomnode_${+new Date()}`;

/** Setter signature matching `useNodesState`/`useEdgesState` (value or updater fn). */
type SetNodes = (payload: Node[] | ((nodes: Node[]) => Node[])) => void;
type SetEdges = (payload: Edge[] | ((edges: Edge[]) => Edge[])) => void;

/**
 * Save / restore / add-node controls. The Angular port of React Flow's `SaveRestore/Controls`.
 *
 * Persists the flow to `localforage` (`toObject()` -> `setItem`) and restores it
 * (`getItem` -> `setNodes`/`setEdges`/`setViewport`). The state setters are passed in from the
 * page (React passed `setNodes`/`setEdges` props); `useReactFlow()` supplies `toObject` and
 * `setViewport`. Must live under the flow/provider so the hook resolves.
 */
@Component({
  selector: 'app-save-restore-controls',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="controls">
      <button type="button" class="button" (click)="onSave()">save</button>
      <button type="button" class="button" (click)="onRestore()">restore</button>
      <button type="button" class="button" (click)="onAdd()">add node</button>
    </div>
  `,
  styles: [
    `
      .controls {
        position: absolute;
        right: 10px;
        top: 10px;
        z-index: 4;
        font-size: 12px;
      }

      .button {
        margin-left: 5px;
      }
    `,
  ],
})
export class SaveRestoreControls {
  readonly setNodes = input.required<SetNodes>();
  readonly setEdges = input.required<SetEdges>();

  private readonly flow = useReactFlow();

  protected onSave(): void {
    const flow = this.flow.toObject();
    localforage.setItem(flowKey, flow);
  }

  protected onRestore(): void {
    const restoreFlow = async () => {
      const flow = (await localforage.getItem(flowKey)) as ReactFlowJsonObject | null;

      if (flow) {
        const { x, y, zoom } = flow.viewport;

        this.setNodes()(flow.nodes || []);
        this.setEdges()(flow.edges || []);
        this.flow.setViewport({ x, y, zoom: zoom || 0 });
      }
    };

    restoreFlow();
  }

  protected onAdd(): void {
    const newNode: Node = {
      id: `random_node-${getNodeId()}`,
      data: { label: 'Added node' },
      position: {
        x: Math.random() * window.innerWidth - 100,
        y: Math.random() * window.innerHeight,
      },
    };
    this.setNodes()((nds) => nds.concat(newNode));
  }
}
