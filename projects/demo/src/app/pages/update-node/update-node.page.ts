import { ChangeDetectionStrategy, Component, effect, signal } from '@angular/core';
import {
  type Edge,
  NgFlow,
  NgFlowProvider,
  type Node,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from 'ng-flow';

const initialNodes: Node[] = [
  { id: '1', data: { label: '-' }, position: { x: 100, y: 100 } },
  { id: '2', data: { label: 'Node 2' }, position: { x: 100, y: 200 } },
];

const initialEdges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }];

/**
 * Inner component rendered UNDER `<ng-flow-provider>` so `useReactFlow()` (used by the
 * "update position" button) has the store available. Mirrors React `UpdateNode`.
 *
 * Three React `useEffect`s — one per editable field — are ported to Angular `effect()`s on
 * the corresponding signals:
 *  - label   → `setNodes` patches node 1's `data.label` (new object, as the React comment notes)
 *  - background → `setNodes` patches node 1's `style.backgroundColor`
 *  - hidden  → `setNodes` patches `hidden` on node 1 (React's id check `'1' || 'e1-2'`; only
 *              node 1 exists in the node list, so just node 1 toggles)
 *
 * The "update position" button uses the imperative `updateNode('1', node => ...)` to nudge x by 10.
 */
@Component({
  selector: 'app-update-node-inner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="ns.nodes()"
      [edges]="es.edges()"
      [minZoom]="0.2"
      [maxZoom]="4"
      [onNodesChange]="ns.onNodesChange"
      [onEdgesChange]="es.onEdgesChange"
    >
      <div class="controls">
        <label>label:</label>
        <input [value]="nodeName()" (input)="onName($event)" />

        <label class="bgLabel">background:</label>
        <input [value]="nodeBg()" (input)="onBg($event)" />

        <div class="updatenode__checkboxwrapper">
          <label>hidden:</label>
          <input type="checkbox" [checked]="nodeHidden()" (change)="onHidden($event)" />
        </div>

        <button type="button" (click)="updatePosition()">update position</button>
      </div>
    </ng-flow>
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
      .bgLabel {
        margin-top: 10px;
      }
      .updatenode__checkboxwrapper {
        margin-top: 10px;
        display: flex;
        align-items: center;
      }
    `,
  ],
})
export class UpdateNodeInner {
  protected readonly ns = useNodesState(initialNodes);
  protected readonly es = useEdgesState(initialEdges);
  private readonly flow = useReactFlow();

  protected readonly nodeName = signal<string>('Node 1');
  protected readonly nodeBg = signal<string>('#eee');
  protected readonly nodeHidden = signal<boolean>(false);

  constructor() {
    // React useEffect([nodeName])
    effect(() => {
      const label = this.nodeName();
      this.ns.setNodes((nds) =>
        nds.map((n) => {
          if (n.id === '1') {
            // create a new object so the flow detects the change
            return { ...n, data: { ...n.data, label } };
          }
          return n;
        })
      );
    });

    // React useEffect([nodeBg])
    effect(() => {
      const backgroundColor = this.nodeBg();
      this.ns.setNodes((nds) =>
        nds.map((n) => {
          if (n.id === '1') {
            return { ...n, style: { ...n.style, backgroundColor } };
          }
          return n;
        })
      );
    });

    // React useEffect([nodeHidden]) — id check `'1' || 'e1-2'`; only node 1 is in the list.
    effect(() => {
      const hidden = this.nodeHidden();
      this.ns.setNodes((nds) =>
        nds.map((n) => {
          if (n.id === '1' || n.id === 'e1-2') {
            return { ...n, hidden };
          }
          return n;
        })
      );
    });
  }

  protected onName(event: Event): void {
    this.nodeName.set((event.target as HTMLInputElement).value);
  }

  protected onBg(event: Event): void {
    this.nodeBg.set((event.target as HTMLInputElement).value);
  }

  protected onHidden(event: Event): void {
    this.nodeHidden.set((event.target as HTMLInputElement).checked);
  }

  protected updatePosition(): void {
    this.flow.updateNode('1', (node) => ({ position: { x: node.position.x + 10, y: node.position.y } }));
  }
}

@Component({
  selector: 'app-update-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, UpdateNodeInner],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow-provider style="display:block;height:100%">
      <app-update-node-inner />
    </ng-flow-provider>
  `,
})
export class UpdateNodePage {}
