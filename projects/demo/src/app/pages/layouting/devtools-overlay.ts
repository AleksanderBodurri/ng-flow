import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  signal,
} from '@angular/core';
import { JsonPipe } from '@angular/common';
import {
  type Node,
  type NodeChange,
  type OnNodesChange,
  type PanelPosition,
  Panel,
  useNodes,
  useStore,
  useStoreApi,
  ViewportPortal,
} from 'ng-flow';

/**
 * A minimal inline port of React Flow's DevTools overlay, scoped to this page (the React
 * `Layouting` example reuses the DevTools example's overlay; per the demo conventions, helpers
 * live in the page folder, so a self-contained copy is provided here).
 *
 * Includes both tools: a Node Inspector (info boxes in viewport space via
 * `<ng-flow-viewport-portal>` reading `useNodes()` + `node.measured`) and a Change Logger
 * (intercepts the store's `onNodesChange` via `useStore`/`useStoreApi`).
 */

/** Node Inspector — one info box per measured node, positioned in flow space. */
@Component({
  selector: 'app-layouting-node-inspector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ViewportPortal, JsonPipe],
  template: `
    <ng-flow-viewport-portal>
      <div class="react-flow__devtools-nodeinspector">
        @for (info of infos(); track info.id) {
          <div
            class="react-flow__devtools-nodeinfo"
            [style.position]="'absolute'"
            [style.transform]="'translate(' + info.x + 'px, ' + (info.y + info.height) + 'px)'"
            [style.width.px]="info.width * 2"
          >
            <div>id: {{ info.id }}</div>
            <div>type: {{ info.type }}</div>
            <div>position: {{ info.x.toFixed(1) }}, {{ info.y.toFixed(1) }}</div>
            <div>dimensions: {{ info.width }} &times; {{ info.height }}</div>
            <div>data: {{ info.data | json }}</div>
          </div>
        }
      </div>
    </ng-flow-viewport-portal>
  `,
})
export class LayoutingNodeInspector {
  private readonly nodes = useNodes();

  protected readonly infos = computed(() =>
    this.nodes()
      .map((node: Node) => ({
        id: node.id,
        type: node.type || 'default',
        x: node?.position?.x || 0,
        y: node?.position?.y || 0,
        width: node.measured?.width || 0,
        height: node.measured?.height || 0,
        data: node.data,
      }))
      .filter((info) => info.width && info.height)
  );
}

/** Change Logger — forwards then records each intercepted `NodeChange`. */
@Component({
  selector: 'app-layouting-change-logger',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [JsonPipe],
  template: `
    <div class="react-flow__devtools-changelogger">
      <div class="react-flow__devtools-title">Change Logger</div>
      @if (changes().length === 0) {
        no changes triggered
      } @else {
        @for (change of changes(); track $index) {
          <div style="margin-bottom: 4px;">
            <div>node id: {{ idOf(change) }}</div>
            <div>
              @switch (change.type) {
                @case ('add') {
                  {{ asAny(change).item | json }}
                }
                @case ('dimensions') {
                  {{ asAny(change).dimensions?.width }} &times; {{ asAny(change).dimensions?.height }}
                }
                @case ('position') {
                  position: {{ asAny(change).position?.x?.toFixed(1) }}, {{ asAny(change).position?.y?.toFixed(1) }}
                }
                @case ('remove') {
                  remove
                }
                @case ('replace') {
                  {{ asAny(change).item | json }}
                }
                @case ('select') {
                  {{ asAny(change).selected ? 'select' : 'unselect' }}
                }
              }
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class LayoutingChangeLogger {
  readonly limit = input(20);

  private readonly storeOnNodesChange = useStore((s) => s.onNodesChange);
  private readonly store = useStoreApi();

  protected readonly changes = signal<NodeChange[]>([]);
  private intercepted = false;

  protected idOf(change: NodeChange): string {
    const c = change as { id?: string };
    return 'id' in c && c.id !== undefined ? c.id : '-';
  }

  protected asAny(change: NodeChange): any {
    return change;
  }

  constructor() {
    effect(() => {
      const userOnNodesChange = this.storeOnNodesChange();
      if (!userOnNodesChange || this.intercepted) {
        return;
      }

      this.intercepted = true;
      const limit = this.limit();

      const onNodesChangeLogger: OnNodesChange = (changes) => {
        userOnNodesChange(changes);
        this.changes.update((current) => {
          let next = current;
          for (const change of changes) {
            if (next.length >= limit) {
              next = next.slice(0, limit - 1);
            }
            next = [change, ...next];
          }
          return next;
        });
      };

      this.store.setState({ onNodesChange: onNodesChangeLogger });
    });
  }
}

/** Overlay shell with the two toggle buttons. Place inside `<ng-flow>`. */
@Component({
  selector: 'app-layouting-devtools',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Panel, LayoutingChangeLogger, LayoutingNodeInspector],
  host: { class: 'react-flow__devtools' },
  template: `
    <ng-flow-panel [position]="position()">
      <button
        type="button"
        title="Toggle Node Inspector"
        [class.active]="nodeInspectorActive()"
        (click)="nodeInspectorActive.set(!nodeInspectorActive())"
      >
        Node Inspector
      </button>
      <button
        type="button"
        title="Toggle Change Logger"
        [class.active]="changeLoggerActive()"
        (click)="changeLoggerActive.set(!changeLoggerActive())"
      >
        Change Logger
      </button>
    </ng-flow-panel>
    @if (changeLoggerActive()) {
      <app-layouting-change-logger />
    }
    @if (nodeInspectorActive()) {
      <app-layouting-node-inspector />
    }
  `,
  styles: [
    `
      :host {
        --border-radius: 4px;
        --highlight-color: rgba(238, 58, 115, 1);
        --font: monospace, sans-serif;

        border-radius: var(--border-radius);
        font-size: 11px;
        font-family: var(--font);
      }

      :host ::ng-deep button {
        background: white;
        border: none;
        padding: 5px 15px;
        color: #222;
        font-weight: bold;
        font-size: 12px;
        cursor: pointer;
        font-family: var(--font);
        background-color: #f4f4f4;
      }

      :host ::ng-deep button:hover,
      :host ::ng-deep button.active {
        background: var(--highlight-color);
        color: white;
      }

      :host ::ng-deep button:first-child {
        border-radius: var(--border-radius) 0 0 var(--border-radius);
        border-right: 1px solid #ddd;
      }

      :host ::ng-deep button:last-child {
        border-radius: 0 var(--border-radius) var(--border-radius) 0;
      }

      :host ::ng-deep .react-flow__devtools-changelogger {
        pointer-events: none;
        position: relative;
        top: 50px;
        left: 20px;
        font-family: var(--font);
      }

      :host ::ng-deep .react-flow__devtools-title {
        font-weight: bold;
        margin-bottom: 5px;
      }

      :host ::ng-deep .react-flow__devtools-nodeinspector {
        pointer-events: none;
        font-family: monospace, sans-serif;
        font-size: 10px;
      }

      :host ::ng-deep .react-flow__devtools-nodeinfo {
        top: 5px;
      }
    `,
  ],
})
export class LayoutingDevtools {
  readonly position = input<PanelPosition>('top-left');
  protected readonly nodeInspectorActive = signal(false);
  protected readonly changeLoggerActive = signal(false);
}
