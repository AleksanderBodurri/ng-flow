import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { PanelPosition, ProOptions } from '@xyflow/system';

import { Panel } from '../panel/panel';

/**
 * Optionally renders the ng-flow attribution link in a corner `<ng-flow-panel>`.
 *
 * The Angular port of React Flow's internal `<Attribution />`. Hidden by default; set
 * `proOptions.hideAttribution` to `false` to show it.
 *
 * @public
 */
@Component({
  selector: 'ng-flow-attribution',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Panel],
  template: `
    @if (proOptions()?.hideAttribution === false) {
      <ng-flow-panel
        [position]="position()"
        [className]="'react-flow__attribution'"
        data-message="Please only hide this attribution when you are subscribed to React Flow Pro: https://pro.reactflow.dev"
      >
        <a
          href="https://reactflow.dev"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="ng-flow attribution"
        >
          ng-flow
        </a>
      </ng-flow-panel>
    }
  `,
})
export class Attribution {
  readonly proOptions = input<ProOptions>();
  readonly position = input<PanelPosition>('bottom-right');
}
