import { signal, type WritableSignal } from '@angular/core';

import { applyNodeChanges, applyEdgeChanges } from '../utils/changes';
import type { Node, Edge, OnNodesChange, OnEdgesChange } from '../types';

/** Value-or-updater payload, mirroring React's `Dispatch<SetStateAction<T>>`. */
export type SetState<T> = T | ((prev: T) => T);

/**
 * Object returned by {@link useNodesState}. Mirrors React Flow's
 * `[nodes, setNodes, onNodesChange]` tuple, but as a documented object — a tuple is
 * un-idiomatic in Angular and a named object reads better at the call site.
 */
export type UseNodesState<NodeType extends Node = Node> = {
  /** The current nodes as a `WritableSignal` (read with `nodes()`). */
  nodes: WritableSignal<NodeType[]>;
  /** Update the nodes with a new array or an updater fn (`(prev) => next`). */
  setNodes: (payload: SetState<NodeType[]>) => void;
  /** Apply an array of `NodeChange`s to the nodes (pass to `(onNodesChange)`). */
  onNodesChange: OnNodesChange<NodeType>;
};

/**
 * Object returned by {@link useEdgesState}. See {@link UseNodesState}.
 */
export type UseEdgesState<EdgeType extends Edge = Edge> = {
  /** The current edges as a `WritableSignal` (read with `edges()`). */
  edges: WritableSignal<EdgeType[]>;
  /** Update the edges with a new array or an updater fn (`(prev) => next`). */
  setEdges: (payload: SetState<EdgeType[]>) => void;
  /** Apply an array of `EdgeChange`s to the edges (pass to `(onEdgesChange)`). */
  onEdgesChange: OnEdgesChange<EdgeType>;
};

/**
 * Makes it easy to prototype a controlled flow where you manage node state yourself.
 * The ng-flow port of React Flow's `useNodesState` — instead of a `[value, set, onChange]`
 * tuple it returns an **object** `{ nodes, setNodes, onNodesChange }` where `nodes` is a
 * `WritableSignal`. No store is involved; it is backed by a plain `signal(initialNodes)`.
 *
 * Does not need an injection context (no `inject()` calls).
 *
 * @public
 * @param initialNodes - The initial nodes.
 * @returns `{ nodes, setNodes, onNodesChange }`.
 *
 * @example
 * ```ts
 * readonly nodesState = useNodesState(initialNodes);
 * // template: <ng-flow [nodes]="nodesState.nodes()" (onNodesChange)="nodesState.onNodesChange($event)" />
 * ```
 */
export function useNodesState<NodeType extends Node = Node>(initialNodes: NodeType[]): UseNodesState<NodeType> {
  const nodes = signal<NodeType[]>(initialNodes);

  const setNodes = (payload: SetState<NodeType[]>): void => {
    nodes.update((nds) => (typeof payload === 'function' ? (payload as (prev: NodeType[]) => NodeType[])(nds) : payload));
  };

  const onNodesChange: OnNodesChange<NodeType> = (changes) =>
    nodes.update((nds) => applyNodeChanges(changes, nds));

  return { nodes, setNodes, onNodesChange };
}

/**
 * Makes it easy to prototype a controlled flow where you manage edge state yourself.
 * The ng-flow port of React Flow's `useEdgesState` — returns the **object**
 * `{ edges, setEdges, onEdgesChange }` where `edges` is a `WritableSignal`, backed by a
 * plain `signal(initialEdges)`. See {@link useNodesState}.
 *
 * Does not need an injection context (no `inject()` calls).
 *
 * @public
 * @param initialEdges - The initial edges.
 * @returns `{ edges, setEdges, onEdgesChange }`.
 */
export function useEdgesState<EdgeType extends Edge = Edge>(initialEdges: EdgeType[]): UseEdgesState<EdgeType> {
  const edges = signal<EdgeType[]>(initialEdges);

  const setEdges = (payload: SetState<EdgeType[]>): void => {
    edges.update((eds) => (typeof payload === 'function' ? (payload as (prev: EdgeType[]) => EdgeType[])(eds) : payload));
  };

  const onEdgesChange: OnEdgesChange<EdgeType> = (changes) =>
    edges.update((eds) => applyEdgeChanges(changes, eds));

  return { edges, setEdges, onEdgesChange };
}
