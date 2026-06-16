import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Mirrors the React `CustomNode` in DefaultNodeOverwrite: a bare div, registered as the
 * `default` node type so every node (including the `unregistered` type, which falls back
 * to `default`) renders with it.
 */
@Component({
  selector: 'app-default-node-overwrite-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div>Custom node</div>`,
})
export class CustomNode {}
