import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Handle, Position, useNodeId } from 'ng-flow';

@Component({
  selector: 'app-undirectional-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Handle],
  template: `
    <div style="padding: 10px 15px; border: 1px solid #ddd;">
      <div>node {{ id() ?? nodeId }}</div>
      <ng-flow-handle type="source" id="left" [position]="Position.Left" />
      <ng-flow-handle type="source" id="right" [position]="Position.Right" />
      <ng-flow-handle type="source" id="top" [position]="Position.Top" />
      <ng-flow-handle type="source" id="bottom" [position]="Position.Bottom" />
    </div>
  `,
})
export class UndirectionalNode {
  readonly id = input<string>();
  protected readonly Position = Position;
  protected readonly nodeId = useNodeId();
}
