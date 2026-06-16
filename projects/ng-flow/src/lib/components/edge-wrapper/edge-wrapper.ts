import {
  ChangeDetectionStrategy,
  Component,
  computed,
  type ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { shallow } from 'zustand/shallow';
import {
  elementSelectionKeys,
  getEdgePosition,
  getElevatedEdgeZIndex,
  getMarkerId,
  type OnError,
  type OnReconnect,
  type Position,
} from '@xyflow/system';

import { SvgComponentOutlet } from '../../utils/svg-component-outlet';
import { EdgeUpdateAnchors } from './edge-update-anchors';
import { resolveEdgeComponent } from './edge-types-registry';
import { nullPosition } from '../edges/builtin-edge-types';
import { ARIA_EDGE_DESC_KEY } from '../a11y/a11y.constants';
import { injectStore, useStore } from '../../hooks/use-store';
import type { Edge, EdgeProps, EdgeTypes, Node } from '../../types';
import type { EdgeWrapperProps } from '../../types/edges';

/** Payload re-emitted by the wrapper's mouse outputs (mirrors React's `(event, edge)` callbacks). */
export type EdgeMouseEvent<EdgeType extends Edge = Edge> = { event: MouseEvent; edge: EdgeType };

type EdgePositionSlice = {
  zIndex: number | undefined;
  sourceX: number | null;
  sourceY: number | null;
  targetX: number | null;
  targetY: number | null;
  sourcePosition: Position | null;
  targetPosition: Position | null;
};

/**
 * Per-edge host. The Angular port of React Flow's `EdgeWrapper` (components/EdgeWrapper/index.tsx).
 *
 * React rendered `<svg style={{zIndex}}><g class="react-flow__edge …">{EdgeComponent}{anchors}</g></svg>`.
 * Here the **host is the `<svg>`** (attribute selector `svg[ng-flow-edge-wrapper]`) so the edge paints
 * inside the SVG namespace, and the inner `<svg:g>` carries the `react-flow__edge*` classes / a11y attrs.
 *
 * The concrete edge component is chosen dynamically by edge `type` and rendered through
 * {@link SvgComponentOutlet} (`*ngComponentOutlet` cannot render SVG content — verified). The reconnect
 * anchors are rendered by {@link EdgeUpdateAnchors}.
 *
 * `id` and the store-derived flags (`edgesFocusable`, `edgesReconnectable`, …) are inputs supplied by the
 * edge renderer, exactly mirroring React's `EdgeWrapperProps`. The edge object itself is read from the
 * store's `edgeLookup`, with `defaultEdgeOptions` merged on top.
 *
 * @internal
 */
@Component({
  selector: 'svg[ng-flow-edge-wrapper]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SvgComponentOutlet, EdgeUpdateAnchors],
  host: {
    '[style.zIndex]': 'edgePosition().zIndex',
  },
  template: `
    @if (rendered(); as r) {
      <svg:g
        #edgeGroup
        [class]="edgeClass()"
        [class.selected]="r.edge.selected"
        [class.animated]="r.edge.animated"
        [class.inactive]="inactive()"
        [class.updating]="updateHover()"
        [class.selectable]="isSelectable()"
        (click)="onEdgeClick($event)"
        (dblclick)="onEdgeDoubleClick($event)"
        (contextmenu)="onEdgeContextMenu($event)"
        (mouseenter)="onEdgeMouseEnter($event)"
        (mousemove)="onEdgeMouseMove($event)"
        (mouseleave)="onEdgeMouseLeave($event)"
        (keydown)="onKeyDown($event)"
        [attr.tabindex]="isFocusable() ? 0 : null"
        [attr.role]="role()"
        aria-roledescription="edge"
        [attr.data-id]="id()"
        [attr.data-testid]="'rf__edge-' + id()"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-describedby]="isFocusable() ? ariaDescribedBy() : null"
      >
        @if (!reconnecting()) {
          <svg:g [ngFlowSvgOutlet]="r.edgeComponent" [ngFlowSvgOutletInputs]="edgeProps()"></svg:g>
        }
        @if (isReconnectable(); as reconnectable) {
          <svg:g
            ng-flow-edge-update-anchors
            [edge]="r.edge"
            [isReconnectable]="reconnectable"
            [reconnectRadius]="reconnectRadius()"
            [sourceX]="r.position.sourceX!"
            [sourceY]="r.position.sourceY!"
            [targetX]="r.position.targetX!"
            [targetY]="r.position.targetY!"
            [sourcePosition]="r.position.sourcePosition!"
            [targetPosition]="r.position.targetPosition!"
            [onReconnect]="onReconnect()"
            [onReconnectStart]="onReconnectStart()"
            [onReconnectEnd]="onReconnectEnd()"
            (updateHoverChange)="updateHover.set($event)"
            (reconnectingChange)="reconnecting.set($event)"
          ></svg:g>
        }
      </svg:g>
    }
  `,
})
export class EdgeWrapper<EdgeType extends Edge = Edge> {
  readonly id = input.required<string>();
  readonly edgesFocusable = input.required<boolean>();
  readonly edgesReconnectable = input.required<boolean>();
  readonly elementsSelectable = input.required<boolean>();
  readonly noPanClassName = input.required<string>();
  readonly reconnectRadius = input<EdgeWrapperProps['reconnectRadius']>();
  readonly rfId = input<string>();
  readonly edgeTypes = input<EdgeTypes>();
  readonly onError = input<OnError>();
  readonly disableKeyboardA11y = input<boolean>();

  /**
   * Whether a click handler is wired for this edge (React's `!!onClick`). Drives the `inactive`
   * class together with `isSelectable`. Angular `output()`s can't be introspected for listeners, so
   * the renderer passes this explicitly to reproduce React's `inactive: !isSelectable && !onClick`.
   */
  readonly hasClickHandler = input<boolean>(false);

  // Reconnect callbacks — function inputs (references forwarded into XYHandle / used to gate reconnectability).
  readonly onReconnect = input<OnReconnect<EdgeType>>();
  readonly onReconnectStart = input<EdgeWrapperProps<EdgeType>['onReconnectStart']>();
  readonly onReconnectEnd = input<EdgeWrapperProps<EdgeType>['onReconnectEnd']>();

  // Mouse handlers — React's `(event, edge)` callbacks become outputs re-emitting `{ event, edge }`.
  readonly edgeClick = output<EdgeMouseEvent<EdgeType>>();
  readonly edgeDoubleClick = output<EdgeMouseEvent<EdgeType>>();
  readonly edgeContextMenu = output<EdgeMouseEvent<EdgeType>>();
  readonly edgeMouseEnter = output<EdgeMouseEvent<EdgeType>>();
  readonly edgeMouseMove = output<EdgeMouseEvent<EdgeType>>();
  readonly edgeMouseLeave = output<EdgeMouseEvent<EdgeType>>();

  private readonly store = injectStore<Node, EdgeType>();
  private readonly edgeGroup = viewChild<ElementRef<SVGGElement>>('edgeGroup');

  protected readonly updateHover = signal(false);
  protected readonly reconnecting = signal(false);

  /** The edge from the store's `edgeLookup`, with `defaultEdgeOptions` merged on top (React parity). */
  private readonly edge = useStore((s) => {
    const edge = (s.edgeLookup as Map<string, EdgeType>).get(this.id());
    if (!edge) {
      return undefined;
    }
    return s.defaultEdgeOptions ? ({ ...s.defaultEdgeOptions, ...edge } as EdgeType) : edge;
  }, shallow);

  /** Resolves the edge `type` to `[resolvedTypeName, EdgeComponent]` (with `'default'` fallback + onError('011')). */
  private readonly resolved = computed(() => {
    const edge = this.edge();
    if (!edge) {
      return undefined;
    }
    return resolveEdgeComponent(edge.type, this.edgeTypes(), this.onError());
  });

  protected readonly isFocusable = computed(() => {
    const edge = this.edge();
    return !!(edge?.focusable || (this.edgesFocusable() && typeof edge?.focusable === 'undefined'));
  });

  protected readonly isReconnectable = computed<boolean | 'source' | 'target'>(() => {
    const edge = this.edge();
    if (typeof this.onReconnect() === 'undefined' || !edge) {
      return false;
    }
    return (
      edge.reconnectable ||
      (this.edgesReconnectable() && typeof edge.reconnectable === 'undefined')
    );
  });

  protected readonly isSelectable = computed(() => {
    const edge = this.edge();
    return !!(edge?.selectable || (this.elementsSelectable() && typeof edge?.selectable === 'undefined'));
  });

  /** Combined position + elevated z-index, computed from the source/target nodes (React's big selector). */
  protected readonly edgePosition = useStore((s): EdgePositionSlice => {
    const edge = (s.edgeLookup as Map<string, EdgeType>).get(this.id());
    if (!edge) {
      return { zIndex: undefined, ...nullPosition };
    }

    const sourceNode = s.nodeLookup.get(edge.source);
    const targetNode = s.nodeLookup.get(edge.target);

    if (!sourceNode || !targetNode) {
      return { zIndex: edge.zIndex, ...nullPosition };
    }

    const edgePosition = getEdgePosition({
      id: this.id(),
      sourceNode,
      targetNode,
      sourceHandle: edge.sourceHandle || null,
      targetHandle: edge.targetHandle || null,
      connectionMode: s.connectionMode,
      onError: this.onError(),
    });

    const zIndex = getElevatedEdgeZIndex({
      selected: edge.selected,
      zIndex: edge.zIndex,
      sourceNode,
      targetNode,
      elevateOnSelect: s.elevateEdgesOnSelect,
      zIndexMode: s.zIndexMode,
    });

    return { zIndex, ...(edgePosition || nullPosition) };
  }, shallow);

  /** `true` when the edge exists, isn't hidden, and has a resolved geometry — i.e. should render at all. */
  protected readonly rendered = computed(() => {
    const edge = this.edge();
    const resolved = this.resolved();
    const position = this.edgePosition();
    if (
      !edge ||
      !resolved ||
      edge.hidden ||
      position.sourceX === null ||
      position.sourceY === null ||
      position.targetX === null ||
      position.targetY === null
    ) {
      return undefined;
    }
    return { edge, edgeType: resolved[0], edgeComponent: resolved[1], position };
  });

  protected readonly edgeClass = computed(() => {
    const r = this.rendered();
    const type = r?.edgeType ?? 'default';
    const classes = ['react-flow__edge', `react-flow__edge-${type}`];
    const custom = r?.edge.className;
    if (custom) {
      classes.push(custom);
    }
    classes.push(this.noPanClassName());
    return classes.join(' ');
  });

  protected readonly inactive = computed(() => !this.isSelectable() && !this.hasClickHandler());

  protected readonly role = computed(() => {
    const edge = this.edge();
    return edge?.ariaRole ?? (this.isFocusable() ? 'group' : 'img');
  });

  protected readonly ariaLabel = computed(() => {
    const edge = this.edge();
    if (!edge) {
      return null;
    }
    if (edge.ariaLabel === null) {
      return null;
    }
    return edge.ariaLabel || `Edge from ${edge.source} to ${edge.target}`;
  });

  protected readonly ariaDescribedBy = computed(() => `${ARIA_EDGE_DESC_KEY}-${this.rfId()}`);

  private readonly markerStartUrl = computed(() => {
    const edge = this.edge();
    return edge?.markerStart ? `url('#${getMarkerId(edge.markerStart, this.rfId())}')` : undefined;
  });

  private readonly markerEndUrl = computed(() => {
    const edge = this.edge();
    return edge?.markerEnd ? `url('#${getMarkerId(edge.markerEnd, this.rfId())}')` : undefined;
  });

  /** The `EdgeProps` bag handed to the dynamic edge component (filtered to declared inputs by SvgComponentOutlet). */
  protected readonly edgeProps = computed<Partial<EdgeProps<EdgeType>>>(() => {
    const r = this.rendered();
    if (!r) {
      return {};
    }
    const edge = r.edge;
    const position = r.position;
    return {
      id: this.id(),
      source: edge.source,
      target: edge.target,
      type: edge.type,
      selected: edge.selected,
      animated: edge.animated,
      selectable: this.isSelectable(),
      deletable: edge.deletable ?? true,
      label: edge.label,
      labelStyle: edge.labelStyle,
      labelShowBg: edge.labelShowBg,
      labelBgStyle: edge.labelBgStyle,
      labelBgPadding: edge.labelBgPadding,
      labelBgBorderRadius: edge.labelBgBorderRadius,
      sourceX: position.sourceX!,
      sourceY: position.sourceY!,
      targetX: position.targetX!,
      targetY: position.targetY!,
      sourcePosition: position.sourcePosition!,
      targetPosition: position.targetPosition!,
      data: edge.data,
      style: edge.style,
      sourceHandleId: edge.sourceHandle,
      targetHandleId: edge.targetHandle,
      markerStart: this.markerStartUrl(),
      markerEnd: this.markerEndUrl(),
      pathOptions: 'pathOptions' in edge ? (edge as { pathOptions?: unknown }).pathOptions : undefined,
      interactionWidth: edge.interactionWidth,
    } as Partial<EdgeProps<EdgeType>>;
  });

  protected onEdgeClick(event: MouseEvent): void {
    const edge = this.edge();
    if (!edge) {
      return;
    }
    const { addSelectedEdges, unselectNodesAndEdges, multiSelectionActive } = this.store.getState();

    if (this.isSelectable()) {
      this.store.setState({ nodesSelectionActive: false });

      if (edge.selected && multiSelectionActive) {
        unselectNodesAndEdges({ nodes: [], edges: [edge] });
        this.edgeGroup()?.nativeElement.blur();
      } else {
        addSelectedEdges([this.id()]);
      }
    }

    this.edgeClick.emit({ event, edge });
  }

  protected onEdgeDoubleClick(event: MouseEvent): void {
    const edge = this.edge();
    if (edge) {
      this.edgeDoubleClick.emit({ event, edge: { ...edge } });
    }
  }

  protected onEdgeContextMenu(event: MouseEvent): void {
    const edge = this.edge();
    if (edge) {
      this.edgeContextMenu.emit({ event, edge: { ...edge } });
    }
  }

  protected onEdgeMouseEnter(event: MouseEvent): void {
    const edge = this.edge();
    if (edge) {
      this.edgeMouseEnter.emit({ event, edge: { ...edge } });
    }
  }

  protected onEdgeMouseMove(event: MouseEvent): void {
    const edge = this.edge();
    if (edge) {
      this.edgeMouseMove.emit({ event, edge: { ...edge } });
    }
  }

  protected onEdgeMouseLeave(event: MouseEvent): void {
    const edge = this.edge();
    if (edge) {
      this.edgeMouseLeave.emit({ event, edge: { ...edge } });
    }
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (!this.isFocusable()) {
      return;
    }
    const edge = this.edge();
    if (!this.disableKeyboardA11y() && elementSelectionKeys.includes(event.key) && this.isSelectable() && edge) {
      const { unselectNodesAndEdges, addSelectedEdges } = this.store.getState();
      const unselect = event.key === 'Escape';

      if (unselect) {
        this.edgeGroup()?.nativeElement.blur();
        unselectNodesAndEdges({ edges: [edge] });
      } else {
        addSelectedEdges([this.id()]);
      }
    }
  }
}
