import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import {
  addEdge,
  Background,
  type Connection,
  type Edge,
  MiniMap,
  NgFlow,
  NgFlowProvider,
  type Node,
  type OnConnect,
  type OnConnectEnd,
  type OnConnectStart,
  type ReactFlowState,
  useEdgesState,
  useNodesState,
  useStore,
} from 'ng-flow';

import { CancelConnectionTimer } from './timer';

const CANCEL_AFTER = 5; // seconds

const initialNodes: Node[] = [
  { id: '1', type: 'input', data: { label: 'Node 1' }, position: { x: 250, y: 5 }, className: 'light' },
  { id: '2', data: { label: 'Node 2' }, position: { x: 100, y: 100 }, className: 'light' },
  { id: '3', data: { label: 'Node 3' }, position: { x: 400, y: 100 }, className: 'light' },
  { id: '4', data: { label: 'Node 4' }, position: { x: 400, y: 200 }, className: 'light' },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3' },
];

/**
 * Inner component rendered UNDER `<ng-flow-provider>` so the store is available when
 * `useStore` runs. Mirrors React's `CancelConnection`: on `onConnectStart` a 5-second
 * countdown begins; if it reaches zero before `onConnectEnd`, it calls the store's
 * `cancelConnection()` to abort the in-progress connection. The animated `Timer` overlay
 * (`<app-cancel-connection-timer>`) shows the remaining seconds.
 *
 * React's `useCountdown` hook (a `useRef`/`useState` setInterval) is ported here as a plain
 * signal-based countdown driven by `setInterval`, cleaned up on destroy.
 */
@Component({
  selector: 'app-cancel-connection-inner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background, MiniMap, CancelConnectionTimer],
  host: { style: 'display:block;height:100%' },
  template: `
    <app-cancel-connection-timer [duration]="CANCEL_AFTER" [show]="counting()" [remaining]="remaining()" />
    <ng-flow
      [nodes]="nodesState.nodes()"
      [edges]="edgesState.edges()"
      [onNodesChange]="nodesState.onNodesChange"
      [onEdgesChange]="edgesState.onEdgesChange"
      [onConnectStart]="onConnectStart"
      [onConnectEnd]="onConnectEnd"
      [onConnect]="onConnect"
      [fitView]="true"
      [maxZoom]="2"
    >
      <ng-flow-background />
      <ng-flow-minimap />
    </ng-flow>
  `,
})
export class CancelConnectionInner {
  protected readonly CANCEL_AFTER = CANCEL_AFTER;

  protected readonly nodesState = useNodesState(initialNodes);
  protected readonly edgesState = useEdgesState(initialEdges);

  // React: `useStore((state) => state.cancelConnection)`.
  private readonly cancelConnection = useStore((state: ReactFlowState) => state.cancelConnection);

  // React `useCountdown` state, ported to signals + setInterval.
  protected readonly remaining = signal(0);
  protected readonly counting = computed(() => this.remaining() > 0);
  private interval: ReturnType<typeof setInterval> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clear());
  }

  private clear(): void {
    if (this.interval !== undefined) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  private start(duration: number): void {
    this.clear();
    this.remaining.set(duration);
    this.interval = setInterval(() => {
      const prev = this.remaining();
      if (prev === 1) {
        this.clear();
        // Cancels the in-progress connection via the store.
        this.cancelConnection()();
      }
      this.remaining.set(prev - 1);
    }, 1000);
  }

  private stop(): void {
    this.clear();
    this.remaining.set(0);
  }

  protected readonly onConnectStart: OnConnectStart = () => this.start(CANCEL_AFTER);
  protected readonly onConnectEnd: OnConnectEnd = () => this.stop();

  protected readonly onConnect: OnConnect = (params: Connection) =>
    this.edgesState.setEdges((eds) => addEdge(params, eds));
}

@Component({
  selector: 'app-cancel-connection',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, CancelConnectionInner],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow-provider>
      <app-cancel-connection-inner />
    </ng-flow-provider>
  `,
})
export class CancelConnectionPage {}
