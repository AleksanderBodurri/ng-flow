import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Handle, Position } from 'ng-flow';

import { watchHandleConnections } from './watch-handle-connections';

/**
 * Mirrors React's SingleHandleNode.tsx: one target handle (left) and one source handle
 * (right), each wrapped by a `useNodeConnections` watcher that logs onConnect/onDisconnect.
 */
@Component({
  selector: 'app-single-handle-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Handle],
  template: `
    <div class="single-handle-node">
      <ng-flow-handle type="target" [position]="Position.Left" />
      <div>node {{ id() }}</div>
      <ng-flow-handle type="source" [position]="Position.Right" />
    </div>
  `,
  styles: [
    `
      .single-handle-node {
        background: #333;
        color: #fff;
        padding: 10px;
        font-size: 12px;
        border-radius: 10px;
      }
    `,
  ],
})
export class SingleHandleNode {
  readonly id = input<string>('');
  protected readonly Position = Position;

  constructor() {
    watchHandleConnections('target');
    watchHandleConnections('source');
  }
}
