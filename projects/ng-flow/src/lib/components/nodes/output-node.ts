import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, TemplateRef } from '@angular/core';
import { Position } from '@xyflow/system';

import type { BuiltInNode, NodeProps } from '../../types/nodes';
import { Handle } from '../handle/handle';

/**
 * The built-in output node: a single target {@link Handle} followed by the node label.
 * The Angular port of React Flow's `OutputNode`.
 *
 * `data.label` may be a plain string (interpolated) or a `TemplateRef` (rendered via
 * `ngTemplateOutlet`).
 *
 * @internal
 */
@Component({
  selector: 'ng-flow-output-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Handle, NgTemplateOutlet],
  template: `
    <ng-flow-handle type="target" [position]="targetPosition()" [isConnectable]="isConnectable()" />
    @if (labelTemplate(); as tpl) {
      <ng-container [ngTemplateOutlet]="tpl" />
    } @else {
      {{ data()?.label }}
    }
  `,
})
export class OutputNode {
  readonly data = input<NodeProps<BuiltInNode>['data']>();
  readonly isConnectable = input(true);
  /*
   * Accept an explicit `undefined` from `NodeWrapper` and coalesce, since a bound `undefined` does
   * not re-trigger a signal-input default the way React's `{ targetPosition = Position.Top }` does.
   */
  readonly targetPositionInput = input<Position | undefined>(undefined, { alias: 'targetPosition' });
  protected readonly targetPosition = computed(() => this.targetPositionInput() ?? Position.Top);

  protected readonly labelTemplate = computed(() => {
    const label = this.data()?.label as unknown;
    return label instanceof TemplateRef ? label : null;
  });
}
