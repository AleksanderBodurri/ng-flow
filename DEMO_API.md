# ng-flow demo authoring — API cheatsheet (for demo pages)

Import everything from the package name: `import { ... } from 'ng-flow';`

## Demo page conventions
- File: `projects/demo/src/app/pages/<slug>/<slug>.page.ts`. One standalone component, `ChangeDetectionStrategy.OnPush`, selector `app-<slug>`, class `<Pascal>Page`.
- Host MUST fill height: `host: { style: 'display:block;height:100%' }` (the flow sizes to 100%).
- Mirror the React example at `/Users/alexbodurri/Desktop/projects/skills/xyflow/examples/react/src/examples/<Folder>/index.tsx` — same nodes/edges/options/interactions/sample data. READ it first.
- Do NOT edit `app.routes.ts`, `app.component.html`, `app.component.ts`, or any other page folder — the orchestrator wires routes. Do NOT run `ng build`.
- Helper components/custom nodes/edges for a page go in the SAME page folder.

## Core component (`<ng-flow>`)
- Selector `ng-flow`. Inputs mirror React Flow props but **event handlers are callback inputs** (named exactly as React): `[onConnect]`, `[onNodesChange]`, `[onEdgesChange]`, `[onNodeClick]`, `[onNodeDrag]`, `[onInit]`, `[onConnectStart]`, `[onConnectEnd]`, `[onSelectionChange]`, `[onReconnect]`, `[onBeforeDelete]`, `[isValidConnection]`, etc.
- Boolean inputs must be bound: `[fitView]="true"` (NOT bare `fitView`). Same for `[snapToGrid]="true"`, `[selectionOnDrag]="true"`, etc.
- Data inputs: `[nodes]`/`[edges]` (controlled) or `[defaultNodes]`/`[defaultEdges]` (uncontrolled). `[nodeTypes]`/`[edgeTypes]` (registries), `[connectionLineComponent]`, `[connectionLineType]`, `[connectionMode]`, `[colorMode]`, `[snapGrid]`, `[minZoom]`/`[maxZoom]`, `[defaultViewport]`, `[viewport]` (+`[onViewportChange]`), `[fitViewOptions]`, `[defaultEdgeOptions]`, `[nodeOrigin]`, `[nodeExtent]`, `[panOnDrag]` (boolean|number[]), `[selectionMode]`, `[deleteKeyCode]`/`[selectionKeyCode]`/`[multiSelectionKeyCode]`/`[panActivationKeyCode]`/`[zoomActivationKeyCode]` (KeyCode = string|string[]|null), `[onlyRenderVisibleElements]`, `[attributionPosition]`, `[zIndexMode]`, `[nodeDragThreshold]`, `[connectionDragThreshold]`, etc.
- Children (Background/Controls/MiniMap/Panel) are projected: place them inside `<ng-flow>...</ng-flow>`.
- enums/types from 'ng-flow': `BackgroundVariant`, `ConnectionLineType`, `ConnectionMode`, `MarkerType`, `Position`, `PanOnScrollMode`, `SelectionMode`, `ResizeControlVariant`, and types `Node`, `Edge`, `NodeProps`, `EdgeProps`, `ReactFlowInstance`, `Connection`, `OnConnect`, `NodeChange`, `EdgeChange`, `Viewport`, etc.

## Add-on components (project inside `<ng-flow>`)
- `<ng-flow-background [variant]="BackgroundVariant.Dots" [gap]="20" [size]="1" [color]="" [bgColor]="" [lineWidth]="1" [offset]="0" [id]="" />`
- `<ng-flow-controls [showZoom]="true" [showFitView]="true" [showInteractive]="true" [orientation]="'vertical'" [position]="'bottom-left'" (onZoomIn)=... />` (outputs: onZoomIn/onZoomOut/onFitView/onInteractiveChange). Add custom buttons via `<ng-flow-control-button>` projected as children.
- `<ng-flow-minimap [pannable]="true" [zoomable]="true" [inversePan]="true" [nodeColor]="fn|str" [nodeStrokeColor]=... [nodeComponent]="CustomMiniMapNodeComp" (onClick)="..($event,pos)" (onNodeClick)="..($event,node)" />`
- `<ng-flow-panel [position]="'top-right'"> ...buttons... </ng-flow-panel>`
- Inside a custom NODE component: `<ng-flow-node-toolbar [isVisible]="" [position]="Position.Top" [align]="'center'" [offset]="10" [nodeId]="">...</ng-flow-node-toolbar>`, `<ng-flow-node-resizer [minWidth]="" [keepAspectRatio]="" [isVisible]="" (onResize)=.. />`, `<ng-flow-node-resize-control [variant]="ResizeControlVariant.Line" [position]="'right'">...</ng-flow-node-resize-control>`.
- Inside a custom EDGE component: `<ng-flow-edge-toolbar [edgeId]="id()" [x]="centerX()" [y]="centerY()" [isVisible]="" [alignX]="'center'" [alignY]="'center'">...</ng-flow-edge-toolbar>`, and `<ng-flow-edge-label-renderer>...</ng-flow-edge-label-renderer>` for HTML labels, `<ng-flow-viewport-portal>` for viewport-space overlays.

## Custom NODE component (HTML)
A standalone component with `input()`s for the NodeProps fields it needs (`data`, `id`, `selected`, `isConnectable`, `sourcePosition`, `targetPosition`, `positionAbsoluteX`, `positionAbsoluteY`, `width`, `height`, `dragging`, etc.) plus `<ng-flow-handle>`s. Register: `nodeTypes = { myType: MyNodeComponent }`. Example:
```ts
@Component({ selector: 'app-color-node', changeDetection: ChangeDetectionStrategy.OnPush, imports: [Handle],
  template: `<ng-flow-handle type="target" [position]="Position.Top" />
             <div>{{ data()?.label }}</div>
             <ng-flow-handle type="source" [position]="Position.Bottom" />` })
export class ColorNode { readonly data = input<any>(); protected readonly Position = Position; readonly isConnectable = input(true); }
```
Inputs are filtered via reflectComponentType, so declare only what you use. To read the node id deeper in the tree use `useNodeId()` (injection context).

## Custom EDGE component (SVG)
Renders SVG; use BaseEdge (`<svg:g ng-flow-base-edge>`). Register in `edgeTypes`. Compute the path with `getBezierPath`/`getStraightPath`/`getSmoothStepPath`/`getSimpleBezierPath`. Example:
```ts
@Component({ selector: 'app-custom-edge', changeDetection: ChangeDetectionStrategy.OnPush, imports: [BaseEdge],
  template: `<svg:g ng-flow-base-edge [path]="path()[0]" [labelX]="path()[1]" [labelY]="path()[2]" [markerEnd]="markerEnd()" />` })
export class CustomEdge {
  readonly sourceX = input(0); readonly sourceY = input(0); readonly targetX = input(0); readonly targetY = input(0);
  readonly sourcePosition = input<Position>(Position.Bottom); readonly targetPosition = input<Position>(Position.Top);
  readonly markerEnd = input<string>();
  protected readonly path = computed(() => getBezierPath({ sourceX: this.sourceX(), sourceY: this.sourceY(), sourcePosition: this.sourcePosition(), targetX: this.targetX(), targetY: this.targetY(), targetPosition: this.targetPosition() }));
}
```
Custom edges receive EdgeProps inputs: `id, source, target, sourceX/Y, targetX/Y, sourcePosition, targetPosition, data, selected, markerEnd, markerStart, sourceHandleId, targetHandleId, style, animated, label, ...`.

## Custom CONNECTION LINE component (SVG)
A component with ConnectionLineComponentProps inputs (`fromX, fromY, toX, toY, fromPosition, toPosition, fromNode, fromHandle, toNode, toHandle, connectionStatus, connectionLineType, connectionLineStyle, pointer`). Render `<svg:path>` etc. Pass via `[connectionLineComponent]="MyConnLineComp"`.

## Hooks (call in an injection context — field initializer/constructor — of a component that is INSIDE `<ng-flow>` or `<ng-flow-provider>`)
- `useReactFlow()` → ReactFlowInstance: `{ getNodes, setNodes, addNodes, getNode, getInternalNode, getEdges, setEdges, addEdges, getEdge, toObject, deleteElements, getIntersectingNodes, isNodeIntersecting, updateNode, updateNodeData, updateEdge, updateEdgeData, getNodesBounds, getNodeConnections, fitView, zoomIn, zoomOut, zoomTo, getZoom, setViewport, getViewport, setCenter, fitBounds, screenToFlowPosition, flowToScreenPosition, viewportInitialized }`. setNodes/setEdges accept value or updater fn.
- `useNodesState(initial)` → `{ nodes: WritableSignal<Node[]>, setNodes, onNodesChange }`; `useEdgesState(initial)` likewise. For a controlled flow: `[nodes]="ns.nodes()" [onNodesChange]="ns.onNodesChange"`.
- Read-only signals: `useNodes()`, `useEdges()`, `useViewport()`, `useConnection()`, `useNodesData(id|ids)`, `useNodeConnections({nodeId, handleType, handleId, onConnect, onDisconnect})`, `useNodesInitialized()`, `useInternalNode(id)`, `useStore(selector, equalityFn?)`, `useStoreApi()`.
- `useKeyPress(keyCode, options?)` → Signal<boolean>. `useUpdateNodeInternals()` → (id|id[])=>void. `useOnSelectionChange({onChange})`, `useOnViewportChange({...})`. `experimental_useOnNodesChangeMiddleware(fn)`.
- IMPORTANT timing: hooks needing the store must be used in a component UNDER the flow. To call `useReactFlow()` at the page level, either (a) wrap `<ng-flow>` + a child component in `<ng-flow-provider>` and call the hook in the CHILD (which is under the provider), or (b) capture the instance via `[onInit]="onInit"` on `<ng-flow>` and store it (simplest for buttons in a Panel).

## Utils
`applyNodeChanges(changes, nodes)`, `applyEdgeChanges`, `addEdge(connOrEdge, edges)`, `reconnectEdge(oldEdge, newConn, edges)`, `getNodesBounds`, `getIncomers/getOutgoers/getConnectedEdges`, `getBezierPath/getStraightPath/getSmoothStepPath/getSimpleBezierPath`, `isNode/isEdge`.

## External libs (install only if the example uses them)
- `layouting` example uses `dagre` (+ `@types/dagre`). `save-restore` uses `localforage`. `redux` uses an external store — port it with a plain signal-based service or `@ngrx/store` (keep it simple: a signal service). Tell the orchestrator if you need a dep installed.

## Styling
Demo-only CSS: use the component's `styles`/`styleUrl` or inline `[style]`. The flow theme is already globally loaded. Keep node/edge `react-flow__*` classes alone.
