import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PanOnScrollMode, SelectionMode } from '@xyflow/system';
import type {
  ConnectionLineType,
  CoordinateExtent,
  KeyCode,
  OnReconnect,
  Viewport,
} from '@xyflow/system';

import { FlowRenderer } from '../flow-renderer/flow-renderer';
import { NodeRenderer } from '../node-renderer/node-renderer';
import { EdgeRenderer } from '../edge-renderer/edge-renderer';
import { Viewport as ViewportComponent } from '../viewport/viewport';
import { ConnectionLine } from '../../components/connection-line/connection-line';
import { useOnInitHandler } from '../../hooks/use-on-init-handler';
import { useViewportSync } from '../../hooks/use-viewport-sync';
import { useNodeOrEdgeTypesWarning } from './use-node-or-edge-types-warning';
import { useStylesLoadedWarning } from './use-styles-loaded-warning';
import type {
  ConnectionLineComponent,
  CSSProperties,
  Edge,
  EdgeMouseHandler,
  EdgeTypes,
  Node,
  NodeMouseHandler,
  NodeTypes,
  OnInit,
} from '../../types';
import type { EdgeWrapperProps } from '../../types/edges';

/**
 * The top-level rendering entry point that wires the whole pipeline together. The Angular port of React
 * Flow's `GraphView` (container/GraphView/index.tsx).
 *
 * It has **no wrapper DOM of its own** (host is `display: contents`). It renders
 * `<ng-flow-flow-renderer>` and, inside the pane (projected content), a `<ng-flow-viewport>` containing —
 * in this exact order to preserve the z-stack — the edge renderer, the connection line, the empty
 * `.react-flow__edgelabel-renderer` portal target, the node renderer, and the empty
 * `.react-flow__viewport-portal` target. It runs {@link useOnInitHandler}, {@link useViewportSync}, and
 * the two dev warnings ({@link useNodeOrEdgeTypesWarning} × 2 + {@link useStylesLoadedWarning}).
 *
 * The large flattened `GraphViewProps` bag from React is modelled as the component's `input()`s, forwarded
 * down to FlowRenderer / Viewport / EdgeRenderer / NodeRenderer / ConnectionLine, mirroring React's
 * forwarding exactly. The orchestrating `<ng-flow>` element binds these.
 *
 * @internal
 */
@Component({
  selector: 'ng-flow-graph-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FlowRenderer, ViewportComponent, EdgeRenderer, NodeRenderer, ConnectionLine],
  host: { style: 'display: contents' },
  template: `
    <ng-flow-flow-renderer
      [onPaneClick]="onPaneClick()"
      [onPaneMouseEnter]="onPaneMouseEnter()"
      [onPaneMouseMove]="onPaneMouseMove()"
      [onPaneMouseLeave]="onPaneMouseLeave()"
      [onPaneContextMenu]="onPaneContextMenu()"
      [onPaneScroll]="onPaneScroll()"
      [paneClickDistance]="paneClickDistance()"
      [deleteKeyCode]="deleteKeyCode()"
      [selectionKeyCode]="selectionKeyCode()"
      [selectionOnDrag]="selectionOnDrag()"
      [selectionMode]="selectionMode()"
      [onSelectionStart]="onSelectionStart()"
      [onSelectionEnd]="onSelectionEnd()"
      [multiSelectionKeyCode]="multiSelectionKeyCode()"
      [panActivationKeyCode]="panActivationKeyCode()"
      [zoomActivationKeyCode]="zoomActivationKeyCode()"
      [elementsSelectable]="elementsSelectable()"
      [zoomOnScroll]="zoomOnScroll()"
      [zoomOnPinch]="zoomOnPinch()"
      [zoomOnDoubleClick]="zoomOnDoubleClick()"
      [panOnScroll]="panOnScroll()"
      [panOnScrollSpeed]="panOnScrollSpeed()"
      [panOnScrollMode]="panOnScrollMode()"
      [panOnDrag]="panOnDrag()"
      [autoPanOnSelection]="autoPanOnSelection()"
      [defaultViewport]="defaultViewport()"
      [translateExtent]="translateExtent()"
      [minZoom]="minZoom()"
      [maxZoom]="maxZoom()"
      [onSelectionContextMenu]="onSelectionContextMenu()"
      [preventScrolling]="preventScrolling()"
      [noWheelClassName]="noWheelClassName()"
      [noPanClassName]="noPanClassName()"
      [disableKeyboardA11y]="disableKeyboardA11y()"
      [onViewportChange]="onViewportChange()"
      [isControlledViewport]="isControlledViewport()"
    >
      <ng-flow-viewport>
        <div
          ng-flow-edge-renderer
          [edgeTypes]="edgeTypes()"
          [onEdgeClick]="onEdgeClick()"
          [onEdgeDoubleClick]="onEdgeDoubleClick()"
          [onReconnect]="onReconnect()"
          [onReconnectStart]="onReconnectStart()"
          [onReconnectEnd]="onReconnectEnd()"
          [onlyRenderVisibleElements]="onlyRenderVisibleElements()"
          [onEdgeContextMenu]="onEdgeContextMenu()"
          [onEdgeMouseEnter]="onEdgeMouseEnter()"
          [onEdgeMouseMove]="onEdgeMouseMove()"
          [onEdgeMouseLeave]="onEdgeMouseLeave()"
          [reconnectRadius]="reconnectRadius()"
          [defaultMarkerColor]="defaultMarkerColor()"
          [noPanClassName]="noPanClassName()"
          [disableKeyboardA11y]="disableKeyboardA11y()"
          [rfId]="rfId()"
        ></div>

        <svg
          ng-flow-connection-line
          [style]="connectionLineStyle()"
          [type]="connectionLineType()"
          [component]="connectionLineComponent()"
          [containerStyle]="connectionLineContainerStyle()"
        ></svg>

        <div class="react-flow__edgelabel-renderer"></div>

        <div
          ng-flow-node-renderer
          [nodeTypes]="nodeTypes()"
          [onNodeClick]="onNodeClick()"
          [onNodeDoubleClick]="onNodeDoubleClick()"
          [onNodeMouseEnter]="onNodeMouseEnter()"
          [onNodeMouseMove]="onNodeMouseMove()"
          [onNodeMouseLeave]="onNodeMouseLeave()"
          [onNodeContextMenu]="onNodeContextMenu()"
          [nodeClickDistance]="nodeClickDistance()"
          [onlyRenderVisibleElements]="onlyRenderVisibleElements()"
          [noPanClassName]="noPanClassName()"
          [noDragClassName]="noDragClassName()"
          [disableKeyboardA11y]="disableKeyboardA11y()"
          [nodeExtent]="nodeExtent()"
          [rfId]="rfId()"
        ></div>

        <div class="react-flow__viewport-portal"></div>
      </ng-flow-viewport>
    </ng-flow-flow-renderer>
  `,
})
export class GraphView<NodeType extends Node = Node, EdgeType extends Edge = Edge> {
  // ── Node / edge types ──
  readonly nodeTypes = input<NodeTypes>();
  readonly edgeTypes = input<EdgeTypes>();

  // ── Init / viewport sync ──
  readonly onInit = input<OnInit<NodeType, EdgeType>>();
  readonly viewport = input<Viewport>();
  readonly onViewportChange = input<(viewport: Viewport) => void>();
  readonly defaultViewport = input.required<Viewport>();

  // ── Node handlers ──
  readonly onNodeClick = input<NodeMouseHandler<NodeType>>();
  readonly onNodeDoubleClick = input<NodeMouseHandler<NodeType>>();
  readonly onNodeMouseEnter = input<NodeMouseHandler<NodeType>>();
  readonly onNodeMouseMove = input<NodeMouseHandler<NodeType>>();
  readonly onNodeMouseLeave = input<NodeMouseHandler<NodeType>>();
  readonly onNodeContextMenu = input<NodeMouseHandler<NodeType>>();
  readonly nodeClickDistance = input.required<number>();

  // ── Edge handlers ──
  readonly onEdgeClick = input<(event: MouseEvent, edge: EdgeType) => void>();
  readonly onEdgeDoubleClick = input<EdgeMouseHandler<EdgeType>>();
  readonly onEdgeContextMenu = input<EdgeMouseHandler<EdgeType>>();
  readonly onEdgeMouseEnter = input<EdgeMouseHandler<EdgeType>>();
  readonly onEdgeMouseMove = input<EdgeMouseHandler<EdgeType>>();
  readonly onEdgeMouseLeave = input<EdgeMouseHandler<EdgeType>>();

  // ── Reconnect ──
  readonly onReconnect = input<OnReconnect<EdgeType>>();
  readonly onReconnectStart = input<EdgeWrapperProps<EdgeType>['onReconnectStart']>();
  readonly onReconnectEnd = input<EdgeWrapperProps<EdgeType>['onReconnectEnd']>();
  readonly reconnectRadius = input<number>();

  // ── Connection line ──
  readonly connectionLineType = input.required<ConnectionLineType>();
  readonly connectionLineStyle = input<CSSProperties>();
  readonly connectionLineComponent = input<ConnectionLineComponent<NodeType>>();
  readonly connectionLineContainerStyle = input<CSSProperties>();

  // ── Selection ──
  readonly onSelectionContextMenu = input<(event: MouseEvent, nodes: NodeType[]) => void>();
  readonly onSelectionStart = input<(event: MouseEvent) => void>();
  readonly onSelectionEnd = input<(event: MouseEvent) => void>();
  readonly selectionKeyCode = input.required<KeyCode | null>();
  readonly selectionOnDrag = input<boolean>(false);
  readonly selectionMode = input<SelectionMode>(SelectionMode.Full);

  // ── Key codes ──
  readonly multiSelectionKeyCode = input.required<KeyCode | null>();
  readonly panActivationKeyCode = input<KeyCode | null>();
  readonly zoomActivationKeyCode = input<KeyCode | null>();
  readonly deleteKeyCode = input.required<KeyCode | null>();

  // ── Zoom / pan flags ──
  // Defaults mirror React Flow's prop defaults so optional props forward cleanly into the
  // (non-optional) FlowRenderer inputs. The orchestrating `<ng-flow>` overrides them as needed.
  readonly onlyRenderVisibleElements = input.required<boolean>();
  readonly elementsSelectable = input<boolean>(true);
  readonly translateExtent = input.required<CoordinateExtent>();
  readonly minZoom = input.required<number>();
  readonly maxZoom = input.required<number>();
  readonly preventScrolling = input<boolean>(true);
  readonly defaultMarkerColor = input.required<string | null>();
  readonly zoomOnScroll = input<boolean>(true);
  readonly zoomOnPinch = input<boolean>(true);
  readonly panOnScroll = input<boolean>(false);
  readonly panOnScrollSpeed = input<number>(0.5);
  readonly panOnScrollMode = input<PanOnScrollMode>(PanOnScrollMode.Free);
  readonly zoomOnDoubleClick = input<boolean>(true);
  readonly panOnDrag = input<boolean | number[]>(true);
  readonly autoPanOnSelection = input<boolean>(true);

  // ── Pane handlers ──
  readonly onPaneClick = input<(event: MouseEvent) => void>();
  readonly onPaneMouseEnter = input<(event: MouseEvent) => void>();
  readonly onPaneMouseMove = input<(event: MouseEvent) => void>();
  readonly onPaneMouseLeave = input<(event: MouseEvent) => void>();
  readonly onPaneScroll = input<(event?: WheelEvent) => void>();
  readonly onPaneContextMenu = input<(event: MouseEvent) => void>();
  readonly paneClickDistance = input.required<number>();

  // ── Class names / misc ──
  readonly noDragClassName = input.required<string>();
  readonly noWheelClassName = input.required<string>();
  readonly noPanClassName = input.required<string>();
  readonly disableKeyboardA11y = input.required<boolean>();
  readonly nodeExtent = input<CoordinateExtent>();
  readonly rfId = input.required<string>();

  /** React's `isControlledViewport={!!viewport}` — passed down to ZoomPane via FlowRenderer. */
  protected readonly isControlledViewport = computed(() => !!this.viewport());

  constructor() {
    useNodeOrEdgeTypesWarning(this.nodeTypes);
    useNodeOrEdgeTypesWarning(this.edgeTypes);
    useStylesLoadedWarning();

    /*
     * `useOnInitHandler` takes a plain value and closes over it, but the `onInit` *input* isn't populated
     * at construction time. Pass a stable wrapper that reads the input lazily so the live handler is
     * invoked once the viewport initializes (the wrapper no-ops when no `onInit` was provided).
     */
    useOnInitHandler<NodeType, EdgeType>((instance) => this.onInit()?.(instance));
    useViewportSync(this.viewport);
  }
}
