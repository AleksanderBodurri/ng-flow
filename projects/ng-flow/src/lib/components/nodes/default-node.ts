import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, TemplateRef } from '@angular/core';
import { Position } from '@xyflow/system';

import type { BuiltInNode, NodeProps } from '../../types/nodes';
import { Handle } from '../handle/handle';

/**
 * The default built-in node: a target {@link Handle} on top, the node label, and a source
 * {@link Handle} on the bottom. The Angular port of React Flow's `DefaultNode`.
 *
 * `data.label` may be a plain string (interpolated) or a `TemplateRef` (rendered via
 * `ngTemplateOutlet`), mirroring how edge labels work in ng-flow.
 *
 * @internal
 */
@Component({
  selector: 'ng-flow-default-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Handle, NgTemplateOutlet],
  template: `
    <ng-flow-handle type="target" [position]="targetPosition()" [isConnectable]="isConnectable()" />
    @if (labelTemplate(); as tpl) {
      <ng-container [ngTemplateOutlet]="tpl" />
    } @else {
      {{ data()?.label }}
    }
    <ng-flow-handle type="source" [position]="sourcePosition()" [isConnectable]="isConnectable()" />
  `,
})
export class DefaultNode {
  readonly data = input<NodeProps<BuiltInNode>['data']>();
  readonly isConnectable = input(true);
  /*
   * `NodeWrapper` passes `node.sourcePosition`/`node.targetPosition` through `ngComponentOutletInputs`,
   * so when a node omits them an explicit `undefined` is bound — which (unlike React's destructuring
   * default) overrides a signal-input default. Accept `undefined` and coalesce in a computed so the
   * Handle always receives a valid Position (mirrors React's `{ targetPosition = Position.Top }`).
   */
  readonly targetPositionInput = input<Position | undefined>(undefined, { alias: 'targetPosition' });
  readonly sourcePositionInput = input<Position | undefined>(undefined, { alias: 'sourcePosition' });
  protected readonly targetPosition = computed(() => this.targetPositionInput() ?? Position.Top);
  protected readonly sourcePosition = computed(() => this.sourcePositionInput() ?? Position.Bottom);

  protected readonly labelTemplate = computed(() => {
    const label = this.data()?.label as unknown;
    return label instanceof TemplateRef ? label : null;
  });
}
