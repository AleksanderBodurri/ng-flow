import type { HandleConnection, HandleType, NodeConnection, Rect, Viewport } from '@xyflow/system';

import type { Edge, FitView, InternalNode, Node, ViewportHelperFunctions } from '.';

export type ReactFlowJsonObject<NodeType extends Node = Node, EdgeType extends Edge = Edge> = {
  nodes: NodeType[];
  edges: EdgeType[];
  viewport: Viewport;
};

export type DeleteElementsOptions = {
  nodes?: (Node | { id: Node['id'] })[];
  edges?: (Edge | { id: Edge['id'] })[];
};

/** @inline */
export type GeneralHelpers<NodeType extends Node = Node, EdgeType extends Edge = Edge> = {
  /** Returns nodes. */
  getNodes: () => NodeType[];
  /** Overwrite or update the nodes array (triggers `onNodesChange` in a controlled flow). */
  setNodes: (payload: NodeType[] | ((nodes: NodeType[]) => NodeType[])) => void;
  /** Add one or many nodes. */
  addNodes: (payload: NodeType[] | NodeType) => void;
  /** Returns a node by id. */
  getNode: (id: string) => NodeType | undefined;
  /** Returns an internal node by id. */
  getInternalNode: (id: string) => InternalNode<NodeType> | undefined;
  /** Returns edges. */
  getEdges: () => EdgeType[];
  /** Overwrite or update the edges array (triggers `onEdgesChange` in a controlled flow). */
  setEdges: (payload: EdgeType[] | ((edges: EdgeType[]) => EdgeType[])) => void;
  /** Add one or many edges. */
  addEdges: (payload: EdgeType[] | EdgeType) => void;
  /** Returns an edge by id. */
  getEdge: (id: string) => EdgeType | undefined;
  /** Returns the nodes, edges and the viewport as a JSON object. */
  toObject: () => ReactFlowJsonObject<NodeType, EdgeType>;
  /** Deletes nodes and edges. */
  deleteElements: (params: DeleteElementsOptions) => Promise<{
    deletedNodes: Node[];
    deletedEdges: Edge[];
  }>;
  /** Find all nodes intersecting with a given node or rectangle. */
  getIntersectingNodes: (
    node: NodeType | { id: Node['id'] } | Rect,
    partially?: boolean,
    nodes?: NodeType[]
  ) => NodeType[];
  /** Determine if a node or rectangle intersects with another rectangle. */
  isNodeIntersecting: (node: NodeType | { id: Node['id'] } | Rect, area: Rect, partially?: boolean) => boolean;
  /** Updates a node. */
  updateNode: (
    id: string,
    nodeUpdate: Partial<NodeType> | ((node: NodeType) => Partial<NodeType>),
    options?: { replace: boolean }
  ) => void;
  /** Updates the `data` of a node. */
  updateNodeData: (
    id: string,
    dataUpdate: Partial<NodeType['data']> | ((node: NodeType) => Partial<NodeType['data']>),
    options?: { replace: boolean }
  ) => void;
  /** Updates an edge. */
  updateEdge: (
    id: string,
    edgeUpdate: Partial<EdgeType> | ((edge: EdgeType) => Partial<EdgeType>),
    options?: { replace: boolean }
  ) => void;
  /** Updates the `data` of an edge. */
  updateEdgeData: (
    id: string,
    dataUpdate: Partial<EdgeType['data']> | ((edge: EdgeType) => Partial<EdgeType['data']>),
    options?: { replace: boolean }
  ) => void;
  /** Returns the bounds of the given nodes or node ids. */
  getNodesBounds: (nodes: (NodeType | InternalNode | string)[]) => Rect;
  /** @deprecated Get all connections of a handle. */
  getHandleConnections: (params: { type: HandleType; nodeId: string; id?: string | null }) => HandleConnection[];
  /** Get all connections to a node, optionally filtered by handle type/id. */
  getNodeConnections: (params: {
    type?: HandleType;
    nodeId: string;
    handleId?: string | null;
  }) => NodeConnection[];
  /** Fit the view to the nodes. */
  fitView: FitView<NodeType>;
};

/**
 * The `ReactFlowInstance` provides methods to query and manipulate the internal flow state.
 * Obtain it via {@link injectFlow} / `useReactFlow` or the `onInit` event.
 * @public
 */
export type ReactFlowInstance<NodeType extends Node = Node, EdgeType extends Edge = Edge> = GeneralHelpers<
  NodeType,
  EdgeType
> &
  ViewportHelperFunctions & {
    /** Whether the viewport has mounted and initialized its zoom/pan behavior. */
    viewportInitialized: boolean;
  };
