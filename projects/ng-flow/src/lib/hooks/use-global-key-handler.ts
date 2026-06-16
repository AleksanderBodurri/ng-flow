import { effect, type Signal } from '@angular/core';
import type { KeyCode } from '@xyflow/system';

import { useStoreApi } from './use-store';
import { useKeyPress } from './use-key-press';
import { useReactFlow } from './use-react-flow';
import { Edge, Node } from '../types';

const selected = (item: Node | Edge) => item.selected;

const win = typeof window !== 'undefined' ? window : undefined;

/** Accept either a plain value or a `Signal` of it. */
type ValueOrSignal<T> = T | Signal<T>;

/**
 * Handles global key events: deletes selected elements on the delete key, and toggles
 * multi-selection on the multi-selection key. The ng-flow port of React Flow's
 * `useGlobalKeyHandler`.
 *
 * Built on {@link useKeyPress} + {@link useReactFlow}; two `effect()`s react to the
 * pressed-state signals (matching React's two `useEffect`s keyed on the key-pressed
 * booleans). The key-code params may be plain values or `Signal`s. Cleanup is automatic
 * via `DestroyRef`.
 *
 * Must be called in an injection context inside a flow.
 *
 * @internal
 */
export function useGlobalKeyHandler({
  deleteKeyCode,
  multiSelectionKeyCode,
}: {
  deleteKeyCode: ValueOrSignal<KeyCode | null>;
  multiSelectionKeyCode: ValueOrSignal<KeyCode | null>;
}): void {
  const store = useStoreApi();
  const { deleteElements } = useReactFlow();

  const deleteKeyPressed = useKeyPress(deleteKeyCode, { actInsideInputWithModifier: false });
  const multiSelectionKeyPressed = useKeyPress(multiSelectionKeyCode, { target: win });

  effect(() => {
    if (deleteKeyPressed()) {
      const { edges, nodes } = store.getState();
      deleteElements({ nodes: nodes.filter(selected), edges: edges.filter(selected) });
      store.setState({ nodesSelectionActive: false });
    }
  });

  effect(() => {
    store.setState({ multiSelectionActive: multiSelectionKeyPressed() });
  });
}
