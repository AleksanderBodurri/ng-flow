import { ChangeDetectionStrategy, Component } from '@angular/core';
import { type Connection, type Edge, Handle, Position } from 'ng-flow';

@Component({
  selector: 'app-drag-handle-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Handle],
  template: `
    <ng-flow-handle type="target" [position]="Position.Left" (connect)="onConnect($event)" />
    <div style="display: flex; align-items: center;">
      Only draggable here &rarr;
      <span
        class="custom-drag-handle"
        style="display: inline-block; width: 25px; height: 25px; background-color: teal; margin-left: 5px; border-radius: 50%;"
      ></span>
    </div>
    <ng-flow-handle type="source" [position]="Position.Right" />
  `,
})
export class DragHandleNode {
  protected readonly Position = Position;

  protected onConnect(params: Connection | Edge): void {
    console.log('handle onConnect', params);
  }
}
