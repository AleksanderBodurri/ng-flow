import type {
  AriaLabelConfig,
  ColorMode,
  ConnectionLineType,
  ConnectionMode,
  CoordinateExtent,
  FinalConnectionState,
  HandleType,
  KeyCode,
  NodeOrigin,
  OnConnect,
  OnConnectEnd,
  OnConnectStart,
  OnError,
  OnMove,
  OnMoveEnd,
  OnMoveStart,
  OnReconnect,
  PanelPosition,
  PanOnScrollMode,
  ProOptions,
  SelectionMode,
  SnapGrid,
  Viewport,
  ZIndexMode,
} from '@xyflow/system';

import type { CSSProperties } from './css';
import type {
  ConnectionLineComponent,
  DefaultEdgeOptions,
  Edge,
  EdgeMouseHandler,
  EdgeTypes,
  FitViewOptions,
  IsValidConnection,
  Node,
  NodeMouseHandler,
  NodeTypes,
  OnBeforeDelete,
  OnDelete,
  OnEdgesChange,
  OnEdgesDelete,
  OnInit,
  OnNodeDrag,
  OnNodesChange,
  OnNodesDelete,
  OnSelectionChangeFunc,
  SelectionDragHandler,
} from '.';

/**
 * `<ng-flow>` component props. The ng-flow port of React Flow's `ReactFlowProps`.
 * (Native HTML attributes are placed directly on the `<ng-flow>` host element rather
 * than modelled here, unlike React's `extends HTMLAttributes`.)
 * @public
 */
export interface ReactFlowProps<NodeType extends Node = Node, EdgeType extends Edge = Edge> {
  /** An array of nodes to render in a controlled flow. @default [] */
  nodes?: NodeType[];
  /** An array of edges to render in a controlled flow. @default [] */
  edges?: EdgeType[];
  /** The initial nodes to render in an uncontrolled flow. */
  defaultNodes?: NodeType[];
  /** The initial edges to render in an uncontrolled flow. */
  defaultEdges?: EdgeType[];
  /** Defaults applied to all new edges added to the flow. */
  defaultEdgeOptions?: DefaultEdgeOptions;
  onNodeClick?: NodeMouseHandler<NodeType>;
  onNodeDoubleClick?: NodeMouseHandler<NodeType>;
  onNodeMouseEnter?: NodeMouseHandler<NodeType>;
  onNodeMouseMove?: NodeMouseHandler<NodeType>;
  onNodeMouseLeave?: NodeMouseHandler<NodeType>;
  onNodeContextMenu?: NodeMouseHandler<NodeType>;
  onNodeDragStart?: OnNodeDrag<NodeType>;
  onNodeDrag?: OnNodeDrag<NodeType>;
  onNodeDragStop?: OnNodeDrag<NodeType>;
  onEdgeClick?: (event: MouseEvent, edge: EdgeType) => void;
  onEdgeContextMenu?: EdgeMouseHandler<EdgeType>;
  onEdgeMouseEnter?: EdgeMouseHandler<EdgeType>;
  onEdgeMouseMove?: EdgeMouseHandler<EdgeType>;
  onEdgeMouseLeave?: EdgeMouseHandler<EdgeType>;
  onEdgeDoubleClick?: EdgeMouseHandler<EdgeType>;
  onReconnect?: OnReconnect<EdgeType>;
  onReconnectStart?: (event: MouseEvent, edge: EdgeType, handleType: HandleType) => void;
  onReconnectEnd?: (
    event: MouseEvent | TouchEvent,
    edge: EdgeType,
    handleType: HandleType,
    connectionState: FinalConnectionState
  ) => void;
  onNodesChange?: OnNodesChange<NodeType>;
  onEdgesChange?: OnEdgesChange<EdgeType>;
  onNodesDelete?: OnNodesDelete<NodeType>;
  onEdgesDelete?: OnEdgesDelete<EdgeType>;
  onDelete?: OnDelete<NodeType, EdgeType>;
  onSelectionDragStart?: SelectionDragHandler<NodeType>;
  onSelectionDrag?: SelectionDragHandler<NodeType>;
  onSelectionDragStop?: SelectionDragHandler<NodeType>;
  onSelectionStart?: (event: MouseEvent) => void;
  onSelectionEnd?: (event: MouseEvent) => void;
  onSelectionContextMenu?: (event: MouseEvent, nodes: NodeType[]) => void;
  onConnect?: OnConnect;
  onConnectStart?: OnConnectStart;
  onConnectEnd?: OnConnectEnd;
  onClickConnectStart?: OnConnectStart;
  onClickConnectEnd?: OnConnectEnd;
  onInit?: OnInit<NodeType, EdgeType>;
  onMove?: OnMove;
  onMoveStart?: OnMoveStart;
  onMoveEnd?: OnMoveEnd;
  onSelectionChange?: OnSelectionChangeFunc<NodeType, EdgeType>;
  onPaneScroll?: (event?: WheelEvent) => void;
  onPaneClick?: (event: MouseEvent) => void;
  onPaneContextMenu?: (event: MouseEvent) => void;
  onPaneMouseEnter?: (event: MouseEvent) => void;
  onPaneMouseMove?: (event: MouseEvent) => void;
  onPaneMouseLeave?: (event: MouseEvent) => void;
  /** Distance the mouse can move between mousedown/up that still triggers a pane click. @default 0 */
  paneClickDistance?: number;
  /** Distance the mouse can move between mousedown/up that still triggers a node click. @default 0 */
  nodeClickDistance?: number;
  onBeforeDelete?: OnBeforeDelete<NodeType, EdgeType>;
  /** Custom node types available in the flow. */
  nodeTypes?: NodeTypes;
  /** Custom edge types available in the flow. */
  edgeTypes?: EdgeTypes;
  /** The type of edge path to use for connection lines. @default ConnectionLineType.Bezier */
  connectionLineType?: ConnectionLineType;
  connectionLineStyle?: CSSProperties;
  /** Angular component to be used as a connection line. */
  connectionLineComponent?: ConnectionLineComponent<NodeType>;
  connectionLineContainerStyle?: CSSProperties;
  /** @default 'strict' */
  connectionMode?: ConnectionMode;
  /** @default 'Backspace' */
  deleteKeyCode?: KeyCode | null;
  /** @default 'Shift' */
  selectionKeyCode?: KeyCode | null;
  /** @default false */
  selectionOnDrag?: boolean;
  /** @default 'full' */
  selectionMode?: SelectionMode;
  /** @default 'Space' */
  panActivationKeyCode?: KeyCode | null;
  /** @default "Meta"/"Control" */
  multiSelectionKeyCode?: KeyCode | null;
  /** @default "Meta"/"Control" */
  zoomActivationKeyCode?: KeyCode | null;
  snapToGrid?: boolean;
  snapGrid?: SnapGrid;
  /** @default false */
  onlyRenderVisibleElements?: boolean;
  /** @default true */
  nodesDraggable?: boolean;
  /** @default true */
  autoPanOnNodeFocus?: boolean;
  /** @default true */
  nodesConnectable?: boolean;
  /** @default true */
  nodesFocusable?: boolean;
  /** @default [0, 0] */
  nodeOrigin?: NodeOrigin;
  /** @default true */
  edgesFocusable?: boolean;
  /** @default true */
  edgesReconnectable?: boolean;
  /** @default true */
  elementsSelectable?: boolean;
  /** @default true */
  selectNodesOnDrag?: boolean;
  /** @default true */
  panOnDrag?: boolean | number[];
  /** @default 0.5 */
  minZoom?: number;
  /** @default 2 */
  maxZoom?: number;
  /** Controlled viewport; requires `onViewportChange`. */
  viewport?: Viewport;
  /** @default { x: 0, y: 0, zoom: 1 } */
  defaultViewport?: Viewport;
  onViewportChange?: (viewport: Viewport) => void;
  /** @default [[-∞, -∞], [+∞, +∞]] */
  translateExtent?: CoordinateExtent;
  /** @default true */
  preventScrolling?: boolean;
  nodeExtent?: CoordinateExtent;
  /** @default '#b1b1b7' */
  defaultMarkerColor?: string | null;
  /** @default true */
  zoomOnScroll?: boolean;
  /** @default true */
  zoomOnPinch?: boolean;
  /** @default false */
  panOnScroll?: boolean;
  /** @default 0.5 */
  panOnScrollSpeed?: number;
  /** @default "free" */
  panOnScrollMode?: PanOnScrollMode;
  /** @default true */
  zoomOnDoubleClick?: boolean;
  /** @default 10 */
  reconnectRadius?: number;
  /** @default "nodrag" */
  noDragClassName?: string;
  /** @default "nowheel" */
  noWheelClassName?: string;
  /** @default "nopan" */
  noPanClassName?: string;
  /** Zoom and pan to fit all nodes initially. */
  fitView?: boolean;
  fitViewOptions?: FitViewOptions;
  /** @default true */
  connectOnClick?: boolean;
  /** @default 'bottom-right' */
  attributionPosition?: PanelPosition;
  proOptions?: ProOptions;
  /** @default true */
  elevateNodesOnSelect?: boolean;
  /** @default false */
  elevateEdgesOnSelect?: boolean;
  /** @default false */
  disableKeyboardA11y?: boolean;
  /** @default true */
  autoPanOnNodeDrag?: boolean;
  /** @default true */
  autoPanOnConnect?: boolean;
  /** @default true */
  autoPanOnSelection?: boolean;
  /** @default 15 */
  autoPanSpeed?: number;
  /** @default 20 */
  connectionRadius?: number;
  onError?: OnError;
  isValidConnection?: IsValidConnection<EdgeType>;
  /** @default 1 */
  nodeDragThreshold?: number;
  /** @default 1 */
  connectionDragThreshold?: number;
  /** Sets a fixed width for the flow. */
  width?: number;
  /** Sets a fixed height for the flow. */
  height?: number;
  /** @default 'light' */
  colorMode?: ColorMode;
  /** @default false */
  debug?: boolean;
  ariaLabelConfig?: Partial<AriaLabelConfig>;
  /** @default 'basic' */
  zIndexMode?: ZIndexMode;
}
