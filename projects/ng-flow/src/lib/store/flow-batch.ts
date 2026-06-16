import { inject, Injectable } from '@angular/core';
import type { EdgeChange, NodeChange } from '@xyflow/system';

import type { Edge, Node } from '../types';
import { getElementsDiffChanges } from '../utils/changes';
import { FlowStore } from './flow-store';

export type QueueItem<T> = T[] | ((items: T[]) => T[]);

export type Queue<T> = {
  get: () => QueueItem<T>[];
  reset: () => void;
  push: (item: QueueItem<T>) => void;
};

/**
 * Holds and processes the node/edge update queues that back `setNodes`, `addNodes`,
 * `setEdges` and `addEdges`. The handler logic is ported verbatim from React Flow's
 * `BatchProvider`. React used a BigInt serial + layout effect to defeat automatic
 * batching; in zoneless Angular we coalesce synchronous pushes with a single
 * `queueMicrotask` flush (which runs before the next render), achieving the same
 * "batch all synchronous updates into one flush" behaviour.
 *
 * @internal
 */
@Injectable()
export class FlowBatchService<NodeType extends Node = Node, EdgeType extends Edge = Edge> {
  private readonly store = inject<FlowStore<NodeType, EdgeType>>(FlowStore);

  readonly nodeQueue: Queue<NodeType> = this.createQueue<NodeType>((items) => this.runNodeQueue(items));
  readonly edgeQueue: Queue<EdgeType> = this.createQueue<EdgeType>((items) => this.runEdgeQueue(items));

  private createQueue<T>(runQueue: (items: QueueItem<T>[]) => void): Queue<T> {
    let queue: QueueItem<T>[] = [];
    let scheduled = false;

    const flush = () => {
      scheduled = false;
      const items = queue;
      if (items.length) {
        queue = [];
        runQueue(items);
      }
    };

    return {
      get: () => queue,
      reset: () => {
        queue = [];
      },
      push: (item) => {
        queue.push(item);
        if (!scheduled) {
          scheduled = true;
          queueMicrotask(flush);
        }
      },
    };
  }

  private runNodeQueue(queueItems: QueueItem<NodeType>[]): void {
    const {
      nodes = [],
      setNodes,
      hasDefaultNodes,
      onNodesChange,
      nodeLookup,
      fitViewQueued,
      onNodesChangeMiddlewareMap,
    } = this.store.getState();

    let next = nodes;
    for (const payload of queueItems) {
      next = typeof payload === 'function' ? payload(next) : payload;
    }

    let changes = getElementsDiffChanges({
      items: next,
      lookup: nodeLookup,
    }) as NodeChange<NodeType>[];

    for (const middleware of onNodesChangeMiddlewareMap.values()) {
      changes = middleware(changes);
    }

    if (hasDefaultNodes) {
      setNodes(next);
    }

    // We only want to fire onNodesChange if there are changes to the nodes
    if (changes.length > 0) {
      onNodesChange?.(changes);
    } else if (fitViewQueued) {
      // If there are no changes to the nodes, we still need to call setNodes to
      // trigger a re-render and fitView.
      window.requestAnimationFrame(() => {
        const { fitViewQueued, nodes, setNodes } = this.store.getState();
        if (fitViewQueued) {
          setNodes(nodes);
        }
      });
    }
  }

  private runEdgeQueue(queueItems: QueueItem<EdgeType>[]): void {
    const { edges = [], setEdges, hasDefaultEdges, onEdgesChange, edgeLookup } = this.store.getState();

    let next = edges;
    for (const payload of queueItems) {
      next = typeof payload === 'function' ? payload(next) : payload;
    }

    if (hasDefaultEdges) {
      setEdges(next);
    } else if (onEdgesChange) {
      onEdgesChange(
        getElementsDiffChanges({
          items: next,
          lookup: edgeLookup,
        }) as EdgeChange<EdgeType>[]
      );
    }
  }
}
