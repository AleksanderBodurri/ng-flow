import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { shallow } from 'zustand/shallow';
import {
  ConnectionLineType,
  getBezierPath,
  getConnectionStatus,
  getSmoothStepPath,
  getStraightPath,
} from '@xyflow/system';

import { SvgComponentOutlet } from '../../utils/svg-component-outlet';
import { getSimpleBezierPath } from '../edges/simple-bezier-edge';
import { useConnection } from '../../hooks/use-connection';
import { useStore } from '../../hooks/use-store';
import type { ConnectionLineComponent, ConnectionLineComponentProps, CSSProperties, Node, ReactFlowState } from '../../types';

function wrapperSelector(s: ReactFlowState) {
  return {
    nodesConnectable: s.nodesConnectable,
    isValid: s.connection.isValid,
    inProgress: s.connection.inProgress,
    width: s.width,
    height: s.height,
  };
}

/**
 * Renders the line drawn while the user is making a connection. The Angular port of React Flow's
 * `ConnectionLineWrapper` + inner `ConnectionLine` (components/ConnectionLine/index.tsx).
 *
 * The **host is the `<svg>`** (`svg[ng-flow-connection-line]`) so the line paints in the SVG namespace.
 * It renders nothing unless there is a measured surface, nodes are connectable, and a connection is in
 * progress (React's `renderConnection`). Otherwise it draws `<svg:g class="react-flow__connection …">`
 * containing either:
 *   - a consumer-supplied `component` (`ConnectionLineComponent`), rendered via {@link SvgComponentOutlet}
 *     with the full `ConnectionLineComponentProps`; or
 *   - a built-in `<svg:path class="react-flow__connection-path">` whose `d` is chosen by `type`.
 *
 * Geometry comes from {@link useConnection} (a `Signal` whose `to` is already renderer-transformed) and
 * the store's `width`/`height`.
 *
 * @internal
 */
@Component({
  selector: 'svg[ng-flow-connection-line]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SvgComponentOutlet],
  host: {
    'class': 'react-flow__connectionline react-flow__container',
    '[style]': 'containerStyle()',
    '[attr.width]': 'renderState().width',
    '[attr.height]': 'renderState().height',
  },
  template: `
    @if (renderConnection()) {
      <svg:g [class]="connectionGroupClass()">
        @if (customComponent(); as cmp) {
          <svg:g [ngFlowSvgOutlet]="cmp" [ngFlowSvgOutletInputs]="componentProps()"></svg:g>
        } @else {
          <svg:path [attr.d]="pathD()" fill="none" class="react-flow__connection-path" [style]="style()" />
        }
      </svg:g>
    }
  `,
})
export class ConnectionLine<NodeType extends Node = Node> {
  readonly type = input<ConnectionLineType>(ConnectionLineType.Bezier);
  readonly component = input<ConnectionLineComponent<NodeType>>();
  readonly containerStyle = input<CSSProperties>();
  readonly style = input<CSSProperties>();

  protected readonly renderState = useStore(wrapperSelector, shallow);
  private readonly connection = useConnection<NodeType>();

  /** React's `renderConnection = !!(width && nodesConnectable && inProgress)`. */
  protected readonly renderConnection = computed(() => {
    const { width, nodesConnectable, inProgress } = this.renderState();
    return !!(width && nodesConnectable && inProgress);
  });

  protected readonly connectionGroupClass = computed(() => {
    const status = getConnectionStatus(this.renderState().isValid);
    // Mirror classcat(['react-flow__connection', status]) — a null status is dropped, not stringified.
    return status ? `react-flow__connection ${status}` : 'react-flow__connection';
  });

  /** Only surface the custom component when a connection is actually in progress (matches inner guard). */
  protected readonly customComponent = computed(() =>
    this.connection().inProgress ? this.component() : undefined
  );

  /** Full `ConnectionLineComponentProps` for the custom connection-line component. */
  protected readonly componentProps = computed<Partial<ConnectionLineComponentProps<NodeType>>>(() => {
    const c = this.connection();
    if (!c.inProgress) {
      return {};
    }
    return {
      connectionLineType: this.type(),
      connectionLineStyle: this.style(),
      fromNode: c.fromNode,
      fromHandle: c.fromHandle,
      fromX: c.from.x,
      fromY: c.from.y,
      toX: c.to.x,
      toY: c.to.y,
      fromPosition: c.fromPosition,
      toPosition: c.toPosition,
      connectionStatus: getConnectionStatus(this.renderState().isValid),
      toNode: c.toNode,
      toHandle: c.toHandle,
      pointer: c.pointer,
    };
  });

  /** The SVG path `d` for the built-in connection line, selected by `type` (React's switch). */
  protected readonly pathD = computed(() => {
    const c = this.connection();
    if (!c.inProgress) {
      return '';
    }

    const pathParams = {
      sourceX: c.from.x,
      sourceY: c.from.y,
      sourcePosition: c.fromPosition,
      targetX: c.to.x,
      targetY: c.to.y,
      targetPosition: c.toPosition,
    };

    switch (this.type()) {
      case ConnectionLineType.Bezier:
        return getBezierPath(pathParams)[0];
      case ConnectionLineType.SimpleBezier:
        return getSimpleBezierPath(pathParams)[0];
      case ConnectionLineType.Step:
        return getSmoothStepPath({ ...pathParams, borderRadius: 0 })[0];
      case ConnectionLineType.SmoothStep:
        return getSmoothStepPath(pathParams)[0];
      default:
        return getStraightPath(pathParams)[0];
    }
  });
}
