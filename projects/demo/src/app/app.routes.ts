import { Routes } from '@angular/router';

/**
 * A single source of truth for the demo. The sidebar nav and the router config are
 * both derived from this array. Each slug mirrors the corresponding React Flow
 * example for easy side-by-side parity review.
 */
export interface DemoRoute {
  path: string;
  title: string;
  loadComponent: () => Promise<unknown>;
}

export const DEMO_ROUTES: DemoRoute[] = [
  { path: 'a11y', title: 'a11y', loadComponent: () => import('./pages/a11y/a11y.page').then((m) => m.A11yPage) },
  { path: 'add-node-edge-drop', title: 'add node on edge drop', loadComponent: () => import('./pages/add-node-edge-drop/add-node-edge-drop.page').then((m) => m.AddNodeOnEdgeDropPage) },
  { path: 'backgrounds', title: 'backgrounds', loadComponent: () => import('./pages/backgrounds/backgrounds.page').then((m) => m.BackgroundsPage) },
  { path: 'basic', title: 'basic', loadComponent: () => import('./pages/basic/basic.page').then((m) => m.BasicPage) },
  { path: 'broken-nodes', title: 'broken nodes', loadComponent: () => import('./pages/broken-nodes/broken-nodes.page').then((m) => m.BrokenNodesPage) },
  { path: 'cancel-connection', title: 'cancel connection', loadComponent: () => import('./pages/cancel-connection/cancel-connection.page').then((m) => m.CancelConnectionPage) },
  { path: 'click-distance', title: 'click distance', loadComponent: () => import('./pages/click-distance/click-distance.page').then((m) => m.ClickDistancePage) },
  { path: 'color-mode', title: 'color mode', loadComponent: () => import('./pages/color-mode/color-mode.page').then((m) => m.ColorModePage) },
  { path: 'controlled-uncontrolled', title: 'controlled / uncontrolled', loadComponent: () => import('./pages/controlled-uncontrolled/controlled-uncontrolled.page').then((m) => m.ControlledUncontrolledPage) },
  { path: 'controlled-viewport', title: 'controlled viewport', loadComponent: () => import('./pages/controlled-viewport/controlled-viewport.page').then((m) => m.ControlledViewportPage) },
  { path: 'custom-connectionline', title: 'custom connection line', loadComponent: () => import('./pages/custom-connectionline/custom-connectionline.page').then((m) => m.CustomConnectionLinePage) },
  { path: 'custom-minimap-node', title: 'custom minimap node', loadComponent: () => import('./pages/custom-minimap-node/custom-minimap-node.page').then((m) => m.CustomMiniMapNodePage) },
  { path: 'custom-node', title: 'custom node', loadComponent: () => import('./pages/custom-node/custom-node.page').then((m) => m.CustomNodePage) },
  { path: 'default-edge-overwrite', title: 'default edge overwrite', loadComponent: () => import('./pages/default-edge-overwrite/default-edge-overwrite.page').then((m) => m.DefaultEdgeOverwritePage) },
  { path: 'default-node-overwrite', title: 'default node overwrite', loadComponent: () => import('./pages/default-node-overwrite/default-node-overwrite.page').then((m) => m.DefaultNodeOverwritePage) },
  { path: 'default-nodes', title: 'default nodes', loadComponent: () => import('./pages/default-nodes/default-nodes.page').then((m) => m.DefaultNodesPage) },
  { path: 'detached-handle', title: 'detached handle', loadComponent: () => import('./pages/detached-handle/detached-handle.page').then((m) => m.DetachedHandlePage) },
  { path: 'devtools', title: 'devtools', loadComponent: () => import('./pages/devtools/devtools.page').then((m) => m.DevtoolsPage) },
  { path: 'draghandle', title: 'drag handle', loadComponent: () => import('./pages/draghandle/draghandle.page').then((m) => m.DraghandlePage) },
  { path: 'dragndrop', title: 'drag and drop', loadComponent: () => import('./pages/dragndrop/dragndrop.page').then((m) => m.DragNDropPage) },
  { path: 'easy-connect', title: 'easy connect', loadComponent: () => import('./pages/easy-connect/easy-connect.page').then((m) => m.EasyConnectPage) },
  { path: 'edge-renderer', title: 'edge renderer', loadComponent: () => import('./pages/edge-renderer/edge-renderer.page').then((m) => m.EdgeRendererPage) },
  { path: 'edge-routing', title: 'edge routing', loadComponent: () => import('./pages/edge-routing/edge-routing.page').then((m) => m.EdgeRoutingPage) },
  { path: 'edge-toolbar', title: 'edge toolbar', loadComponent: () => import('./pages/edge-toolbar/edge-toolbar.page').then((m) => m.EdgeToolbarPage) },
  { path: 'edge-types', title: 'edge types', loadComponent: () => import('./pages/edge-types/edge-types.page').then((m) => m.EdgeTypesPage) },
  { path: 'edges', title: 'edges', loadComponent: () => import('./pages/edges/edges.page').then((m) => m.EdgesPage) },
  { path: 'empty', title: 'empty', loadComponent: () => import('./pages/empty/empty.page').then((m) => m.EmptyPage) },
  { path: 'figma', title: 'figma', loadComponent: () => import('./pages/figma/figma.page').then((m) => m.FigmaPage) },
  { path: 'floating-edges', title: 'floating edges', loadComponent: () => import('./pages/floating-edges/floating-edges.page').then((m) => m.FloatingEdgesPage) },
  { path: 'hidden', title: 'hidden', loadComponent: () => import('./pages/hidden/hidden.page').then((m) => m.HiddenPage) },
  { path: 'interaction', title: 'interaction', loadComponent: () => import('./pages/interaction/interaction.page').then((m) => m.InteractionPage) },
  { path: 'interactive-minimap', title: 'interactive minimap', loadComponent: () => import('./pages/interactive-minimap/interactive-minimap.page').then((m) => m.InteractiveMinimapPage) },
  { path: 'intersection', title: 'intersection', loadComponent: () => import('./pages/intersection/intersection.page').then((m) => m.IntersectionPage) },
  { path: 'layouting', title: 'layouting (dagre)', loadComponent: () => import('./pages/layouting/layouting.page').then((m) => m.LayoutingPage) },
  { path: 'middlewares', title: 'middlewares', loadComponent: () => import('./pages/middlewares/middlewares.page').then((m) => m.MiddlewaresPage) },
  { path: 'moving-handles', title: 'moving handles', loadComponent: () => import('./pages/moving-handles/moving-handles.page').then((m) => m.MovingHandlesPage) },
  { path: 'multi-setnodes', title: 'multi setNodes', loadComponent: () => import('./pages/multi-setnodes/multi-setnodes.page').then((m) => m.MultiSetNodesPage) },
  { path: 'multiflows', title: 'multi flows', loadComponent: () => import('./pages/multiflows/multiflows.page').then((m) => m.MultiFlowsPage) },
  { path: 'node-resizer', title: 'node resizer', loadComponent: () => import('./pages/node-resizer/node-resizer.page').then((m) => m.NodeResizerPage) },
  { path: 'node-selection-bug', title: 'node selection bug', loadComponent: () => import('./pages/node-selection-bug/node-selection-bug.page').then((m) => m.NodeSelectionBugPage) },
  { path: 'node-toolbar', title: 'node toolbar', loadComponent: () => import('./pages/node-toolbar/node-toolbar.page').then((m) => m.NodeToolbarPage) },
  { path: 'nodetype-change', title: 'node type change', loadComponent: () => import('./pages/nodetype-change/nodetype-change.page').then((m) => m.NodeTypeChangePage) },
  { path: 'nodetypesobject-change', title: 'nodeTypes object change', loadComponent: () => import('./pages/nodetypesobject-change/nodetypesobject-change.page').then((m) => m.NodeTypesObjectChangePage) },
  { path: 'overview', title: 'overview', loadComponent: () => import('./pages/overview/overview.page').then((m) => m.OverviewPage) },
  { path: 'provider', title: 'provider', loadComponent: () => import('./pages/provider/provider.page').then((m) => m.ProviderPage) },
  { path: 'reconnect-edge', title: 'reconnect edge', loadComponent: () => import('./pages/reconnect-edge/reconnect-edge.page').then((m) => m.ReconnectEdgePage) },
  { path: 'redux', title: 'external store (redux)', loadComponent: () => import('./pages/redux/redux.page').then((m) => m.ReduxPage) },
  { path: 'save-restore', title: 'save / restore', loadComponent: () => import('./pages/save-restore/save-restore.page').then((m) => m.SaveRestorePage) },
  { path: 'setnodes-batching', title: 'setNodes batching', loadComponent: () => import('./pages/setnodes-batching/setnodes-batching.page').then((m) => m.SetNodesBatchingPage) },
  { path: 'stress', title: 'stress', loadComponent: () => import('./pages/stress/stress.page').then((m) => m.StressPage) },
  { path: 'subflow', title: 'subflow', loadComponent: () => import('./pages/subflow/subflow.page').then((m) => m.SubflowPage) },
  { path: 'switch', title: 'switch flow', loadComponent: () => import('./pages/switch/switch.page').then((m) => m.SwitchPage) },
  { path: 'touch-device', title: 'touch device', loadComponent: () => import('./pages/touch-device/touch-device.page').then((m) => m.TouchDevicePage) },
  { path: 'undirectional', title: 'undirectional', loadComponent: () => import('./pages/undirectional/undirectional.page').then((m) => m.UndirectionalPage) },
  { path: 'update-node', title: 'update node', loadComponent: () => import('./pages/update-node/update-node.page').then((m) => m.UpdateNodePage) },
  { path: 'use-connection', title: 'useConnection', loadComponent: () => import('./pages/use-connection/use-connection.page').then((m) => m.UseConnectionPage) },
  { path: 'use-key-press', title: 'useKeyPress', loadComponent: () => import('./pages/use-key-press/use-key-press.page').then((m) => m.UseKeyPressPage) },
  { path: 'use-nodes-initialized', title: 'useNodesInitialized', loadComponent: () => import('./pages/use-nodes-initialized/use-nodes-initialized.page').then((m) => m.UseNodesInitPage) },
  { path: 'use-on-selection-change', title: 'useOnSelectionChange', loadComponent: () => import('./pages/use-on-selection-change/use-on-selection-change.page').then((m) => m.UseOnSelectionChangePage) },
  { path: 'usenodeconnections', title: 'useNodeConnections', loadComponent: () => import('./pages/usenodeconnections/usenodeconnections.page').then((m) => m.UseNodeConnectionsPage) },
  { path: 'usenodesdata', title: 'useNodesData', loadComponent: () => import('./pages/usenodesdata/usenodesdata.page').then((m) => m.UseNodesDataPage) },
  { path: 'usereactflow', title: 'useReactFlow', loadComponent: () => import('./pages/usereactflow/usereactflow.page').then((m) => m.UseReactFlowPage) },
  { path: 'useupdatenodeinternals', title: 'useUpdateNodeInternals', loadComponent: () => import('./pages/useupdatenodeinternals/useupdatenodeinternals.page').then((m) => m.UseUpdateNodeInternalsPage) },
  { path: 'validation', title: 'validation', loadComponent: () => import('./pages/validation/validation.page').then((m) => m.ValidationPage) },
  { path: 'z-index-mode', title: 'zIndexMode', loadComponent: () => import('./pages/z-index-mode/z-index-mode.page').then((m) => m.ZIndexModePage) },
];

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'basic' },
  ...DEMO_ROUTES.map((r) => ({
    path: r.path,
    title: `ng-flow — ${r.title}`,
    loadComponent: r.loadComponent as Routes[number]['loadComponent'],
  })),
];
