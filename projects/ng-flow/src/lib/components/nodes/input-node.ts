import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, TemplateRef } from '@angular/core';
import { Position } from '@xyflow/system';

import type { BuiltInNode, NodeProps } from '../../types/nodes';
import { Handle } from '../handle/handle';

/**
 * The built-in input node: the node label followed by a single source {@link Handle}.
 * The Angular port of React Flow's `InputNode`.
 *
 * `data.label` may be a plain string (interpolated) or a `TemplateRef` (rendered via
 * `ngTemplateOutlet`).
 *
 * @internal
 */
@Component({
  selector: 'ng-flow-input-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Handle, NgTemplateOutlet],
  template: `
    @if (labelTemplate(); as tpl) {
      <ng-container [ngTemplateOutlet]="tpl" />
    } @else {
      {{ data()?.label }}
    }
    <ng-flow-handle type="source" [position]="sourcePosition()" [isConnectable]="isConnectable()" />
  `,
})
export class InputNode {
  readonly data = input<NodeProps<BuiltInNode>['data']>();
  readonly isConnectable = input(true);
  /*
   * Accept an explicit `undefined` from `NodeWrapper` and coalesce, since a bound `undefined` does
   * not re-trigger a signal-input default the way React's `{ sourcePosition = Position.Bottom }` does.
   */
  readonly sourcePositionInput = input<Position | undefined>(undefined, { alias: 'sourcePosition' });
  protected readonly sourcePosition = computed(() => this.sourcePositionInput() ?? Position.Bottom);

  protected readonly labelTemplate = computed(() => {
    const label = this.data()?.label as unknown;
    return label instanceof TemplateRef ? label : null;
  });
}
