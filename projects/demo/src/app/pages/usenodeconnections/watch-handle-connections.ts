import { effect } from '@angular/core';
import { type Connection, type HandleType, useNodeConnections, useNodeId } from 'ng-flow';

/**
 * Mirrors the React `CustomHandle` wrapper used by both SingleHandleNode and MultiHandleNode:
 * for one specific handle it calls `useNodeConnections({ handleType, handleId, onConnect,
 * onDisconnect })` and logs via the callbacks plus an effect.
 *
 * In React this lived in a per-handle component; in Angular the per-handle params are static
 * literals, so we call it directly from a node component's injection context (constructor /
 * field initializer). The owning node id resolves via `useNodeId()` (provided by NodeWrapper),
 * so the node renders plain `<ng-flow-handle>` elements and this watcher supplies the logging.
 *
 * Must be called in an injection context inside a node.
 */
export function watchHandleConnections(handleType: HandleType, handleId?: string): void {
  const nodeId = useNodeId();

  const connections = useNodeConnections({
    handleType,
    handleId,
    onConnect: (conns: Connection[]) => console.log('onConnect handler, node id:', nodeId, conns),
    onDisconnect: (conns: Connection[]) =>
      console.log('onDisconnect handler, node id:', nodeId, conns),
  });

  effect(() => console.log('useEffect, node id:', nodeId, handleType, connections()));
}
