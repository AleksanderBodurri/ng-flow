import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * The built-in group node. Renders nothing of its own — it only provides the node chrome
 * (styling/dimensions) supplied by `NodeWrapper`, acting as a container for child nodes.
 * The Angular port of React Flow's `GroupNode` (which returns `null`).
 *
 * @internal
 */
@Component({
  selector: 'ng-flow-group-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ``,
})
export class GroupNode {}
