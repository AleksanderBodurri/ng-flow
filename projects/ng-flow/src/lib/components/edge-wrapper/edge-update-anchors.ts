// Reconnectable edges have anchors around their handles to reconnect the edge.
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import {
  XYHandle,
  type Connection,
  type FinalConnectionState,
  type HandleType,
  type OnConnectStart,
  type Position,
} from '@xyflow/system';

import { EdgeAnchor } from '../edges/edge-anchor';
import { injectStore } from '../../hooks/use-store';
import type { Edge } from '../../types';
import type { EdgeWrapperProps } from '../../types/edges';

/**
 * Renders up to two {@link EdgeAnchor} circles (source and/or target) that the user can grab to
 * reconnect an edge. The Angular port of React Flow's `EdgeUpdateAnchors`
 * (components/EdgeWrapper/EdgeUpdateAnchors.tsx).
 *
 * The host is a real `<g>` (attribute selector) so it paints inside `<svg>`. On a left-button
 * pointer-down on an anchor it starts a reconnection via `XYHandle.onPointerDown`, wiring the
 * `onReconnect*` callbacks (which remain `input<Fn>()`s because their references are forwarded into
 * the system layer). Hover and "currently reconnecting" state are pushed back to the parent
 * EdgeWrapper through the `updateHoverChange` / `reconnectingChange` outputs.
 *
 * @internal
 */
@Component({
  selector: 'g[ng-flow-edge-update-anchors]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EdgeAnchor],
  template: `
    @if (showSource()) {
      <svg:circle
        ng-flow-edge-anchor
        [position]="sourcePosition()"
        [centerX]="sourceX()"
        [centerY]="sourceY()"
        [radius]="reconnectRadius() ?? 10"
        type="source"
        (edgeAnchorMouseDown)="onReconnectSourceMouseDown($event)"
        (edgeAnchorMouseEnter)="onReconnectMouseEnter()"
        (edgeAnchorMouseOut)="onReconnectMouseOut()"
      />
    }
    @if (showTarget()) {
      <svg:circle
        ng-flow-edge-anchor
        [position]="targetPosition()"
        [centerX]="targetX()"
        [centerY]="targetY()"
        [radius]="reconnectRadius() ?? 10"
        type="target"
        (edgeAnchorMouseDown)="onReconnectTargetMouseDown($event)"
        (edgeAnchorMouseEnter)="onReconnectMouseEnter()"
        (edgeAnchorMouseOut)="onReconnectMouseOut()"
      />
    }
  `,
})
export class EdgeUpdateAnchors<EdgeType extends Edge = Edge> {
  /** The edge being reconnected. */
  readonly edge = input.required<EdgeType>();
  /** Whether/which anchors are reconnectable: `true` (both), `'source'`, or `'target'`. */
  readonly isReconnectable = input.required<boolean | 'source' | 'target'>();
  readonly reconnectRadius = input<EdgeWrapperProps['reconnectRadius']>();

  // EdgePosition fields (mirror React's `& EdgePosition` props).
  readonly sourceX = input.required<number>();
  readonly sourceY = input.required<number>();
  readonly targetX = input.required<number>();
  readonly targetY = input.required<number>();
  readonly sourcePosition = input.required<Position>();
  readonly targetPosition = input.required<Position>();

  // Reconnect callbacks — kept as function inputs (their references are forwarded into XYHandle).
  readonly onReconnect = input<EdgeWrapperProps<EdgeType>['onReconnect']>();
  readonly onReconnectStart = input<EdgeWrapperProps<EdgeType>['onReconnectStart']>();
  readonly onReconnectEnd = input<EdgeWrapperProps<EdgeType>['onReconnectEnd']>();

  /** Mirrors React's `setUpdateHover` — toggles the wrapper's `updating` class. */
  readonly updateHoverChange = output<boolean>();
  /** Mirrors React's `setReconnecting` — toggles whether the edge component is rendered. */
  readonly reconnectingChange = output<boolean>();

  private readonly store = injectStore();

  protected readonly showSource = computed(
    () => this.isReconnectable() === true || this.isReconnectable() === 'source'
  );
  protected readonly showTarget = computed(
    () => this.isReconnectable() === true || this.isReconnectable() === 'target'
  );

  private handleEdgeUpdater(
    event: MouseEvent,
    oppositeHandle: { nodeId: string; id: string | null; type: HandleType }
  ): void {
    // avoid triggering edge updater if mouse btn is not left
    if (event.button !== 0) {
      return;
    }

    const edge = this.edge();
    const {
      autoPanOnConnect,
      domNode,
      connectionMode,
      connectionRadius,
      lib,
      onConnectStart,
      cancelConnection,
      nodeLookup,
      rfId: flowId,
      panBy,
      updateConnection,
    } = this.store.getState();
    const isTarget = oppositeHandle.type === 'target';

    const _onReconnectEnd = (evt: MouseEvent | TouchEvent, connectionState: FinalConnectionState) => {
      this.reconnectingChange.emit(false);
      this.onReconnectEnd()?.(evt, edge, oppositeHandle.type, connectionState);
    };

    const onConnectEdge = (connection: Connection) => this.onReconnect()?.(edge, connection);
    const _onConnectStart: OnConnectStart = (_event, params) => {
      this.reconnectingChange.emit(true);
      this.onReconnectStart()?.(event, edge, oppositeHandle.type);
      onConnectStart?.(_event, params);
    };

    XYHandle.onPointerDown(event, {
      autoPanOnConnect,
      connectionMode,
      connectionRadius,
      domNode,
      handleId: oppositeHandle.id,
      nodeId: oppositeHandle.nodeId,
      nodeLookup,
      isTarget,
      edgeUpdaterType: oppositeHandle.type,
      lib,
      flowId,
      cancelConnection,
      panBy,
      isValidConnection: (...args) => this.store.getState().isValidConnection?.(...args) ?? true,
      onConnect: onConnectEdge,
      onConnectStart: _onConnectStart,
      onConnectEnd: (...args) => this.store.getState().onConnectEnd?.(...args),
      onReconnectEnd: _onReconnectEnd,
      updateConnection,
      getTransform: () => this.store.getState().transform,
      getFromHandle: () => this.store.getState().connection.fromHandle,
      dragThreshold: this.store.getState().connectionDragThreshold,
      handleDomNode: event.currentTarget as Element,
    });
  }

  protected onReconnectSourceMouseDown(event: MouseEvent): void {
    const edge = this.edge();
    this.handleEdgeUpdater(event, { nodeId: edge.target, id: edge.targetHandle ?? null, type: 'target' });
  }

  protected onReconnectTargetMouseDown(event: MouseEvent): void {
    const edge = this.edge();
    this.handleEdgeUpdater(event, { nodeId: edge.source, id: edge.sourceHandle ?? null, type: 'source' });
  }

  protected onReconnectMouseEnter(): void {
    this.updateHoverChange.emit(true);
  }

  protected onReconnectMouseOut(): void {
    this.updateHoverChange.emit(false);
  }
}
