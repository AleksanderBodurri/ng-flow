import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { shallow } from 'zustand/shallow';

import { FlowStore } from '../../store/flow-store';
import type { CSSProperties, ReactFlowState } from '../../types';

const selector = (s: ReactFlowState) => ({
  userSelectionActive: s.userSelectionActive,
  userSelectionRect: s.userSelectionRect,
});

/**
 * The box drawn while the user is selecting nodes/edges with a drag gesture.
 *
 * The Angular port of React Flow's internal `<UserSelection />`. Renders the
 * selection box only while a selection is active and a rect exists; otherwise
 * nothing.
 */
@Component({
  selector: 'ng-flow-user-selection',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (rectStyle(); as style) {
      <div class="react-flow__selection react-flow__container" [style]="style"></div>
    }
  `,
})
export class UserSelection {
  private readonly store = inject(FlowStore);

  private readonly selection = this.store.select(selector, shallow);

  /**
   * The positioning style for the selection box, or `null` when no selection is
   * active — in which case the `@if` renders nothing. Mirrors React's
   * `isActive = userSelectionActive && userSelectionRect` guard.
   */
  protected readonly rectStyle = computed<CSSProperties | null>(() => {
    const { userSelectionActive, userSelectionRect } = this.selection();

    if (!userSelectionActive || !userSelectionRect) {
      return null;
    }

    return {
      width: `${userSelectionRect.width}px`,
      height: `${userSelectionRect.height}px`,
      transform: `translate(${userSelectionRect.x}px, ${userSelectionRect.y}px)`,
    };
  });
}
