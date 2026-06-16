import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Handle, Position } from 'ng-flow';

@Component({
  selector: 'app-detached-handle-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Handle],
  template: `
    <ng-flow-handle type="target" [position]="Position.Left" />
    <div>Custom node</div>
    <ng-flow-handle type="source" [position]="Position.Right">
      <button class="detached-handle">&#x27A1;&#xFE0F;</button>
    </ng-flow-handle>
  `,
})
export class DetachedHandleNode {
  protected readonly Position = Position;
}
