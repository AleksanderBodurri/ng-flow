import { inject, InjectionToken } from '@angular/core';

/**
 * DI token carrying the id of the node a component is rendered inside. The
 * Angular-port equivalent of React Flow's `NodeIdContext`. Provided by `NodeWrapper`
 * at each node's element injector so descendants (e.g. `Handle`, `NodeResizer`,
 * `NodeToolbar`) can resolve their owning node id.
 */
export const NODE_ID = new InjectionToken<string | null>('NgFlowNodeId');

/**
 * Get the id of the node the current component is used inside, or `null` when not
 * inside a node. Must be called in an injection context (e.g. a field initializer
 * or constructor).
 *
 * @public
 */
export function useNodeId(): string | null {
  return inject(NODE_ID, { optional: true }) ?? null;
}

/** Alias for {@link useNodeId} that reads more naturally in Angular code. */
export const injectNodeId = useNodeId;
