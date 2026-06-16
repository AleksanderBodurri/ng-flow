import type { CSSProperties } from '../types';

/** Shared full-bleed absolute-positioned layer style (renderer, pane, nodes container). */
export const containerStyle: CSSProperties = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
};
