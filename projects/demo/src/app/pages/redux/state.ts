import { Injectable, signal } from '@angular/core';
import {
  applyEdgeChanges,
  applyNodeChanges,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type OnSelectionChangeParams,
} from 'ng-flow';

import { nodes as initialNodes, edges as initialEdges } from './initial-elements';

/**
 * A signal-based external state container that stands in for the React example's Redux store
 * (`state.ts` used `@reduxjs/toolkit`'s `createSlice` + `configureStore`). Rather than pulling
 * in a Redux/NgRx dependency, this `@Injectable` holds `nodes`/`edges`/`selected*` as signals and
 * exposes change-applying methods that map 1:1 to the original reducers.
 *
 * The flow stays fully *controlled* by this store: `onNodesChange`/`onEdgesChange` run the
 * official `applyNodeChanges`/`applyEdgeChanges` reducers and write the result back, and
 * `setSelectedNodesAndEdges` records the current selection — demonstrating ng-flow driven by an
 * external state container (drag/connect/select all reflect into these signals).
 */
@Injectable()
export class FlowStateService {
  /** Current nodes — bound to `<ng-flow [nodes]>`. */
  readonly nodes = signal<Node[]>(initialNodes);
  /** Current edges — bound to `<ng-flow [edges]>`. */
  readonly edges = signal<Edge[]>(initialEdges);
  /** Mirrors the Redux slice's `selectedNodes`. */
  readonly selectedNodes = signal<Node[]>([]);
  /** Mirrors the Redux slice's `selectedEdges`. */
  readonly selectedEdges = signal<Edge[]>([]);

  /** Reducer: `setNodes`. */
  setNodes(nodes: Node[]): void {
    this.nodes.set(nodes);
  }

  /** Reducer: `setEdges`. */
  setEdges(edges: Edge[]): void {
    this.edges.set(edges);
  }

  /** Reducer: `onNodesChange` — applies node changes via the official reducer. */
  onNodesChange(changes: NodeChange[]): void {
    this.nodes.update((current) => applyNodeChanges(changes, current));
  }

  /** Reducer: `onEdgesChange` — applies edge changes via the official reducer. */
  onEdgesChange(changes: EdgeChange[]): void {
    this.edges.update((current) => applyEdgeChanges(changes, current));
  }

  /** Reducer: `setSelectedNodesAndEdges`. */
  setSelectedNodesAndEdges(params: OnSelectionChangeParams): void {
    this.selectedNodes.set(params.nodes);
    this.selectedEdges.set(params.edges);
  }

  /** Reducer: `setSelectedNodes`. */
  setSelectedNodes(nodes: Node[]): void {
    this.selectedNodes.set(nodes);
  }
}
