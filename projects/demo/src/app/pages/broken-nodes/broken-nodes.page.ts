import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { addEdge, type Connection, type Edge, NgFlow, type Node } from 'ng-flow';

const nodesInit: Node[] = [
  {
    id: '1a',
    type: 'input',
    data: { label: 'Node 1' },
    position: { x: 250, y: 5 },
    className: 'light',
    ariaLabel: 'Input Node 1',
  },
  {
    id: '2a',
    data: { label: 'Node 2' },
    position: { x: 100, y: 100 },
    className: 'light',
    ariaLabel: 'Default Node 2',
  },
  {
    id: '3a',
    data: { label: 'Node 3' },
    position: { x: 400, y: 100 },
    className: 'light',
  },
  {
    id: '4a',
    data: { label: 'Node 4' },
    position: { x: 400, y: 200 },
    className: 'light',
  },
];

const edgesInit: Edge[] = [
  { id: 'e1-2', source: '1a', target: '2a', ariaLabel: undefined },
  { id: 'e1-3', source: '1a', target: '3a' },
];

// React: top-level `const onNodesChange = () => {}` / `onEdgesChange = () => {}` — the flow
// is fully controlled, so changes are intentionally NOT applied. Position is reconciled
// manually in `onNodeDrag` instead. Stable module-level no-ops.
const onNodesChange = (): void => {};
const onEdgesChange = (): void => {};

/**
 * Mirrors React `BrokenNodes`. Fully controlled flow whose `onNodesChange`/`onEdgesChange`
 * are no-ops, so the only way positions update is the manual write-back inside `onNodeDrag`:
 * it guards against `NaN` coordinates (logging "received NaN") and otherwise patches just the
 * dragged node's `position` in local state.
 */
@Component({
  selector: 'app-broken-nodes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [nodes]="nodes()"
      [edges]="edges()"
      [onNodesChange]="onNodesChange"
      [onEdgesChange]="onEdgesChange"
      [onConnect]="onConnect"
      [onNodeDrag]="onNodeDrag"
    ></ng-flow>
  `,
})
export class BrokenNodesPage {
  protected readonly nodes = signal<Node[]>(nodesInit);
  protected readonly edges = signal<Edge[]>(edgesInit);

  protected readonly onNodesChange = onNodesChange;
  protected readonly onEdgesChange = onEdgesChange;

  protected readonly onConnect = (params: Connection | Edge): void => {
    this.edges.update((eds) => addEdge(params, eds));
  };

  protected readonly onNodeDrag = (_event: MouseEvent | TouchEvent, node: Node): void => {
    if (isNaN(node.position.x) || isNaN(node.position.y)) {
      console.log('received NaN', node.position);
    }

    this.nodes.update((nds) =>
      nds.map((item) => {
        if (item.id === node.id) {
          return {
            ...item,
            position: {
              x: node.position.x,
              y: node.position.y,
            },
          };
        }
        return item;
      })
    );
  };
}
