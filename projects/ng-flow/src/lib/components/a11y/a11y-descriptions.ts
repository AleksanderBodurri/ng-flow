import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { FlowStore } from '../../store/flow-store';
import type { CSSProperties, ReactFlowState } from '../../types';
import { ARIA_EDGE_DESC_KEY, ARIA_LIVE_MESSAGE, ARIA_NODE_DESC_KEY } from './a11y.constants';

const hiddenStyle: CSSProperties = { display: 'none' };
const ariaLiveStyle: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  border: 0,
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0px, 0px, 0px, 0px)',
  clipPath: 'inset(100%)',
};

const ariaLiveSelector = (s: ReactFlowState) => s.ariaLiveMessage;
const ariaLabelConfigSelector = (s: ReactFlowState) => s.ariaLabelConfig;

/**
 * Renders the hidden ARIA description elements (node-desc, edge-desc) and the
 * visually-hidden aria-live region used for keyboard interaction announcements.
 *
 * The Angular port of React Flow's internal `<A11yDescriptions />`.
 */
@Component({
  selector: 'ng-flow-a11y-descriptions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [id]="nodeDescId()" [style]="hiddenStyle">
      {{
        disableKeyboardA11y()
          ? ariaLabelConfig()['node.a11yDescription.default']
          : ariaLabelConfig()['node.a11yDescription.keyboardDisabled']
      }}
    </div>
    <div [id]="edgeDescId()" [style]="hiddenStyle">
      {{ ariaLabelConfig()['edge.a11yDescription.default'] }}
    </div>
    @if (!disableKeyboardA11y()) {
      <div [id]="ariaLiveId()" aria-live="assertive" aria-atomic="true" [style]="ariaLiveStyle">
        {{ ariaLiveMessage() }}
      </div>
    }
  `,
})
export class A11yDescriptions {
  private readonly store = inject(FlowStore);

  readonly rfId = input.required<string>();
  readonly disableKeyboardA11y = input<boolean>(false);

  protected readonly hiddenStyle = hiddenStyle;
  protected readonly ariaLiveStyle = ariaLiveStyle;

  protected readonly ariaLabelConfig = this.store.select(ariaLabelConfigSelector);
  protected readonly ariaLiveMessage = this.store.select(ariaLiveSelector);

  protected readonly nodeDescId = computed(() => `${ARIA_NODE_DESC_KEY}-${this.rfId()}`);
  protected readonly edgeDescId = computed(() => `${ARIA_EDGE_DESC_KEY}-${this.rfId()}`);
  protected readonly ariaLiveId = computed(() => `${ARIA_LIVE_MESSAGE}-${this.rfId()}`);
}
