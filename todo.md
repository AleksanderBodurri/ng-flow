# React Flow (@xyflow/react) → ng-flow — Feature Checklist

Source: /Users/alexbodurri/Desktop/projects/skills/xyflow/packages/react (v12.11.0)
Reused core (NOT ported, installed from npm): `@xyflow/system@0.0.77` (framework-agnostic: d3 pan/zoom/drag, XYHandle, XYResizer, XYMinimap, edge-path math, lookups, types, utils), `classcat`.
Target: projects/ng-flow/src/lib
Demo: projects/demo (65 routes mirroring xyflow/examples/react)

## Architecture decisions (locked)
- **State store: BRIDGE zustand → signals** (user-chosen). `FlowStore` DI service wraps zustand's vanilla `createStore`; store action logic ported ~verbatim from `store/index.ts`. Exposes `getState()/setState()/subscribe()` + `select(selector, equalityFn?) => Signal<T>` mirroring `useStore(selector, eq)`. Provided per-`<ng-flow>` (element injector); `NgFlowProvider` can hoist it.
- **Custom node/edge/minimap-node/connection-line components** (React `nodeTypes`/`edgeTypes` maps of `ComponentType`) → Angular `Type<>` registries rendered via `NgComponentOutlet`; props passed via `ngComponentOutletInputs`. Built-ins pre-seeded; fallback to `default` + `onError`.
- **Portals** (`createPortal`) → `@angular/cdk/portal` (`DomPortalOutlet`/`TemplatePortal`) targeting `.react-flow__edgelabel-renderer` / `.react-flow__renderer`.
- **Refs/forwardRef/useImperativeHandle** → `viewChild`/`ElementRef` + public methods.
- **Per-node id context** (React `NodeIdContext`) → `NODE_ID` `InjectionToken` provided by `NodeWrapper`; `Handle`/`NodeResizer`/`NodeToolbar` inject it.
- **CSS**: vendor `@xyflow/system/src/styles/*` + `react/src/styles/*` into the lib; keep `.react-flow__*` / `.xy-*` class names verbatim for visual parity.
- **Modern Angular only**: standalone, zoneless, OnPush, signals, `input()/output()/model()/viewChild()`, `@if/@for/@switch`, `inject()`. No NgModules/Zone.js/RxJS-by-default/decorator APIs.

---

## Setup & shared (do first; sequential)
- [x] S1 — Vendor CSS for parity (copy `system/src/styles/{init,base,node-resizer,style}.css` + `react/src/styles/style.css` into `projects/ng-flow/src/styles/`, aggregate into `ng-flow.css`; wire `ng-package.json` assets + demo `styles`)  — src: `xyflow/packages/{system,react}/src/styles/*`
- [x] S2 — Shared types: port `types/*` (Node, InternalNode, Edge, NodeProps, EdgeProps, BaseEdgeProps, all edge/connection-line prop types, NodeTypes/EdgeTypes, OnNodesChange/OnEdgesChange + all handler types, FitView*, OnInit, ReactFlowInstance, GeneralHelpers, ViewportHelperFunctions, ReactFlowJsonObject, DeleteElementsOptions, ReactFlowStore/Actions/State, **ReactFlowProps** (~120 props), NodeWrapperProps, EdgeWrapperProps)  — src: `types/{nodes,edges,general,instance,store,component-props,index}.ts`. Map React types → Angular (CSSProperties→`Record<string,any>|string`, ReactNode→content/TemplateRef, ComponentType→`Type<>`, ReactMouseEvent→native).
- [x] S3 — Utils: `applyNodeChanges`/`applyEdgeChanges` (+ internal `applyChanges`/`applyChange`/`createSelectionChange`/`getSelectionChanges`/`getElementsDiffChanges`/`elementToRemoveChange`), `addEdge`/`reconnectEdge` (wrap system), `isNode`/`isEdge`, `containerStyle`  — src: `utils/{changes,edges,general}.ts`, `styles/utils.ts`
- [x] S4 — Constants/tokens: `NODE_ID` token (+ `useNodeId`/`injectNodeId`), `init-values` (defaultViewport, defaultNodeOrigin), A11y key constants (ARIA_NODE_DESC_KEY, ARIA_EDGE_DESC_KEY, ARIA_LIVE_MESSAGE)  — src: `contexts/NodeIdContext.ts`, `container/ReactFlow/init-values.ts`, `components/A11yDescriptions`
- [x] S5 — `public-api.ts`: all `@xyflow/system` type re-exports (~75) + util re-exports (~13: getBezierPath, getSmoothStepPath, getStraightPath, getViewportForBounds, getNodesBounds, getIncomers, getOutgoers, getConnectedEdges, getBezierEdgeCenter, getEdgeCenter, …)  — src: `index.ts:44-143` (free parity)

## Store / bridge (sequential; everything depends on it)
- [x] ST1 — `FlowStore` service: zustand vanilla `createStore` + `select(sel, eq?)=>Signal` bridge + getState/setState/subscribe; port `initialState.ts` + all actions from `store/index.ts` (setNodes, setEdges, setDefaultNodesAndEdges, updateNodeInternals, updateNodePositions, triggerNode/EdgeChanges, addSelectedNodes/Edges, unselectNodesAndEdges, resetSelectedElements, setMin/MaxZoom, setTranslate/NodeExtent, panBy, setCenter, cancelConnection, updateConnection, reset)  — src: `store/index.ts`, `store/initialState.ts`, `types/store.ts`
- [x] ST2 — `FlowBatchService`: node/edge update queues + microtask flush (port `useQueue`/`BatchProvider` handlers; reuse `getElementsDiffChanges`; fitViewQueued rAF fallback; middleware maps)  — src: `components/BatchProvider/{index,useQueue,types}.ts`
- [x] ST3 — Provider/Wrapper: `NgFlowProvider` (provide+init FlowStore) + reuse-or-create logic (`@Optional/@SkipSelf`)  — src: `components/ReactFlowProvider`, `container/ReactFlow/Wrapper.tsx`

## Services (from hooks; depend on store) — many parallelizable
- [x] H1 — Read fns→signals: `useNodes`, `useEdges`, `useViewport`, `useInternalNode`, `useConnection`, `useNodesData`, `useNodesInitialized`, `useStore`/`useStoreApi` (the bridge), `useVisibleNodeIds`, `useVisibleEdgeIds`  — src: `hooks/{useNodes,useEdges,useViewport,useInternalNode,useConnection,useNodesData,useNodesInitialized,useStore,useVisibleNodeIds,useVisibleEdgeIds}.ts`
- [x] H2 — `useNodeConnections` + `useHandleConnections`(deprecated) (connect/disconnect diff callbacks)  — src: `hooks/{useNodeConnections,useHandleConnections}.ts`  — demo: usenodeconnections
- [x] H3 — `useNodesState`/`useEdgesState` (signal-backed local state + change appliers)  — src: `hooks/useNodesEdgesState.ts`
- [x] H4 — `useViewportHelper` service (zoomIn/Out/To, get/setViewport, setCenter, fitBounds, screenToFlowPosition, flowToScreenPosition)  — src: `hooks/useViewportHelper.ts`
- [x] H5 — `useReactFlow` service (full ReactFlowInstance: get/set/add nodes&edges, update*, toObject, deleteElements, getIntersectingNodes, isNodeIntersecting, getNodesBounds, getNode/EdgeConnections, fitView, viewportInitialized + viewport helpers + batch)  — src: `hooks/useReactFlow.ts`  — demo: usereactflow
- [x] H6 — `useKeyPress` service→Signal (combos `Meta+s`, arrays, input-field suppression)  — src: `hooks/useKeyPress.ts`  — demo: use-key-press
- [x] H7 — `useDrag` service (XYDrag wrapper; dragging signal)  — src: `hooks/useDrag.ts`
- [x] H8 — `useResizeHandler` (ResizeObserver+window resize → store width/height)  — src: `hooks/useResizeHandler.ts`
- [x] H9 — `useColorModeClass` (matchMedia system mode → Signal)  — src: `hooks/useColorModeClass.ts`  — demo: color-mode
- [x] H10 — `useMoveSelectedNodes` + `useGlobalKeyHandler` (arrow-move + delete/multiselect keys)  — src: `hooks/{useMoveSelectedNodes,useGlobalKeyHandler}.ts`
- [x] H11 — `useOnInitHandler`, `useViewportSync` (controlled viewport)  — src: `hooks/{useOnInitHandler,useViewportSync}.ts`  — demo: controlled-viewport
- [x] H12 — `useOnViewportChange`, `useOnSelectionChange` (register store handlers)  — src: `hooks/{useOnViewportChange,useOnSelectionChange}.ts`  — demo: use-on-selection-change
- [x] H13 — `useUpdateNodeInternals`  — src: `hooks/useUpdateNodeInternals.ts`  — demo: useupdatenodeinternals
- [x] H14 — `experimental_useOnNodesChangeMiddleware` / `experimental_useOnEdgesChangeMiddleware`  — src: `hooks/useOn{Nodes,Edges}ChangeMiddleware.ts`  — demo: middlewares

## Edge components (public) — parallelizable leaves
- [x] E1 — `BaseEdge`  — src: `components/Edges/BaseEdge.tsx`
- [x] E2 — `EdgeText`  — src: `components/Edges/EdgeText.tsx`
- [x] E3 — `EdgeAnchor` (internal)  — src: `components/Edges/EdgeAnchor.tsx`
- [x] E4 — `BezierEdge` (+Internal)  — src: `components/Edges/BezierEdge.tsx`
- [x] E5 — `StraightEdge` (+Internal)  — src: `components/Edges/StraightEdge.tsx`
- [x] E6 — `SmoothStepEdge` (+Internal)  — src: `components/Edges/SmoothStepEdge.tsx`
- [x] E7 — `StepEdge` (+Internal, delegates SmoothStep)  — src: `components/Edges/StepEdge.tsx`
- [x] E8 — `SimpleBezierEdge` (+Internal) + `getSimpleBezierPath` util  — src: `components/Edges/SimpleBezierEdge.tsx`
- [x] E9 — builtin edge registry (`builtinEdgeTypes`, nullPosition)  — src: `components/EdgeWrapper/utils.ts`

## Simple components (public/leaf) — parallelizable
- [x] C1 — `Panel` (+PanelProps)  — src: `components/Panel/index.tsx`
- [x] C2 — `Attribution`  — src: `components/Attribution/index.tsx`
- [x] C3 — `A11yDescriptions` (+AriaLiveMessage)  — src: `components/A11yDescriptions/index.tsx`
- [x] C4 — `EdgeLabelRenderer` (CDK portal → .react-flow__edgelabel-renderer)  — src: `components/EdgeLabelRenderer/index.tsx`
- [x] C5 — `ViewportPortal` (CDK portal → .react-flow__viewport-portal)  — src: `components/ViewportPortal/index.tsx`
- [x] C6 — `UserSelection` (rubber-band rect)  — src: `components/UserSelection/index.tsx`
- [x] C7 — `SelectionListener` (selection change fan-out)  — src: `components/SelectionListener/index.tsx`

## Node + Handle + wrappers (depend on store/services/leaves)
- [x] N1 — `Handle` (+HandleProps; XYHandle connect; connecting/valid classes; NODE_ID inject; connectOnClick; onConnect)  — src: `components/Handle/index.tsx`  — demo: validation, detached-handle, easy-connect
- [x] N2 — built-in nodes: `DefaultNode`, `InputNode`, `OutputNode`, `GroupNode` + `builtinNodeTypes`, `getNodeInlineStyleDimensions`, `arrowKeyDiffs`, `handleNodeClick`  — src: `components/Nodes/*`, `components/NodeWrapper/utils.tsx`, `components/Nodes/utils.ts`
- [x] N3 — `NodeWrapper` (resolve user node via NgComponentOutlet; NODE_ID provide; useDrag; useNodeObserver/ResizeObserver; selection; z-index; focus/keyboard a11y; classes/styles; mouse outputs)  — src: `components/NodeWrapper/{index,useNodeObserver,utils}.tsx`
- [x] N4 — node-types registry service (merge builtin+user, default fallback+onError)  — src: derived from NodeWrapper/GraphView warnings

## Edge wrappers + connection line (depend on edges/store)
- [x] EW1 — `EdgeWrapper` (resolve user edge via NgComponentOutlet; getEdgePosition/zIndex; selection; reconnecting state; markers; a11y)  — src: `components/EdgeWrapper/index.tsx`
- [x] EW2 — `EdgeUpdateAnchors` (reconnect via XYHandle)  — src: `components/EdgeWrapper/EdgeUpdateAnchors.tsx`  — demo: reconnect-edge
- [x] EW3 — `ConnectionLine` (+ConnectionLineWrapper; built-in + custom component; path by type)  — src: `components/ConnectionLine/index.tsx`  — demo: custom-connectionline
- [x] EW4 — edge-types registry service  — derived

## Rendering pipeline (containers; depend on all above)
- [x] R1 — `Viewport` (transform wrapper)  — src: `container/Viewport/index.tsx`
- [x] R2 — `NodeRenderer` (.react-flow__nodes; visible ids→NodeWrapper; shared ResizeObserver)  — src: `container/NodeRenderer/{index,useResizeObserver}.ts`
- [x] R3 — `EdgeRenderer` (.react-flow__edges; MarkerDefinitions/Symbols; visible ids→EdgeWrapper)  — src: `container/EdgeRenderer/{index,MarkerDefinitions,MarkerSymbols}.tsx`
- [x] R4 — `NodesSelection` (selected-nodes drag box + arrow move)  — src: `components/NodesSelection/index.tsx`
- [x] R5 — `Pane` (box selection, pane click/context/scroll, auto-pan; capture-phase listeners)  — src: `container/Pane/index.tsx`
- [x] R6 — `ZoomPane` (XYPanZoom mount; transform/paneDragging sync; resize handler)  — src: `container/ZoomPane/index.tsx`
- [x] R7 — `FlowRenderer` (pan/select mode derivation from keys; global key handler)  — src: `container/FlowRenderer/index.tsx`
- [x] R8 — `GraphView` (compose pipeline; onInit; viewport sync; type/style warnings; portal target divs)  — src: `container/GraphView/{index,useNodeOrEdgeTypesWarning,useStylesLoadedWarning}.ts`

## Top-level component
- [x] T1 — `NgFlow` (= `<ReactFlow>`): all ~120 inputs + ~50 outputs (ReactFlowProps), StoreUpdater→effect() prop sync, `.react-flow` wrapper, colorMode class, content projection for children, provide FlowStore (reuse-or-create), render GraphView+SelectionListener+Attribution+A11yDescriptions  — src: `container/ReactFlow/index.tsx`, `components/StoreUpdater/index.tsx`  — demo: basic, overview

## Additional components (public add-ons)
- [x] A1 — `Background` (+BackgroundVariant Dots/Lines/Cross, gap/size/offset/color/lineWidth, layered)  — src: `additional-components/Background/*`  — demo: backgrounds
- [x] A2 — `ControlButton`  — src: `additional-components/Controls/ControlButton.tsx`
- [x] A3 — `Controls` (+5 icons; zoom/fit/interactive; orientation; position; children)  — src: `additional-components/Controls/{Controls,Icons/*}.tsx`
- [x] A4 — `MiniMapNode` (default SVG rect node)  — src: `additional-components/MiniMap/MiniMapNode.tsx`
- [x] A5 — `MiniMap` (+MiniMapNodes; XYMinimap pan/zoom/inversePan; nodeColor/stroke/class fns; nodeComponent via NgComponentOutlet; onClick/onNodeClick; mask)  — src: `additional-components/MiniMap/{MiniMap,MiniMapNodes}.tsx`  — demo: interactive-minimap, custom-minimap-node
- [x] A6 — `NodeResizeControl` (+ResizeControlLine; XYResizer; variants; resizeDirection; autoScale)  — src: `additional-components/NodeResizer/NodeResizeControl.tsx`
- [x] A7 — `NodeResizer` (8 controls; min/max/aspect/visible; callbacks)  — src: `additional-components/NodeResizer/NodeResizer.tsx`  — demo: node-resizer
- [x] A8 — `NodeToolbar` (+Portal → .react-flow__renderer; position/align/offset; nodeId single+array; auto-visibility)  — src: `additional-components/NodeToolbar/*`  — demo: node-toolbar
- [x] A9 — `EdgeToolbar` (portal → edgelabel-renderer; x/y/alignX/alignY; isVisible←selected)  — src: `additional-components/EdgeToolbar/*`  — demo: edge-toolbar

---

## Demo routes (65 — mirror xyflow/examples/react slugs; depend on library) 
Each: standalone page at `projects/demo/src/app/pages/<slug>/`, route+nav via DEMO_ROUTES, MCP-validated (zero console errors, every control exercised). Build after the features they use land.

- [x] D-add-node-edge-drop · [x] D-a11y · [x] D-basic (home) · [x] D-backgrounds · [x] D-broken-nodes · [x] D-color-mode · [x] D-cancel-connection · [x] D-click-distance · [x] D-controlled-uncontrolled · [x] D-controlled-viewport · [x] D-custom-connectionline · [x] D-custom-minimap-node · [x] D-custom-node · [x] D-default-node-overwrite · [x] D-default-edge-overwrite · [x] D-default-nodes · [x] D-detached-handle · [x] D-devtools · [x] D-draghandle · [x] D-dragndrop · [x] D-easy-connect · [x] D-edges · [x] D-edge-renderer · [x] D-edge-types · [x] D-edge-routing · [x] D-edge-toolbar · [x] D-empty · [x] D-figma · [x] D-floating-edges · [x] D-hidden · [x] D-interaction · [x] D-intersection · [x] D-interactive-minimap · [x] D-layouting (dagre) · [x] D-middlewares · [x] D-multi-setnodes · [x] D-moving-handles · [x] D-multiflows · [x] D-nodetype-change · [x] D-nodetypesobject-change · [x] D-node-toolbar · [x] D-node-resizer · [x] D-node-selection-bug · [x] D-overview · [x] D-provider · [x] D-save-restore (localforage) · [x] D-setnodes-batching · [x] D-stress · [x] D-subflow · [x] D-switch · [x] D-touch-device · [x] D-undirectional · [x] D-reconnect-edge · [x] D-update-node · [x] D-use-connection · [x] D-use-nodes-initialized · [x] D-use-on-selection-change · [x] D-usereactflow · [x] D-usenodeconnections · [x] D-usenodesdata · [x] D-useupdatenodeinternals · [x] D-redux (external store) · [x] D-validation · [x] D-use-key-press · [x] D-z-index-mode · [x] D-node-selection-bug

## Build & verify (Phase 3.3 + Phase 4)
- [x] V1 — `ng build ng-flow` zero errors/warnings
- [x] V2 — `ng build demo` zero errors/warnings
- [x] V3 — Full Chrome DevTools MCP sweep: every demo route, zero console errors, every control exercised, outputs observed
- [x] V4 — public-api diff vs React index.ts (every public symbol exported)
- [x] V5 — README contributors (git shortlog) + finalize
- [x] V6 — parity-review.md: side-by-side vs React demo, every box checked
