import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, output } from '@angular/core';
import { shallow } from 'zustand/shallow';
import {
  ConnectionMode,
  type Connection,
  errorMessages,
  getHostForElement,
  type HandleProps as HandlePropsSystem,
  type HandleType,
  isMouseEvent,
  type OnConnect,
  type Optional,
  type ConnectionState,
  Position,
  XYHandle,
} from '@xyflow/system';

import { useNodeId } from '../../contexts/node-id';
import { useStoreApi } from '../../hooks/use-store';
import { FlowStore } from '../../store/flow-store';
import type { ReactFlowState } from '../../types';
import { addEdge } from '../../utils/edges';

/**
 * Props accepted by the {@link Handle} component. The Angular port of React Flow's `HandleProps`.
 *
 * React intersected `HandleProps` (system) with `HTMLAttributes<HTMLDivElement>` and added
 * `onConnect`. Here the DOM-attribute spread is dropped (consumers bind host attributes directly)
 * and `onConnect` becomes the `connect` output.
 *
 * @public
 */
export type HandleProps = HandlePropsSystem & {
  /** Callback called when a connection is made. */
  onConnect?: OnConnect;
};

const selector = (s: ReactFlowState) => ({
  connectOnClick: s.connectOnClick,
  noPanClassName: s.noPanClassName,
  rfId: s.rfId,
});

const connectingSelector =
  (nodeId: string | null, handleId: string | null, type: HandleType) => (state: ReactFlowState) => {
    const { connectionClickStartHandle: clickHandle, connectionMode, connection } = state;
    const { fromHandle, toHandle, isValid } = connection;
    const connectingTo = toHandle?.nodeId === nodeId && toHandle?.id === handleId && toHandle?.type === type;

    return {
      connectingFrom: fromHandle?.nodeId === nodeId && fromHandle?.id === handleId && fromHandle?.type === type,
      connectingTo,
      clickConnecting: clickHandle?.nodeId === nodeId && clickHandle?.id === handleId && clickHandle?.type === type,
      isPossibleEndHandle:
        connectionMode === ConnectionMode.Strict
          ? fromHandle?.type !== type
          : nodeId !== fromHandle?.nodeId || handleId !== fromHandle?.id,
      connectionInProcess: !!fromHandle,
      clickConnectionInProcess: !!clickHandle,
      valid: connectingTo && isValid,
    };
  };

/**
 * The `<ng-flow-handle>` component is used in your custom nodes to define connection points.
 *
 * The host element is a `<div>`. Project children into it for custom handle content.
 * Resolve the owning node id via the {@link NODE_ID} token (provided by `NodeWrapper`); when used
 * outside a node it reports error `010`. Get a reference to the host element by querying this
 * component and reading its public {@link Handle.elementRef} (the Angular analogue of React's `forwardRef`).
 *
 * @public
 *
 * @example
 * ```html
 * <div style="padding: 10px 20px">{{ data.label }}</div>
 * <ng-flow-handle type="target" [position]="Position.Left" />
 * <ng-flow-handle type="source" [position]="Position.Right" />
 * ```
 */
@Component({
  selector: 'ng-flow-handle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    '[attr.data-handleid]': 'handleId()',
    '[attr.data-nodeid]': 'nodeId',
    '[attr.data-handlepos]': 'resolvedPosition()',
    '[attr.data-id]': 'dataId()',
    '[class]': 'hostClass()',
    '[class.source]': '!isTarget()',
    '[class.target]': 'isTarget()',
    '[class.connectable]': 'isConnectable()',
    '[class.connectablestart]': 'isConnectableStart()',
    '[class.connectableend]': 'isConnectableEnd()',
    '[class.clickconnecting]': 'connecting().clickConnecting',
    '[class.connectingfrom]': 'connecting().connectingFrom',
    '[class.connectingto]': 'connecting().connectingTo',
    '[class.valid]': 'connecting().valid',
    '[class.connectionindicator]': 'connectionIndicator()',
    '(mousedown)': 'onPointerDown($event)',
    '(touchstart)': 'onPointerDown($event)',
    '(click)': 'onClick($event)',
  },
})
export class Handle {
  /**
   * Type of the handle.
   * @default "source"
   */
  readonly type = input<HandleType>('source');
  /**
   * The position of the handle relative to the node.
   * @default Position.Top
   */
  readonly position = input<Position>(Position.Top);
  /**
   * Whether you can connect to/from this handle.
   * @default true
   */
  readonly isConnectable = input<boolean>(true);
  /**
   * Whether a connection can start from this handle.
   * @default true
   */
  readonly isConnectableStart = input<boolean>(true);
  /**
   * Whether a connection can end on this handle.
   * @default true
   */
  readonly isConnectableEnd = input<boolean>(true);
  /** Custom validation for a connection dragged to this handle. */
  readonly isValidConnection = input<HandleProps['isValidConnection']>();
  /** Id of the handle (optional if there is only one handle of this type). */
  readonly id = input<string | null>();

  /** Emitted when a connection is made from/to this handle. */
  readonly connect = output<Parameters<OnConnect>[0]>();

  /** Public reference to the host `<div>` element — the Angular analogue of React's `forwardRef`. */
  readonly elementRef = inject(ElementRef) as ElementRef<HTMLDivElement>;

  private readonly store = useStoreApi();
  private readonly flowStore = inject(FlowStore);
  /** The owning node id, resolved from the {@link NODE_ID} context provided by `NodeWrapper`. */
  protected readonly nodeId = useNodeId();

  private readonly flagsSelector = this.flowStore.select(selector, shallow);
  protected readonly handleId = computed(() => this.id() || null);
  protected readonly isTarget = computed(() => this.type() === 'target');

  /*
   * React's Handle applies `position = Position.Top` as a destructuring default, which fires when
   * the prop is `undefined`. Angular signal-input defaults do NOT re-apply when an explicit
   * `undefined` is bound (e.g. a node binding `[position]` to an unset value) — so coalesce here.
   * Without this, `[attr.data-handlepos]` serializes to `null`, `getHandleBounds` stores the handle
   * `position` as `null`, and `getBezierPath` (whose `= Position.Bottom` default only fires on
   * `undefined`, not `null`) throws `getControlWithCurvature ... is not iterable` mid-connection.
   */
  protected readonly resolvedPosition = computed(() => this.position() ?? Position.Top);

  /*
   * Mirrors React's `useStore(connectingSelector(nodeId, handleId, type), shallow)`. Reads the
   * reactive store `state` signal AND the `handleId`/`type` inputs, so it re-evaluates both when
   * connection state changes and when the handle's identity changes. `shallow` dedupes like React.
   */
  protected readonly connecting = computed(
    () => connectingSelector(this.nodeId, this.handleId(), this.type())(this.flowStore.state()),
    { equal: shallow }
  );

  protected readonly dataId = computed(
    () => `${this.flagsSelector().rfId}-${this.nodeId}-${this.handleId()}-${this.type()}`
  );

  protected readonly hostClass = computed(() => {
    const { noPanClassName } = this.flagsSelector();
    return ['react-flow__handle', `react-flow__handle-${this.resolvedPosition()}`, 'nodrag', noPanClassName].join(' ');
  });

  protected readonly connectionIndicator = computed(() => {
    const { connectionInProcess, clickConnectionInProcess, isPossibleEndHandle } = this.connecting();
    return (
      this.isConnectable() &&
      (!connectionInProcess || isPossibleEndHandle) &&
      (connectionInProcess || clickConnectionInProcess ? this.isConnectableEnd() : this.isConnectableStart())
    );
  });

  constructor() {
    if (!this.nodeId) {
      this.store.getState().onError?.('010', errorMessages['error010']());
    }
  }

  private onConnectExtended = (params: Connection): void => {
    const { defaultEdgeOptions, onConnect: onConnectAction, hasDefaultEdges } = this.store.getState();

    const edgeParams = {
      ...defaultEdgeOptions,
      ...params,
    };
    if (hasDefaultEdges) {
      const { edges, setEdges, onError } = this.store.getState();
      setEdges(addEdge(edgeParams, edges, { onError }));
    }

    onConnectAction?.(edgeParams);
    this.connect.emit(edgeParams);
  };

  protected onPointerDown(event: MouseEvent | TouchEvent): void {
    const nodeId = this.nodeId;
    if (!nodeId) {
      return;
    }

    const isMouseTriggered = isMouseEvent(event);

    if (
      this.isConnectableStart() &&
      ((isMouseTriggered && (event as MouseEvent).button === 0) || !isMouseTriggered)
    ) {
      const currentStore = this.store.getState();

      XYHandle.onPointerDown(event, {
        handleDomNode: event.currentTarget as HTMLElement,
        autoPanOnConnect: currentStore.autoPanOnConnect,
        connectionMode: currentStore.connectionMode,
        connectionRadius: currentStore.connectionRadius,
        domNode: currentStore.domNode,
        nodeLookup: currentStore.nodeLookup,
        lib: currentStore.lib,
        isTarget: this.isTarget(),
        handleId: this.handleId(),
        nodeId,
        flowId: currentStore.rfId,
        panBy: currentStore.panBy,
        cancelConnection: currentStore.cancelConnection,
        onConnectStart: currentStore.onConnectStart,
        onConnectEnd: (...args) => this.store.getState().onConnectEnd?.(...args),
        updateConnection: currentStore.updateConnection,
        onConnect: this.onConnectExtended,
        isValidConnection:
          this.isValidConnection() || ((...args) => this.store.getState().isValidConnection?.(...args) ?? true),
        getTransform: () => this.store.getState().transform,
        getFromHandle: () => this.store.getState().connection.fromHandle,
        autoPanSpeed: currentStore.autoPanSpeed,
        dragThreshold: currentStore.connectionDragThreshold,
      });
    }
  }

  protected onClick(event: MouseEvent): void {
    // React only wired the click handler when `connectOnClick` was truthy.
    if (!this.flagsSelector().connectOnClick) {
      return;
    }

    const nodeId = this.nodeId;
    const {
      onClickConnectStart,
      onClickConnectEnd,
      connectionClickStartHandle,
      connectionMode,
      isValidConnection: isValidConnectionStore,
      lib,
      rfId: flowId,
      nodeLookup,
      connection: connectionState,
    } = this.store.getState();

    if (!nodeId || (!connectionClickStartHandle && !this.isConnectableStart())) {
      return;
    }

    if (!connectionClickStartHandle) {
      onClickConnectStart?.(event, { nodeId, handleId: this.handleId(), handleType: this.type() });
      this.store.setState({ connectionClickStartHandle: { nodeId, type: this.type(), id: this.handleId() } });
      return;
    }

    const doc = getHostForElement(event.target);
    const isValidConnectionHandler = this.isValidConnection() || isValidConnectionStore;
    const { connection, isValid } = XYHandle.isValid(event, {
      handle: {
        nodeId,
        id: this.handleId(),
        type: this.type(),
      },
      connectionMode,
      fromNodeId: connectionClickStartHandle.nodeId,
      fromHandleId: connectionClickStartHandle.id || null,
      fromType: connectionClickStartHandle.type,
      isValidConnection: isValidConnectionHandler,
      flowId,
      doc,
      lib,
      nodeLookup,
    });

    if (isValid && connection) {
      this.onConnectExtended(connection);
    }

    const connectionClone = structuredClone(connectionState) as Optional<ConnectionState, 'inProgress'>;
    delete connectionClone.inProgress;
    connectionClone.toPosition = connectionClone.toHandle ? connectionClone.toHandle.position : null;
    onClickConnectEnd?.(event, connectionClone);

    this.store.setState({ connectionClickStartHandle: null });
  }
}
