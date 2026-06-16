import { computed, DestroyRef, inject, Injectable, signal, type Signal, type WritableSignal } from '@angular/core';
import type { StoreApi } from 'zustand/vanilla';

import type { Edge, Node, ReactFlowState } from '../types';
import { createFlowStore, type CreateFlowStoreOptions } from './create-store';

/**
 * Per-flow DI service that bridges React Flow's zustand store into Angular signals.
 *
 * It keeps the original (framework-agnostic) zustand vanilla store as the source of
 * truth — so the ported action/selector logic stays byte-identical to React Flow —
 * and mirrors it into a root signal. `select(selector, equalityFn)` is the exact
 * analogue of React's `useStore(selector, equalityFn)`, returning a `Signal<T>`.
 *
 * Provide it at the `<ng-flow>` element injector (one store per flow).
 */
@Injectable()
export class FlowStore<NodeType extends Node = Node, EdgeType extends Edge = Edge> {
  private readonly destroyRef = inject(DestroyRef);

  private store: StoreApi<ReactFlowState<NodeType, EdgeType>> = createFlowStore<NodeType, EdgeType>();
  private readonly _state: WritableSignal<ReactFlowState<NodeType, EdgeType>> = signal(this.store.getState());
  private unsubscribe: () => void;
  private initialized = false;

  constructor() {
    this.unsubscribe = this.store.subscribe((s) => this._state.set(s));
    this.destroyRef.onDestroy(() => this.unsubscribe());
  }

  /**
   * (Re)create the underlying store with explicit initial options (initial nodes,
   * extents, fitView, etc.). Idempotent — only the first call takes effect. Must be
   * called before the flow's child views render (e.g. in the owning component's
   * `ngOnInit`), matching React Flow creating its store with the initial props.
   */
  initialize(options: CreateFlowStoreOptions<NodeType, EdgeType>): void {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    this.unsubscribe();
    this.store = createFlowStore<NodeType, EdgeType>(options);
    this._state.set(this.store.getState());
    this.unsubscribe = this.store.subscribe((s) => this._state.set(s));
  }

  /** Reactive snapshot of the entire store state. */
  readonly state: Signal<ReactFlowState<NodeType, EdgeType>> = this._state.asReadonly();

  /** Imperative state read (analogue of `useStoreApi().getState`). */
  getState = (): ReactFlowState<NodeType, EdgeType> => this.store.getState();

  /** Imperative state write (analogue of `useStoreApi().setState`). */
  setState = (partial: Parameters<StoreApi<ReactFlowState<NodeType, EdgeType>>['setState']>[0]): void =>
    this.store.setState(partial);

  /** Raw store subscription (analogue of `useStoreApi().subscribe`). */
  subscribe = (
    listener: (state: ReactFlowState<NodeType, EdgeType>, prev: ReactFlowState<NodeType, EdgeType>) => void
  ): (() => void) => this.store.subscribe(listener);

  /**
   * The bridge. Returns a `Signal` that mirrors `useStore(selector, equalityFn)`:
   * the selector re-runs on every store change, and `equalityFn` (default `Object.is`,
   * matching zustand) gates whether dependents are notified.
   */
  select<T>(
    selector: (state: ReactFlowState<NodeType, EdgeType>) => T,
    equalityFn: (a: T, b: T) => boolean = Object.is
  ): Signal<T> {
    return computed(() => selector(this._state()), { equal: equalityFn });
  }
}
