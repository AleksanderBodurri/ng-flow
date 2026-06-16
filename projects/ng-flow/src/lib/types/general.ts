import type { Type } from '@angular/core';
import type {
  Connection,
  EdgeChange,
  FitBounds,
  FitViewOptionsBase,
  FitViewParamsBase,
  GetViewport,
  GetZoom,
  NodeChange,
  OnBeforeDeleteBase,
  SetCenter,
  SetViewport,
  SnapGrid,
  XYPosition,
  ZoomInOut,
  ZoomTo,
} from '@xyflow/system';

import type { Edge, Node, ReactFlowInstance } from '.';

/** Type the `onNodesChange` handler with a custom node type. @public */
export type OnNodesChange<NodeType extends Node = Node> = (changes: NodeChange<NodeType>[]) => void;
/** Type the `onEdgesChange` handler with a custom edge type. @public */
export type OnEdgesChange<EdgeType extends Edge = Edge> = (changes: EdgeChange<EdgeType>[]) => void;

export type OnNodesDelete<NodeType extends Node = Node> = (nodes: NodeType[]) => void;
export type OnEdgesDelete<EdgeType extends Edge = Edge> = (edges: EdgeType[]) => void;
export type OnDelete<NodeType extends Node = Node, EdgeType extends Edge = Edge> = (params: {
  nodes: NodeType[];
  edges: EdgeType[];
}) => void;

/**
 * A registry mapping a node `type` string to an Angular component class that renders it.
 * @public
 */
export type NodeTypes = Record<string, Type<unknown>>;

/**
 * A registry mapping an edge `type` string to an Angular component class that renders it.
 * @public
 */
export type EdgeTypes = Record<string, Type<unknown>>;

export type UnselectNodesAndEdgesParams<NodeType extends Node = Node, EdgeType extends Edge = Edge> = {
  nodes?: NodeType[];
  edges?: EdgeType[];
};

export type OnSelectionChangeParams<NodeType extends Node = Node, EdgeType extends Edge = Edge> = {
  nodes: NodeType[];
  edges: EdgeType[];
};

export type OnSelectionChangeFunc<NodeType extends Node = Node, EdgeType extends Edge = Edge> = (
  params: OnSelectionChangeParams<NodeType, EdgeType>
) => void;

/** @inline */
export type FitViewParams<NodeType extends Node = Node> = FitViewParamsBase<NodeType>;
/** @inline */
export type FitViewOptions<NodeType extends Node = Node> = FitViewOptionsBase<NodeType>;
/** @inline */
export type FitView<NodeType extends Node = Node> = (fitViewOptions?: FitViewOptions<NodeType>) => Promise<boolean>;

/** Called when the viewport is initialized; receives the flow instance. @inline */
export type OnInit<NodeType extends Node = Node, EdgeType extends Edge = Edge> = (
  flowInstance: ReactFlowInstance<NodeType, EdgeType>
) => void;

/** @inline */
export type ViewportHelperFunctions = {
  zoomIn: ZoomInOut;
  zoomOut: ZoomInOut;
  zoomTo: ZoomTo;
  getZoom: GetZoom;
  setViewport: SetViewport;
  getViewport: GetViewport;
  setCenter: SetCenter;
  fitBounds: FitBounds;
  /** Translate a screen/client pixel position to a flow position. */
  screenToFlowPosition: (
    clientPosition: XYPosition,
    options?: { snapToGrid?: boolean; snapGrid?: SnapGrid }
  ) => XYPosition;
  /** Translate a position inside the flow's canvas to a screen pixel position. */
  flowToScreenPosition: (flowPosition: XYPosition) => XYPosition;
};

export type OnBeforeDelete<NodeType extends Node = Node, EdgeType extends Edge = Edge> = OnBeforeDeleteBase<
  NodeType,
  EdgeType
>;

/** Validate a new connection; return `false` to reject it. */
export type IsValidConnection<EdgeType extends Edge = Edge> = (edge: EdgeType | Connection) => boolean;
