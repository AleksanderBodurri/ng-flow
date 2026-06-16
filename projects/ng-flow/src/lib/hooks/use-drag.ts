import { effect, ElementRef, isSignal, signal, type Signal } from '@angular/core';
import { errorMessages, XYDrag, type XYDragInstance } from '@xyflow/system';

import { useStoreApi } from './use-store';
import type { FlowStore } from '../store/flow-store';

type ElementInput = HTMLElement | ElementRef<HTMLElement> | null | undefined;

export type UseDragParams = {
  /** The node's host element (or a `Signal`/`ElementRef` of it). */
  nodeRef: ElementInput | Signal<ElementInput>;
  disabled?: boolean;
  noDragClassName?: string;
  handleSelector?: string;
  nodeId?: string;
  isSelectable?: boolean;
  nodeClickDistance?: number;
};

function resolveEl(input: ElementInput | Signal<ElementInput>): HTMLElement | null {
  const value = isSignal(input) ? input() : input;
  if (!value) {
    return null;
  }
  return value instanceof ElementRef ? value.nativeElement : value;
}

/*
 * Ported from React Flow's `components/Nodes/utils#handleNodeClick`. Inlined here because the
 * node component utilities are out of scope for the hooks port (and not yet present in ng-flow).
 * this handler is called by
 * 1. the click handler when node is not draggable or selectNodesOnDrag = false
 * or
 * 2. the on drag start handler when node is draggable and selectNodesOnDrag = true
 */
function handleNodeClick({
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

/**
 * Wraps the `@xyflow/system` `XYDrag` helper. The ng-flow port of React Flow's `useDrag`.
 *
 * Creates the `XYDrag` instance once, calls `.update(...)` on param changes via an `effect()`
 * (re-resolving the host element each run; `nodeRef` may be a plain element, an `ElementRef`,
 * or a `Signal` of either), and `.destroy()`s on cleanup. Returns a `Signal<boolean>`
 * indicating whether a drag is in progress. Cleanup is automatic via `DestroyRef`.
 *
 * Must be called in an injection context inside a flow.
 *
 * @internal
 */
export function useDrag(params: UseDragParams): Signal<boolean> {
  const store = useStoreApi();
  const dragging = signal<boolean>(false);

  // React's `useRef<XYDragInstance>()` — created once, imperative, so a plain variable.
  const xyDrag: XYDragInstance = XYDrag({
    getStoreItems: () => store.getState(),
    onNodeMouseDown: (id: string) => {
      handleNodeClick({
        id,
        store,
        nodeEl: resolveEl(params.nodeRef),
      });
    },
    onDragStart: () => {
      dragging.set(true);
    },
    onDragStop: () => {
      dragging.set(false);
    },
  });

  effect((onCleanup) => {
    // Resolve the element first; if it isn't rendered yet, bail before reading any node/id-dependent
    // params (which would otherwise read required inputs before they're set).
    const domNode = resolveEl(params.nodeRef);
    if (!domNode) {
      return;
    }

    const { disabled = false, noDragClassName, handleSelector, nodeId, isSelectable, nodeClickDistance } = params;
    if (disabled) {
      return;
    }

    xyDrag.update({
      noDragClassName,
      handleSelector,
      domNode,
      isSelectable,
      nodeId,
      nodeClickDistance,
    });

    onCleanup(() => {
      xyDrag.destroy();
    });
  });

  return dragging.asReadonly();
}
