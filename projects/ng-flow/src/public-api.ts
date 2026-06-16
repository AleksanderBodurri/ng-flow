/*
 * Public API Surface of ng-flow
 *
 * An Angular port of React Flow (@xyflow/react). Built on the framework-agnostic
 * @xyflow/system core, which is re-exported below for full API parity.
 */

// ---------------------------------------------------------------------------
// ng-flow types (ported from @xyflow/react types)
// ---------------------------------------------------------------------------
export * from './lib/types';

// ---------------------------------------------------------------------------
// ng-flow utils
// ---------------------------------------------------------------------------
export { applyNodeChanges, applyEdgeChanges } from './lib/utils/changes';
export { isNode, isEdge } from './lib/utils/general';
export { addEdge, reconnectEdge } from './lib/utils/edges';

// per-node id context (React Flow's useNodeId)
export { useNodeId, injectNodeId, NODE_ID } from './lib/contexts/node-id';

// dynamic SVG component rendering (edges / minimap nodes / connection lines)
export { SvgComponentOutlet } from './lib/utils/svg-component-outlet';

// ---------------------------------------------------------------------------
// Store (bridge) + provider
// ---------------------------------------------------------------------------
export { FlowStore } from './lib/store/flow-store';
export { FlowBatchService } from './lib/store/flow-batch';
export { provideFlow } from './lib/store/provide-flow';
export { shallow } from 'zustand/shallow';
export { NgFlowProvider } from './lib/components/provider/ng-flow-provider';

// ---------------------------------------------------------------------------
// Edge components (public)
// ---------------------------------------------------------------------------
export { BaseEdge } from './lib/components/edges/base-edge';
export { EdgeText } from './lib/components/edges/edge-text';
export { StraightEdge } from './lib/components/edges/straight-edge';
export { StepEdge } from './lib/components/edges/step-edge';
export { BezierEdge } from './lib/components/edges/bezier-edge';
export { SmoothStepEdge } from './lib/components/edges/smoothstep-edge';
export { SimpleBezierEdge, getSimpleBezierPath } from './lib/components/edges/simple-bezier-edge';

// ---------------------------------------------------------------------------
// Components (public)
// ---------------------------------------------------------------------------
export { Panel } from './lib/components/panel/panel';
export { EdgeLabelRenderer } from './lib/components/edge-label-renderer/edge-label-renderer';
export { ViewportPortal } from './lib/components/viewport-portal/viewport-portal';

// ---------------------------------------------------------------------------
// Hooks (public)
// ---------------------------------------------------------------------------
export { useStore, useStoreApi, injectStore } from './lib/hooks/use-store';
export { useReactFlow } from './lib/hooks/use-react-flow';
export { useUpdateNodeInternals } from './lib/hooks/use-update-node-internals';
export { useNodes } from './lib/hooks/use-nodes';
export { useEdges } from './lib/hooks/use-edges';
export { useViewport } from './lib/hooks/use-viewport';
export { useKeyPress } from './lib/hooks/use-key-press';
export { useNodesState, useEdgesState } from './lib/hooks/use-nodes-edges-state';
export { useOnViewportChange, type UseOnViewportChangeOptions } from './lib/hooks/use-on-viewport-change';
export { useOnSelectionChange, type UseOnSelectionChangeOptions } from './lib/hooks/use-on-selection-change';
export { useNodesInitialized, type UseNodesInitializedOptions } from './lib/hooks/use-nodes-initialized';
export { useHandleConnections } from './lib/hooks/use-handle-connections';
export { useNodeConnections } from './lib/hooks/use-node-connections';
export { useNodesData } from './lib/hooks/use-nodes-data';
export { useConnection } from './lib/hooks/use-connection';
export { useInternalNode } from './lib/hooks/use-internal-node';
export { experimental_useOnNodesChangeMiddleware } from './lib/hooks/use-on-nodes-change-middleware';
export { experimental_useOnEdgesChangeMiddleware } from './lib/hooks/use-on-edges-change-middleware';

// ---------------------------------------------------------------------------
// Handle (public)
// ---------------------------------------------------------------------------
export { Handle, type HandleProps } from './lib/components/handle/handle';

// ---------------------------------------------------------------------------
// Additional components (public add-ons)
// ---------------------------------------------------------------------------
export { Background, BackgroundVariant, type BackgroundProps } from './lib/additional-components/background/background';
export { Controls } from './lib/additional-components/controls/controls';
export { ControlButton } from './lib/additional-components/controls/control-button';
export {
  MiniMap,
  type MiniMapProps,
  type GetMiniMapNodeAttribute,
} from './lib/additional-components/minimap/minimap';
export { MiniMapNode, type MiniMapNodeProps } from './lib/additional-components/minimap/minimap-node';
export {
  NodeResizer,
  type NodeResizerProps,
} from './lib/additional-components/node-resizer/node-resizer';
export {
  NodeResizeControl,
  type ResizeControlProps,
  type ResizeControlLineProps,
} from './lib/additional-components/node-resizer/node-resize-control';
export { NodeToolbar, type NodeToolbarProps } from './lib/additional-components/node-toolbar/node-toolbar';
export { EdgeToolbar, type EdgeToolbarProps } from './lib/additional-components/edge-toolbar/edge-toolbar';

// ---------------------------------------------------------------------------
// Top-level component
// ---------------------------------------------------------------------------
export { NgFlow } from './lib/container/react-flow/ng-flow';

// ---------------------------------------------------------------------------
// @xyflow/system type re-exports (free parity; mirrors @xyflow/react index.ts)
// ---------------------------------------------------------------------------
export {
  type Align,
  type SmoothStepPathOptions,
  type BezierPathOptions,
  ConnectionLineType,
  type EdgeMarker,
  type EdgeMarkerType,
  MarkerType,
  type OnMove,
  type OnMoveStart,
  type OnMoveEnd,
  type Connection,
  ConnectionMode,
  type OnConnectStartParams,
  type OnConnectStart,
  type OnConnect,
  type OnConnectEnd,
  type Viewport,
  type SnapGrid,
  PanOnScrollMode,
  type ViewportHelperFunctionOptions,
  type SetCenterOptions,
  type FitBoundsOptions,
  type PanelPosition,
  type ProOptions,
  SelectionMode,
  type SelectionRect,
  type OnError,
  type NodeOrigin,
  type OnSelectionDrag,
  Position,
  type XYPosition,
  type XYZPosition,
  type Dimensions,
  type Rect,
  type Box,
  type Transform,
  type CoordinateExtent,
  type ColorMode,
  type ColorModeClass,
  type HandleType,
  type ShouldResize,
  type OnResizeStart,
  type OnResize,
  type OnResizeEnd,
  type ControlPosition,
  type ControlLinePosition,
  ResizeControlVariant,
  type ResizeParams,
  type ResizeParamsWithDirection,
  type ResizeDragEvent,
  type NodeChange,
  type NodeDimensionChange,
  type NodePositionChange,
  type NodeSelectionChange,
  type NodeRemoveChange,
  type NodeAddChange,
  type NodeReplaceChange,
  type EdgeChange,
  type EdgeSelectionChange,
  type EdgeRemoveChange,
  type EdgeAddChange,
  type EdgeReplaceChange,
  type KeyCode,
  type ConnectionState,
  type FinalConnectionState,
  type ConnectionInProgress,
  type NoConnection,
  type NodeConnection,
  type OnReconnect,
  type AriaLabelConfig,
  type SetCenter,
  type SetViewport,
  type FitBounds,
  type HandleConnection,
  type ZIndexMode,
  type NodeHandle,
  type UseNodeConnectionsParams,
} from '@xyflow/system';

// NOTE: React Flow re-exports the system `Handle` *type* under the name `Handle`.
// In Angular `Handle` is the component *class* (a value AND a type), so re-exporting
// the system type as `Handle` would collide. We export the component as `Handle`; the
// system handle descriptor type is available via `NodeHandle` (re-exported above) or a
// direct `@xyflow/system` import.

// ---------------------------------------------------------------------------
// @xyflow/system util re-exports
// ---------------------------------------------------------------------------
export {
  type GetBezierPathParams,
  getBezierEdgeCenter,
  getBezierPath,
  getEdgeCenter,
  type GetSmoothStepPathParams,
  getSmoothStepPath,
  type GetStraightPathParams,
  getStraightPath,
  getViewportForBounds,
  getNodesBounds,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
} from '@xyflow/system';
