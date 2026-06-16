import { ChangeDetectionStrategy, Component, effect, signal } from '@angular/core';
import {
  addEdge,
  type Connection,
  Controls,
  type Edge,
  MiniMap,
  type Node,
  NgFlow,
  useEdgesState,
  useNodesState,
} from 'ng-flow';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    hidden: true,
    data: { label: 'Node 1' },
    position: { x: 250, y: 5 },
  },
  {
    id: '2',
    hidden: true,
    data: { label: 'Node 2' },
    position: { x: 100, y: 100 },
  },
  {
    id: '3',
    hidden: true,
    data: { label: 'Node 3' },
    position: { x: 400, y: 100 },
  },
  {
    id: '4',
    hidden: true,
    data: { label: 'Node 4' },
    position: { x: 400, y: 200 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
  { id: 'e3-4', source: '3', target: '4' },
];

const setHidden =
  (hidden: boolean) =>
  <T extends { hidden?: boolean }>(els: T[]): T[] =>
    els.map((e) => ({ ...e, hidden }));

@Component({
  selector: 'app-hidden',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, MiniMap, Controls],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="ns.nodes()"
      [edges]="es.edges()"
      [onConnect]="onConnect"
      [onNodesChange]="ns.onNodesChange"
      [onEdgesChange]="es.onEdgesChange"
    >
      <ng-flow-minimap />
      <ng-flow-controls />

      <div style="position:absolute;left:10px;top:10px;z-index:4">
        <div>
          <label for="ishidden">
            isHidden
            <input
              id="ishidden"
              type="checkbox"
              [checked]="isHidden()"
              (change)="onToggle($event)"
              class="react-flow__ishidden"
            />
          </label>
        </div>
      </div>
    </ng-flow>
  `,
})
export class HiddenPage {
  protected readonly ns = useNodesState(initialNodes);
  protected readonly es = useEdgesState(initialEdges);

  protected readonly isHidden = signal(true);

  constructor() {
    // Mirrors the React useEffect([isHidden]): re-apply `hidden` to all elements.
    effect(() => {
      const hidden = this.isHidden();
      this.ns.setNodes(setHidden(hidden));
      this.es.setEdges(setHidden(hidden));
    });
    // Mirrors the React `console.log(nodes)` on each render.
    effect(() => console.log(this.ns.nodes()));
  }

  protected readonly onConnect = (connection: Connection): void => {
    this.es.setEdges((eds) => addEdge(connection, eds));
  };

  protected onToggle(event: Event): void {
    this.isHidden.set((event.target as HTMLInputElement).checked);
  }
}
