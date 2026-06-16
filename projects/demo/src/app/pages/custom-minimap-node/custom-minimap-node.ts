import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * React `CustomMiniMapNode/CustomMiniMapNode`: a custom MiniMap node component that draws
 * each node as a yellow SVG circle (radius = half the larger dimension) instead of the
 * default rect. Passed to `<ng-flow-minimap [nodeComponent]>`; receives `MiniMapNodeProps`
 * and is rendered inside the minimap `<svg>`.
 */
@Component({
  selector: 'app-custom-minimap-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<svg:circle [attr.cx]="x()" [attr.cy]="y()" [attr.r]="radius()" fill="#ffcc00" />`,
})
export class CustomMiniMapNode {
  readonly x = input.required<number>();
  readonly y = input.required<number>();
  readonly width = input.required<number>();
  readonly height = input.required<number>();

  protected readonly radius = computed(() => Math.max(this.width(), this.height()) / 2);
}
