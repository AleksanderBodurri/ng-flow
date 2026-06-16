import { ChangeDetectionStrategy, Component, effect } from '@angular/core';
import {
  Background,
  type Edge,
  MiniMap,
  NgFlow,
  NgFlowProvider,
  type Node,
  Panel,
  useEdgesState,
  useKeyPress,
  useNodesState,
} from 'ng-flow';

const initialNodes: Node[] = [
  { id: '1', type: 'input', data: { label: 'Node 1' }, position: { x: 250, y: 5 } },
  { id: '2', data: { label: 'Node 2' }, position: { x: 100, y: 100 } },
  { id: '3', data: { label: 'Node 3' }, position: { x: 400, y: 100 } },
  { id: '4', data: { label: 'Node 4' }, position: { x: 400, y: 200 } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3' },
];

/**
 * Inner component rendered UNDER `<ng-flow-provider>` so the store is available when the
 * hooks run in field initializers. Mirrors React's `UseKeyPressComponent`, which calls
 * `useKeyPress(['Meta'])` and logs the result on every change.
 */
@Component({
  selector: 'app-use-key-press-inner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background, MiniMap, Panel],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="nodesState.nodes()"
      [edges]="edgesState.edges()"
      [onNodesChange]="nodesState.onNodesChange"
      [onEdgesChange]="edgesState.onEdgesChange"
      [fitView]="true"
    >
      <ng-flow-background />
      <ng-flow-minimap />
      <ng-flow-panel position="top-left">
        <div class="key-press-panel">
          <div class="title">useKeyPress</div>
          <div class="row">
            <span>Meta</span><span [class.on]="metaPressed()">{{ metaPressed() }}</span>
          </div>
          <div class="row">
            <span>Shift</span><span [class.on]="shiftPressed()">{{ shiftPressed() }}</span>
          </div>
          <div class="row">
            <span>a</span><span [class.on]="aPressed()">{{ aPressed() }}</span>
          </div>
          <div class="row">
            <span>Meta+s</span><span [class.on]="metaAndSPressed()">{{ metaAndSPressed() }}</span>
          </div>
        </div>
      </ng-flow-panel>
    </ng-flow>
  `,
  styles: [
    `
      .key-press-panel {
        font-family: monospace;
        font-size: 12px;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 6px;
        padding: 8px 10px;
        min-width: 130px;
      }
      .title {
        font-weight: 700;
        margin-bottom: 6px;
      }
      .row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
      }
      .row span:last-child {
        color: #999;
      }
      .row span.on {
        color: #1a7f37;
        font-weight: 700;
      }
    `,
  ],
})
export class UseKeyPressInner {
  // Mirrors React's `useKeyPress(['Meta'])`; the others demonstrate single keys and combos.
  protected readonly metaPressed = useKeyPress(['Meta']);
  protected readonly shiftPressed = useKeyPress(['Shift']);
  protected readonly aPressed = useKeyPress(['a']);
  protected readonly metaAndSPressed = useKeyPress(['Meta+s']);

  protected readonly nodesState = useNodesState(initialNodes);
  protected readonly edgesState = useEdgesState(initialEdges);

  constructor() {
    // Mirrors React's `useEffect(() => console.log({ metaPressed }), [metaPressed])`.
    effect(() => console.log({ metaPressed: this.metaPressed() }));
  }
}

@Component({
  selector: 'app-use-key-press',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, UseKeyPressInner],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow-provider>
      <app-use-key-press-inner />
    </ng-flow-provider>
  `,
})
export class UseKeyPressPage {}
