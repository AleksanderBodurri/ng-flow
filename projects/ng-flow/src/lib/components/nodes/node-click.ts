import { errorMessages } from '@xyflow/system';

import type { FlowStore } from '../../store/flow-store';

/**
 * Selects/unselects a node. The Angular port of React Flow's `components/Nodes/utils#handleNodeClick`.
 *
 * Called by:
 * 1. the click handler when the node is not draggable or `selectNodesOnDrag = false`, or
 * 2. the drag-start handler (via `useDrag`) when the node is draggable and `selectNodesOnDrag = true`.
 *
 * React received a `RefObject<HTMLDivElement>` to `.blur()` on unselect; here we take the
 * resolved element directly (`nodeEl`) since Angular has no ref objects.
 *
 * @internal
 */
export function handleNodeClick({
  id,
  store,
  unselect = false,
  nodeEl,
}: {
  id: string;
  store: FlowStore;
  unselect?: boolean;
  nodeEl?: HTMLElement | null;
}): void {
  const { addSelectedNodes, unselectNodesAndEdges, multiSelectionActive, nodeLookup, onError } = store.getState();
  const node = nodeLookup.get(id);

  if (!node) {
    onError?.('012', errorMessages['error012'](id));
    return;
  }

  store.setState({ nodesSelectionActive: false });

  if (!node.selected) {
    addSelectedNodes([id]);
  } else if (unselect || (node.selected && multiSelectionActive)) {
    unselectNodesAndEdges({ nodes: [node], edges: [] });

    requestAnimationFrame(() => nodeEl?.blur());
  }
}
