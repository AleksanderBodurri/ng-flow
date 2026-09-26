import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  type OnInit,
} from '@angular/core';
import {
  type AriaLabelConfig,
  ConnectionLineType,
  type ColorMode,
  type CoordinateExtent,
  infiniteExtent,
  isMacOs,
  type KeyCode,
  mergeAriaLabelConfig,
  type PanelPosition,
  PanOnScrollMode,
  SelectionMode,
} from '@xyflow/system';

import { A11yDescriptions } from '../../components/a11y/a11y-descriptions';
import { Attribution } from '../../components/attribution/attribution';
import { SelectionListener } from '../../components/selection-listener/selection-listener';
import { useColorModeClass } from '../../hooks/use-color-mode-class';
import { FlowStore } from '../../store/flow-store';
import { provideFlow } from '../../store/provide-flow';
import type {
  Edge,
  Node,
  ReactFlowProps,
  ReactFlowState,
} from '../../types';
import { GraphView } from '../graph-view/graph-view';
import { defaultNodeOrigin, defaultViewport as initViewport } from '../init-values';

// Fields synced from inputs into the store (mirrors React Flow's StoreUpdater).
const FIELDS_TO_TRACK = [
  'nodes',
  'edges',
  'onConnect',
  'onConnectStart',
  'onConnectEnd',
  'onClickConnectStart',
  'onClickConnectEnd',
  'nodesDraggable',
  'autoPanOnNodeFocus',
  'nodesConnectable',
  'nodesFocusable',
  'edgesFocusable',
  'edgesReconnectable',
  'elevateNodesOnSelect',
  'elevateEdgesOnSelect',
  'minZoom',
  'maxZoom',
  'nodeExtent',
  'onNodesChange',
  'onEdgesChange',
  'elementsSelectable',
  'connectionMode',
  'snapGrid',
  'snapToGrid',
  'translateExtent',
  'connectOnClick',
  'defaultEdgeOptions',
  'fitView',
  'fitViewOptions',
  'onNodesDelete',
  'onEdgesDelete',
  'onDelete',
  'onNodeDrag',
  'onNodeDragStart',
  'onNodeDragStop',
  'onSelectionDrag',
  'onSelectionDragStart',
  'onSelectionDragStop',
  'onMoveStart',
  'onMove',
  'onMoveEnd',
  'noPanClassName',
  'nodeOrigin',
  'autoPanOnConnect',
  'autoPanOnNodeDrag',
  'onError',
  'connectionRadius',
  'isValidConnection',
  'selectNodesOnDrag',
  'nodeDragThreshold',
  'connectionDragThreshold',
  'onBeforeDelete',
  'debug',
  'autoPanSpeed',
  'ariaLabelConfig',
  'zIndexMode',
  'rfId',
] as const;

// Values also passed to other components; seeding them avoids redundant initial setState.
const INIT_PREV_VALUES: Record<string, unknown> = {
  translateExtent: infiniteExtent,
  nodeOrigin: defaultNodeOrigin,
  minZoom: 0.5,
  maxZoom: 2,
  elementsSelectable: true,
  noPanClassName: 'nopan',
  rfId: '1',
};

/**
 * The `<ng-flow>` component is the heart of an ng-flow application. It renders your
 * nodes and edges, handles user interaction (pan, zoom, drag, select, connect), and
 * is the Angular port of React Flow's `<ReactFlow>`.
 *
 * Event handlers are exposed as callback inputs named exactly as in React Flow
 * (`[onNodeClick]`, `[onConnect]`, …) so React Flow knowledge and code migrate
 * directly, and so they can be stored/forwarded into the internal store.
 *
 * @public
 */
@Component({
  selector: 'ng-flow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideFlow()],
  imports: [GraphView, SelectionListener, Attribution, A11yDescriptions],
  host: {
    'data-testid': 'rf__wrapper',
    role: 'application',
    '[class]': 'hostClass()',
    // `<ng-flow>` is a custom element (defaults to display:inline) — without an explicit
    // block display, width/height:100% are ignored and the wrapper collapses to 0×0,
    // which also breaks auto-pan bounds (calcAutoPan would fire for any pointer position).
    '[style.display]': "'block'",
    '[style.width]': "'100%'",
    '[style.height]': "'100%'",
    '[style.overflow]': "'hidden'",
    '[style.position]': "'relative'",
    '[style.z-index]': '0',
    '[id]': 'id() || null',
  },
  template: `
    <ng-flow-graph-view
      [rfId]="rfId()"
      [nodeTypes]="nodeTypes()"
      [edgeTypes]="edgeTypes()"
      [onInit]="onInit()"
      [onNodeClick]="onNodeClick()"
      [onNodeDoubleClick]="onNodeDoubleClick()"
      [onNodeMouseEnter]="onNodeMouseEnter()"
      [onNodeMouseMove]="onNodeMouseMove()"
      [onNodeMouseLeave]="onNodeMouseLeave()"
      [onNodeContextMenu]="onNodeContextMenu()"
      [onEdgeClick]="onEdgeClick()"
      [onEdgeDoubleClick]="onEdgeDoubleClick()"
      [onEdgeContextMenu]="onEdgeContextMenu()"
      [onEdgeMouseEnter]="onEdgeMouseEnter()"
      [onEdgeMouseMove]="onEdgeMouseMove()"
      [onEdgeMouseLeave]="onEdgeMouseLeave()"
      [onReconnect]="onReconnect()"
      [onReconnectStart]="onReconnectStart()"
      [onReconnectEnd]="onReconnectEnd()"
      [reconnectRadius]="reconnectRadius()"
      [connectionLineType]="connectionLineType()"
      [connectionLineStyle]="connectionLineStyle()"
      [connectionLineComponent]="connectionLineComponent()"
      [connectionLineContainerStyle]="connectionLineContainerStyle()"
      [selectionKeyCode]="selectionKeyCode()"
      [selectionOnDrag]="selectionOnDrag()"
      [selectionMode]="selectionMode()"
      [deleteKeyCode]="deleteKeyCode()"
      [multiSelectionKeyCode]="multiSelectionKeyCode()"
      [panActivationKeyCode]="panActivationKeyCode()"
      [zoomActivationKeyCode]="zoomActivationKeyCode()"
      [onlyRenderVisibleElements]="onlyRenderVisibleElements()"
      [defaultViewport]="defaultViewport()"
      [translateExtent]="translateExtent()"
      [minZoom]="minZoom()"
      [maxZoom]="maxZoom()"
      [preventScrolling]="preventScrolling()"
      [zoomOnScroll]="zoomOnScroll()"
      [zoomOnPinch]="zoomOnPinch()"
      [zoomOnDoubleClick]="zoomOnDoubleClick()"
      [panOnScroll]="panOnScroll()"
      [panOnScrollSpeed]="panOnScrollSpeed()"
      [panOnScrollMode]="panOnScrollMode()"
      [panOnDrag]="panOnDrag()"
      [autoPanOnSelection]="autoPanOnSelection()"
      [onPaneClick]="onPaneClick()"
      [onPaneMouseEnter]="onPaneMouseEnter()"
      [onPaneMouseMove]="onPaneMouseMove()"
      [onPaneMouseLeave]="onPaneMouseLeave()"
      [onPaneScroll]="onPaneScroll()"
      [onPaneContextMenu]="onPaneContextMenu()"
      [paneClickDistance]="paneClickDistance()"
      [nodeClickDistance]="nodeClickDistance()"
      [onSelectionContextMenu]="onSelectionContextMenu()"
      [onSelectionStart]="onSelectionStart()"
      [onSelectionEnd]="onSelectionEnd()"
      [defaultMarkerColor]="defaultMarkerColor()"
      [noDragClassName]="noDragClassName()"
      [noWheelClassName]="noWheelClassName()"
      [noPanClassName]="noPanClassName()"
      [disableKeyboardA11y]="disableKeyboardA11y()"
      [nodeExtent]="nodeExtent()"
      [viewport]="viewport()"
      [onViewportChange]="onViewportChange()"
    />
    <ng-flow-selection-listener [onSelectionChange]="$any(onSelectionChange())" />
    <ng-content />
    <ng-flow-attribution [proOptions]="proOptions()" [position]="attributionPosition()" />
    <ng-flow-a11y-descriptions [rfId]="rfId()" [disableKeyboardA11y]="disableKeyboardA11y()" />
  `,
})
export class NgFlow<NodeType extends Node = Node, EdgeType extends Edge = Edge> implements OnInit {
  /** The flow's host element (the `.react-flow` wrapper). */
  readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly flowStore = inject<FlowStore<NodeType, EdgeType>>(FlowStore);

  // ----- controlled / uncontrolled data -----
  readonly nodes = input<NodeType[]>();
  readonly edges = input<EdgeType[]>();
  readonly defaultNodes = input<NodeType[]>();
  readonly defaultEdges = input<EdgeType[]>();
  readonly defaultEdgeOptions = input<ReactFlowProps<NodeType, EdgeType>['defaultEdgeOptions']>();

  // ----- event handlers (callback inputs, named as React Flow) -----
  readonly onNodeClick = input<ReactFlowProps<NodeType, EdgeType>['onNodeClick']>();
  readonly onNodeDoubleClick = input<ReactFlowProps<NodeType, EdgeType>['onNodeDoubleClick']>();
  readonly onNodeMouseEnter = input<ReactFlowProps<NodeType, EdgeType>['onNodeMouseEnter']>();
  readonly onNodeMouseMove = input<ReactFlowProps<NodeType, EdgeType>['onNodeMouseMove']>();
  readonly onNodeMouseLeave = input<ReactFlowProps<NodeType, EdgeType>['onNodeMouseLeave']>();
  readonly onNodeContextMenu = input<ReactFlowProps<NodeType, EdgeType>['onNodeContextMenu']>();
  readonly onNodeDragStart = input<ReactFlowProps<NodeType, EdgeType>['onNodeDragStart']>();
  readonly onNodeDrag = input<ReactFlowProps<NodeType, EdgeType>['onNodeDrag']>();
  readonly onNodeDragStop = input<ReactFlowProps<NodeType, EdgeType>['onNodeDragStop']>();
  readonly onEdgeClick = input<ReactFlowProps<NodeType, EdgeType>['onEdgeClick']>();
  readonly onEdgeDoubleClick = input<ReactFlowProps<NodeType, EdgeType>['onEdgeDoubleClick']>();
  readonly onEdgeContextMenu = input<ReactFlowProps<NodeType, EdgeType>['onEdgeContextMenu']>();
  readonly onEdgeMouseEnter = input<ReactFlowProps<NodeType, EdgeType>['onEdgeMouseEnter']>();
  readonly onEdgeMouseMove = input<ReactFlowProps<NodeType, EdgeType>['onEdgeMouseMove']>();
  readonly onEdgeMouseLeave = input<ReactFlowProps<NodeType, EdgeType>['onEdgeMouseLeave']>();
  readonly onReconnect = input<ReactFlowProps<NodeType, EdgeType>['onReconnect']>();
  readonly onReconnectStart = input<ReactFlowProps<NodeType, EdgeType>['onReconnectStart']>();
  readonly onReconnectEnd = input<ReactFlowProps<NodeType, EdgeType>['onReconnectEnd']>();
  readonly onNodesChange = input<ReactFlowProps<NodeType, EdgeType>['onNodesChange']>();
  readonly onEdgesChange = input<ReactFlowProps<NodeType, EdgeType>['onEdgesChange']>();
  readonly onNodesDelete = input<ReactFlowProps<NodeType, EdgeType>['onNodesDelete']>();
  readonly onEdgesDelete = input<ReactFlowProps<NodeType, EdgeType>['onEdgesDelete']>();
  readonly onDelete = input<ReactFlowProps<NodeType, EdgeType>['onDelete']>();
  readonly onSelectionDragStart = input<ReactFlowProps<NodeType, EdgeType>['onSelectionDragStart']>();
  readonly onSelectionDrag = input<ReactFlowProps<NodeType, EdgeType>['onSelectionDrag']>();
  readonly onSelectionDragStop = input<ReactFlowProps<NodeType, EdgeType>['onSelectionDragStop']>();
  readonly onSelectionStart = input<ReactFlowProps<NodeType, EdgeType>['onSelectionStart']>();
  readonly onSelectionEnd = input<ReactFlowProps<NodeType, EdgeType>['onSelectionEnd']>();
  readonly onSelectionContextMenu = input<ReactFlowProps<NodeType, EdgeType>['onSelectionContextMenu']>();
  readonly onConnect = input<ReactFlowProps<NodeType, EdgeType>['onConnect']>();
  readonly onConnectStart = input<ReactFlowProps<NodeType, EdgeType>['onConnectStart']>();
  readonly onConnectEnd = input<ReactFlowProps<NodeType, EdgeType>['onConnectEnd']>();
  readonly onClickConnectStart = input<ReactFlowProps<NodeType, EdgeType>['onClickConnectStart']>();
  readonly onClickConnectEnd = input<ReactFlowProps<NodeType, EdgeType>['onClickConnectEnd']>();
  readonly onInit = input<ReactFlowProps<NodeType, EdgeType>['onInit']>();
  readonly onMove = input<ReactFlowProps<NodeType, EdgeType>['onMove']>();
  readonly onMoveStart = input<ReactFlowProps<NodeType, EdgeType>['onMoveStart']>();
  readonly onMoveEnd = input<ReactFlowProps<NodeType, EdgeType>['onMoveEnd']>();
  readonly onSelectionChange = input<ReactFlowProps<NodeType, EdgeType>['onSelectionChange']>();
  readonly onPaneScroll = input<ReactFlowProps<NodeType, EdgeType>['onPaneScroll']>();
  readonly onPaneClick = input<ReactFlowProps<NodeType, EdgeType>['onPaneClick']>();
  readonly onPaneContextMenu = input<ReactFlowProps<NodeType, EdgeType>['onPaneContextMenu']>();
  readonly onPaneMouseEnter = input<ReactFlowProps<NodeType, EdgeType>['onPaneMouseEnter']>();
  readonly onPaneMouseMove = input<ReactFlowProps<NodeType, EdgeType>['onPaneMouseMove']>();
  readonly onPaneMouseLeave = input<ReactFlowProps<NodeType, EdgeType>['onPaneMouseLeave']>();
  readonly onBeforeDelete = input<ReactFlowProps<NodeType, EdgeType>['onBeforeDelete']>();
  readonly onError = input<ReactFlowProps<NodeType, EdgeType>['onError']>();
  readonly onViewportChange = input<ReactFlowProps<NodeType, EdgeType>['onViewportChange']>();
  readonly isValidConnection = input<ReactFlowProps<NodeType, EdgeType>['isValidConnection']>();

  // ----- custom components -----
  readonly nodeTypes = input<ReactFlowProps<NodeType, EdgeType>['nodeTypes']>();
  readonly edgeTypes = input<ReactFlowProps<NodeType, EdgeType>['edgeTypes']>();
  readonly connectionLineComponent = input<ReactFlowProps<NodeType, EdgeType>['connectionLineComponent']>();

  // ----- config (defaults match React Flow) -----
  readonly connectionLineType = input<ConnectionLineType>(ConnectionLineType.Bezier);
  readonly connectionLineStyle = input<ReactFlowProps['connectionLineStyle']>();
  readonly connectionLineContainerStyle = input<ReactFlowProps['connectionLineContainerStyle']>();
  readonly connectionMode = input<ReactFlowProps['connectionMode']>();
  readonly deleteKeyCode = input<KeyCode | null>('Backspace');
  readonly selectionKeyCode = input<KeyCode | null>('Shift');
  readonly selectionOnDrag = input<boolean>(false);
  readonly selectionMode = input<SelectionMode>(SelectionMode.Full);
  readonly panActivationKeyCode = input<KeyCode | null>('Space');
  readonly multiSelectionKeyCode = input<KeyCode | null>(isMacOs() ? 'Meta' : 'Control');
  readonly zoomActivationKeyCode = input<KeyCode | null>(isMacOs() ? 'Meta' : 'Control');
  readonly snapToGrid = input<ReactFlowProps['snapToGrid']>();
  readonly snapGrid = input<ReactFlowProps['snapGrid']>();
  readonly onlyRenderVisibleElements = input<boolean>(false);
  readonly nodesDraggable = input<ReactFlowProps['nodesDraggable']>();
  readonly autoPanOnNodeFocus = input<ReactFlowProps['autoPanOnNodeFocus']>();
  readonly nodesConnectable = input<ReactFlowProps['nodesConnectable']>();
  readonly nodesFocusable = input<ReactFlowProps['nodesFocusable']>();
  readonly nodeOrigin = input(defaultNodeOrigin);
  readonly edgesFocusable = input<ReactFlowProps['edgesFocusable']>();
  readonly edgesReconnectable = input<ReactFlowProps['edgesReconnectable']>();
  readonly elementsSelectable = input<boolean>(true);
  readonly selectNodesOnDrag = input<ReactFlowProps['selectNodesOnDrag']>();
  readonly panOnDrag = input<boolean | number[]>(true);
  readonly minZoom = input<number>(0.5);
  readonly maxZoom = input<number>(2);
  readonly viewport = input<ReactFlowProps['viewport']>();
  readonly defaultViewport = input(initViewport);
  readonly translateExtent = input<CoordinateExtent>(infiniteExtent);
  readonly preventScrolling = input<boolean>(true);
  readonly nodeExtent = input<CoordinateExtent>();
  readonly defaultMarkerColor = input<string | null>('#b1b1b7');
  readonly zoomOnScroll = input<boolean>(true);
  readonly zoomOnPinch = input<boolean>(true);
  readonly panOnScroll = input<boolean>(false);
  readonly panOnScrollSpeed = input<number>(0.5);
  readonly panOnScrollMode = input<PanOnScrollMode>(PanOnScrollMode.Free);
  readonly zoomOnDoubleClick = input<boolean>(true);
  readonly reconnectRadius = input<number>(10);
  readonly paneClickDistance = input<number>(1);
  readonly nodeClickDistance = input<number>(0);
  readonly noDragClassName = input<string>('nodrag');
  readonly noWheelClassName = input<string>('nowheel');
  readonly noPanClassName = input<string>('nopan');
  readonly fitView = input<ReactFlowProps['fitView']>();
  readonly fitViewOptions = input<ReactFlowProps['fitViewOptions']>();
  readonly connectOnClick = input<ReactFlowProps['connectOnClick']>();
  readonly attributionPosition = input<PanelPosition>('bottom-right');
  /** Attribution is hidden by default; pass `{ hideAttribution: false }` to show it. */
  readonly proOptions = input<ReactFlowProps['proOptions']>();
  readonly elevateNodesOnSelect = input<boolean>(true);
  readonly elevateEdgesOnSelect = input<boolean>(false);
  readonly disableKeyboardA11y = input<boolean>(false);
  readonly autoPanOnConnect = input<ReactFlowProps['autoPanOnConnect']>();
  readonly autoPanOnNodeDrag = input<ReactFlowProps['autoPanOnNodeDrag']>();
  readonly autoPanOnSelection = input<boolean>(true);
  readonly autoPanSpeed = input<ReactFlowProps['autoPanSpeed']>();
  readonly connectionRadius = input<ReactFlowProps['connectionRadius']>();
  readonly nodeDragThreshold = input<ReactFlowProps['nodeDragThreshold']>();
  readonly connectionDragThreshold = input<ReactFlowProps['connectionDragThreshold']>();
  readonly width = input<number>();
  readonly height = input<number>();
  readonly colorMode = input<ColorMode>('light');
  readonly debug = input<boolean>(false);
  readonly ariaLabelConfig = input<Partial<AriaLabelConfig>>();
  readonly zIndexMode = input<ReactFlowProps['zIndexMode']>('basic');
  readonly id = input<string>();
  readonly className = input<string>();

  protected readonly rfId = computed(() => this.id() || '1');
  private readonly colorModeClass = useColorModeClass(this.colorMode);
  protected readonly hostClass = computed(() =>
    ['react-flow', this.className(), this.colorModeClass()].filter(Boolean).join(' ')
  );

  private readonly prevFields: Record<string, unknown> = { ...INIT_PREV_VALUES };

  constructor() {
    // StoreUpdater: sync tracked inputs into the store whenever any of them change.
    effect(() => {
      const values = this.collectTrackedValues();
      const state = this.flowStore.getState();
      for (const field of FIELDS_TO_TRACK) {
        const value = values[field];
        if (value === this.prevFields[field]) {
          continue;
        }
        if (typeof value === 'undefined') {
          continue;
        }
        this.applyField(field, value, state);
        this.prevFields[field] = value;
      }
    });
  }

  ngOnInit(): void {
    // Seed the store with initial options (analogue of React's createStore(props)).
    this.flowStore.initialize({
      nodes: this.nodes(),
      edges: this.edges(),
      defaultNodes: this.defaultNodes(),
      defaultEdges: this.defaultEdges(),
      width: this.width(),
      height: this.height(),
      fitView: this.fitView(),
      fitViewOptions: this.fitViewOptions(),
      minZoom: this.minZoom(),
      maxZoom: this.maxZoom(),
      nodeOrigin: this.nodeOrigin(),
      nodeExtent: this.nodeExtent(),
      zIndexMode: this.zIndexMode(),
    });
    this.flowStore.getState().setDefaultNodesAndEdges(this.defaultNodes(), this.defaultEdges());
  }

  /** Reads every tracked input signal (so the sync effect depends on all of them). */
  private collectTrackedValues(): Record<string, unknown> {
    return {
      nodes: this.nodes(),
      edges: this.edges(),
      onConnect: this.onConnect(),
      onConnectStart: this.onConnectStart(),
      onConnectEnd: this.onConnectEnd(),
      onClickConnectStart: this.onClickConnectStart(),
      onClickConnectEnd: this.onClickConnectEnd(),
      nodesDraggable: this.nodesDraggable(),
      autoPanOnNodeFocus: this.autoPanOnNodeFocus(),
      nodesConnectable: this.nodesConnectable(),
      nodesFocusable: this.nodesFocusable(),
      edgesFocusable: this.edgesFocusable(),
      edgesReconnectable: this.edgesReconnectable(),
      elevateNodesOnSelect: this.elevateNodesOnSelect(),
      elevateEdgesOnSelect: this.elevateEdgesOnSelect(),
      minZoom: this.minZoom(),
      maxZoom: this.maxZoom(),
      nodeExtent: this.nodeExtent(),
      onNodesChange: this.onNodesChange(),
      onEdgesChange: this.onEdgesChange(),
      elementsSelectable: this.elementsSelectable(),
      connectionMode: this.connectionMode(),
      snapGrid: this.snapGrid(),
      snapToGrid: this.snapToGrid(),
      translateExtent: this.translateExtent(),
      connectOnClick: this.connectOnClick(),
      defaultEdgeOptions: this.defaultEdgeOptions(),
      fitView: this.fitView(),
      fitViewOptions: this.fitViewOptions(),
      onNodesDelete: this.onNodesDelete(),
      onEdgesDelete: this.onEdgesDelete(),
      onDelete: this.onDelete(),
      onNodeDrag: this.onNodeDrag(),
      onNodeDragStart: this.onNodeDragStart(),
      onNodeDragStop: this.onNodeDragStop(),
      onSelectionDrag: this.onSelectionDrag(),
      onSelectionDragStart: this.onSelectionDragStart(),
      onSelectionDragStop: this.onSelectionDragStop(),
      onMoveStart: this.onMoveStart(),
      onMove: this.onMove(),
      onMoveEnd: this.onMoveEnd(),
      noPanClassName: this.noPanClassName(),
      nodeOrigin: this.nodeOrigin(),
      autoPanOnConnect: this.autoPanOnConnect(),
      autoPanOnNodeDrag: this.autoPanOnNodeDrag(),
      onError: this.onError(),
      connectionRadius: this.connectionRadius(),
      isValidConnection: this.isValidConnection(),
      selectNodesOnDrag: this.selectNodesOnDrag(),
      nodeDragThreshold: this.nodeDragThreshold(),
      connectionDragThreshold: this.connectionDragThreshold(),
      onBeforeDelete: this.onBeforeDelete(),
      debug: this.debug(),
      autoPanSpeed: this.autoPanSpeed(),
      ariaLabelConfig: this.ariaLabelConfig(),
      zIndexMode: this.zIndexMode(),
      rfId: this.rfId(),
    };
  }

  private applyField(field: string, value: unknown, state: ReactFlowState<NodeType, EdgeType>): void {
    switch (field) {
      case 'nodes':
        state.setNodes(value as NodeType[]);
        break;
      case 'edges':
        state.setEdges(value as EdgeType[]);
        break;
      case 'minZoom':
        state.setMinZoom(value as number);
        break;
      case 'maxZoom':
        state.setMaxZoom(value as number);
        break;
      case 'translateExtent':
        state.setTranslateExtent(value as CoordinateExtent);
        break;
      case 'nodeExtent':
        state.setNodeExtent(value as CoordinateExtent);
        break;
      case 'ariaLabelConfig':
        this.flowStore.setState({ ariaLabelConfig: mergeAriaLabelConfig(value as Partial<AriaLabelConfig>) });
        break;
      case 'fitView':
        this.flowStore.setState({ fitViewQueued: value as boolean });
        break;
      case 'fitViewOptions':
        this.flowStore.setState({ fitViewOptions: value as ReactFlowProps['fitViewOptions'] });
        break;
      default:
        this.flowStore.setState({ [field]: value } as Partial<ReactFlowState<NodeType, EdgeType>>);
    }
  }
}
