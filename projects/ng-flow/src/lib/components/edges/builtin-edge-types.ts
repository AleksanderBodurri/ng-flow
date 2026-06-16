import type { Type } from '@angular/core';

import { BezierEdgeInternal } from './bezier-edge';
import { SimpleBezierEdgeInternal } from './simple-bezier-edge';
import { SmoothStepEdgeInternal } from './smoothstep-edge';
import { StepEdgeInternal } from './step-edge';
import { StraightEdgeInternal } from './straight-edge';

/**
 * Maps each built-in edge `type` string to the internal edge component that renders it.
 * The Angular port of React Flow's `builtinEdgeTypes` (EdgeWrapper/utils.ts).
 *
 * Each value is the `*Internal` variant, which forwards `id=undefined` to BaseEdge.
 */
export const builtinEdgeTypes: Record<string, Type<unknown>> = {
  default: BezierEdgeInternal,
  straight: StraightEdgeInternal,
  step: StepEdgeInternal,
  smoothstep: SmoothStepEdgeInternal,
  simplebezier: SimpleBezierEdgeInternal,
};

/**
 * The "no position known yet" edge geometry, spread onto an edge before its handle positions
 * have been measured. The Angular port of React Flow's `nullPosition`.
 */
export const nullPosition = {
  sourceX: null,
  sourceY: null,
  targetX: null,
  targetY: null,
  sourcePosition: null,
  targetPosition: null,
};
