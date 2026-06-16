import {
  adoptUserNodes,
  ConnectionMode,
  type CoordinateExtent,
  createDevWarn,
  defaultAriaLabelConfig,
  getInternalNodesBounds,
  getViewportForBounds,
  infiniteExtent,
  initialConnection,
  type NodeOrigin,
  type Transform,
  updateConnectionLookup,
  type ZIndexMode,
} from '@xyflow/system';

import type { Edge, FitViewOptions, InternalNode, Node, ReactFlowStore } from '../types';

const devWarn = createDevWarn('ng-flow', 'https://reactflow.dev/');

export type GetInitialStateOptions<NodeType extends Node = Node, EdgeType extends Edge = Edge> = {
  nodes?: NodeType[];
  edges?: EdgeType[];
  defaultNodes?: NodeType[];
  defaultEdges?: EdgeType[];
  width?: number;
  height?: number;
  fitView?: boolean;
  fitViewOptions?: FitViewOptions;
  minZoom?: number;
  maxZoom?: number;
  nodeOrigin?: NodeOrigin;
  nodeExtent?: CoordinateExtent;
  zIndexMode?: ZIndexMode;
};

export function getInitialState<NodeType extends Node = Node, EdgeType extends Edge = Edge>({
  nodes,
  edges,
  defaultNodes,
  defaultEdges,
  width,
  height,
  fitView,
  fitViewOptions,
  minZoom = 0.5,
  maxZoom = 2,
  nodeOrigin,
  nodeExtent,
  zIndexMode = 'basic',
}: GetInitialStateOptions<NodeType, EdgeType> = {}): ReactFlowStore<NodeType, EdgeType> {
  const nodeLookup = new Map<string, InternalNode<NodeType>>();
  const parentLookup = new Map();
  const connectionLookup = new Map();
  const edgeLookup = new Map();

  const storeEdges = defaultEdges ?? edges ?? [];
  const storeNodes = defaultNodes ?? nodes ?? [];
  const storeNodeOrigin = nodeOrigin ?? [0, 0];
  const storeNodeExtent = nodeExtent ?? infiniteExtent;

  updateConnectionLookup(connectionLookup, edgeLookup, storeEdges);
  const { nodesInitialized } = adoptUserNodes(storeNodes, nodeLookup, parentLookup, {
    nodeOrigin: storeNodeOrigin,
    nodeExtent: storeNodeExtent,
    zIndexMode,
  });

  let transform: Transform = [0, 0, 1];

  if (fitView && width && height) {
    const bounds = getInternalNodesBounds(nodeLookup, {
      filter: (node) => !!((node.width || node.initialWidth) && (node.height || node.initialHeight)),
    });

    const { x, y, zoom } = getViewportForBounds(bounds, width, height, minZoom, maxZoom, fitViewOptions?.padding ?? 0.1);
    transform = [x, y, zoom];
  }

  return {
    rfId: '1',
    width: width ?? 0,
    height: height ?? 0,
    transform,
    nodes: storeNodes,
    nodesInitialized,
    nodeLookup,
    parentLookup,
    edges: storeEdges,
    edgeLookup,
    connectionLookup,
    onNodesChange: null,
    onEdgesChange: null,
    hasDefaultNodes: defaultNodes !== undefined,
    hasDefaultEdges: defaultEdges !== undefined,
    panZoom: null,
    minZoom,
    maxZoom,
    translateExtent: infiniteExtent,
    nodeExtent: storeNodeExtent,
    nodesSelectionActive: false,
    userSelectionActive: false,
    userSelectionRect: null,
    connectionMode: ConnectionMode.Strict,
    domNode: null,
    paneDragging: false,
    noPanClassName: 'nopan',
    nodeOrigin: storeNodeOrigin,
    nodeDragThreshold: 1,
    connectionDragThreshold: 1,

    snapGrid: [15, 15],
    snapToGrid: false,

    nodesDraggable: true,
    nodesConnectable: true,
    nodesFocusable: true,
    edgesFocusable: true,
    edgesReconnectable: true,
    elementsSelectable: true,
    elevateNodesOnSelect: true,
    elevateEdgesOnSelect: true,
    selectNodesOnDrag: true,

    multiSelectionActive: false,

    fitViewQueued: fitView ?? false,
    fitViewOptions,
    fitViewResolver: null,

    connection: { ...initialConnection },
    connectionClickStartHandle: null,
    connectOnClick: true,

    ariaLiveMessage: '',
    autoPanOnConnect: true,
    autoPanOnNodeDrag: true,
    autoPanOnNodeFocus: true,
    autoPanSpeed: 15,

    connectionRadius: 20,
    onError: devWarn,
    isValidConnection: undefined,
    onSelectionChangeHandlers: [],

    /*
     * `lib` is NOT a branding string — the reused `@xyflow/system` core interpolates it into live
     * DOM selectors (`.${lib}-flow__handle` in `isValidHandle`'s drop hit-test + click-connect
     * lookup, and `${lib}-flow__node`/`${lib}-flow__edge` in `XYPanZoom`'s pan filter). ng-flow
     * intentionally emits `react-flow__*` class names (so React Flow's stylesheet applies verbatim),
     * so this MUST be `'react'` to match those classes — otherwise drag-to-connect never records a
     * connection on drop and the pan filter can't detect node/edge targets.
     */
    lib: 'react',
    debug: false,
    ariaLabelConfig: defaultAriaLabelConfig,
    zIndexMode,

    onNodesChangeMiddlewareMap: new Map(),
    onEdgesChangeMiddlewareMap: new Map(),
  };
}
