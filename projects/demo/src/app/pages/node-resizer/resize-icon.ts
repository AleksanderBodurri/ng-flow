import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * React `NodeResizer/ResizeIcon`: the small custom SVG glyph rendered inside the
 * `CustomResizer` node's resize control (bottom-right corner).
 */
@Component({
  selector: 'app-node-resizer-resize-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg:svg
      xmlns="http://www.w3.org/2000/svg"
      width="8"
      height="8"
      viewBox="0 0 24 24"
      stroke-width="2"
      stroke="currentColor"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      style="position: absolute; right: 2px; bottom: 2px"
    >
      <svg:path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <svg:polyline points="16 20 20 20 20 16" />
      <svg:line x1="14" y1="14" x2="20" y2="20" />
      <svg:polyline points="8 4 4 4 4 8" />
      <svg:line x1="4" y1="4" x2="10" y2="10" />
    </svg:svg>
  `,
})
export class NodeResizerResizeIcon {}
