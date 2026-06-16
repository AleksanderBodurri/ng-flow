import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Handle, Position } from 'ng-flow';

import { watchHandleConnections } from './watch-handle-connections';

/**
 * Mirrors React's MultiHandleNode.tsx: two target handles (t1, t2 on the left) and two source
 * handles (s1, s2 on the right), offset with `top: 10/20`, each wrapped by a
 * `useNodeConnections` watcher (per handle id) that logs onConnect/onDisconnect.
 */
@Component({
  selector: 'app-multi-handle-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Handle],
  template: `
    <div class="multi-handle-node">
      <ng-flow-handle type="target" [position]="Position.Left" id="t1" [style.top.px]="10" />
      <ng-flow-handle type="target" [position]="Position.Left" id="t2" [style.top.px]="20" />
      <div>node {{ id() }}</div>
      <ng-flow-handle type="source" [position]="Position.Right" id="s1" [style.top.px]="10" />
      <ng-flow-handle type="source" [position]="Position.Right" id="s2" [style.top.px]="20" />
    </div>
  `,
  styles: [
    `
      .multi-handle-node {
        background: #333;
        color: #fff;
        padding: 10px;
        font-size: 12px;
        border-radius: 10px;
      }
    `,
  ],
})
export class MultiHandleNode {
  readonly id = input<string>('');
  protected readonly Position = Position;

  constructor() {
    watchHandleConnections('target', 't1');
    watchHandleConnections('target', 't2');
    watchHandleConnections('source', 's1');
    watchHandleConnections('source', 's2');
  }
}
