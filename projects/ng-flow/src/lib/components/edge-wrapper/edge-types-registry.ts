import type { Type } from '@angular/core';
import { errorMessages, type OnError } from '@xyflow/system';

import { builtinEdgeTypes } from '../edges/builtin-edge-types';
import type { EdgeTypes } from '../../types';

/**
 * Resolves an edge `type` string to the component that renders it. The Angular port of the
 * inline resolution React Flow performs at the top of `EdgeWrapper` (components/EdgeWrapper/index.tsx).
 *
 * User-supplied `edgeTypes` take precedence over the {@link builtinEdgeTypes}. When the requested
 * type is unknown, `onError('011', …)` is reported (matching React) and the resolution falls back
 * to the `'default'` type.
 *
 * @returns A tuple `[resolvedTypeName, EdgeComponent]`. `resolvedTypeName` is the type actually
 *   used for rendering (collapsed to `'default'` on the error/fallback path), which the wrapper
 *   uses to build the `react-flow__edge-<type>` class — exactly as React does.
 */
export function resolveEdgeComponent(
  edgeType: string | undefined,
  edgeTypes: EdgeTypes | undefined,
  onError?: OnError
): [string, Type<unknown>] {
  let type = edgeType || 'default';
  let edgeComponent = edgeTypes?.[type] ?? builtinEdgeTypes[type];

  if (edgeComponent === undefined) {
    onError?.('011', errorMessages['error011'](type));
    type = 'default';
    edgeComponent = edgeTypes?.['default'] ?? builtinEdgeTypes['default'];
  }

  return [type, edgeComponent];
}
