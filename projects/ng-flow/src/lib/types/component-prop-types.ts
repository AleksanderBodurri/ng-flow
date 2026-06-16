import type { PanelPosition } from '@xyflow/system';

import type { CSSProperties } from './css';
import type { FitViewOptions } from './general';

/**
 * Props for the {@link Panel} component (the ng-flow port of React Flow's `PanelProps`).
 * In Angular these are individual `input()`s; this type documents the public shape.
 * @public
 */
export type PanelProps = {
  /** @default 'top-left' */
  position?: PanelPosition;
  className?: string;
  style?: CSSProperties;
};

/**
 * Props for the {@link EdgeLabelRenderer} component. Content is projected via `<ng-content>`,
 * so there are no value inputs (the React `children` prop maps to projection).
 * @public
 */
export type EdgeLabelRendererProps = Record<string, never>;

/**
 * Props for the {@link Controls} component (ng-flow port of React Flow's `ControlProps`).
 * @public
 */
export type ControlProps = {
  showZoom?: boolean;
  showFitView?: boolean;
  showInteractive?: boolean;
  fitViewOptions?: FitViewOptions;
  position?: PanelPosition;
  orientation?: 'horizontal' | 'vertical';
  style?: CSSProperties;
  className?: string;
  'aria-label'?: string;
};

/**
 * Props for the {@link ControlButton} component (ng-flow port of React Flow's `ControlButtonProps`).
 * @public
 */
export type ControlButtonProps = {
  className?: string;
  title?: string;
  'aria-label'?: string;
  disabled?: boolean;
};
