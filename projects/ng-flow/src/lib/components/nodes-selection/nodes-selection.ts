import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  type ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { shallow } from 'zustand/shallow';
import { getInternalNodesBounds, isNumeric } from '@xyflow/system';

import { FlowStore } from '../../store/flow-store';
import { useDrag } from '../../hooks/use-drag';
import { useMoveSelectedNodes } from '../../hooks/use-move-selected-nodes';
import { arrowKeyDiffs } from '../node-wrapper/node-wrapper.utils';
import type { CSSProperties, Node, ReactFlowState } from '../../types';

const selector = (s: ReactFlowState) => {
  const { width, height, x, y } = getInternalNodesBounds(s.nodeLookup, {
    filter: (node) => !!node.selected,
  });

  return {
    width: isNumeric(width) ? width : null,
    height: isNumeric(height) ? height : null,
    userSelectionActive: s.userSelectionActive,
    transformString: `translate(${s.transform[0]}px,${s.transform[1]}px) scale(${s.transform[2]}) translate(${x}px,${y}px)`,
  };
};

/**
 * The bounding box drawn around the currently-selected nodes (the multi-selection chrome that lets you
 * drag the whole selection and move it with the arrow keys). The Angular port of React Flow's
 * `NodesSelection` (components/NodesSelection/index.tsx).
 *
 * Renders nothing unless a selection exists and a box drag isn't in progress
 * (React's `shouldRender = !userSelectionActive && width !== null && height !== null`). When it does
 * render: an outer `.react-flow__nodesselection.react-flow__container` (+ `noPanClassName`) carrying the
 * selection-bounds transform, and an inner `.react-flow__nodesselection-rect` (`tabindex=-1`) sized to the
 * bounds. {@link useDrag} drags the whole selection (disabled while not rendered); {@link useMoveSelectedNodes}
 * handles arrow-key nudging. On first render the rect is focused (unless `disableKeyboardA11y`).
 * `onSelectionContextMenu` is emitted with the live selected nodes.
 *
 * The host `<ng-flow-nodes-selection>` is `display: contents` so only the inner divs paint, matching React
 * returning either the markup or `null`.
 *
 * @internal
 */
@Component({
  selector: 'ng-flow-nodes-selection',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (shouldRender()) {
      <div [class]="outerClass()" [style.transform]="bounds().transformString">
        <div
          #rect
          class="react-flow__nodesselection-rect"
          [attr.tabindex]="disableKeyboardA11y() ? null : -1"
          [style]="rectStyle()"
          (contextmenu)="onContextMenu($event)"
          (keydown)="onKeyDown($event)"
        ></div>
      </div>
    }
  `,
})
export class NodesSelection<NodeType extends Node = Node> {
  readonly noPanClassName = input<string>('');
  readonly disableKeyboardA11y = input<boolean>(false);

  /** Emitted on right-click with the live list of selected nodes — mirrors React's `(event, nodes)`. */
  readonly onSelectionContextMenu = output<{ event: MouseEvent; nodes: NodeType[] }>();

  private readonly store = inject(FlowStore) as unknown as FlowStore<NodeType>;
  private readonly baseStore = this.store as unknown as FlowStore;
  private readonly moveSelectedNodes = useMoveSelectedNodes();

  private readonly rect = viewChild<ElementRef<HTMLDivElement>>('rect');

  protected readonly bounds = this.baseStore.select(selector, shallow);

  /** React's `shouldRender = !userSelectionActive && width !== null && height !== null`. */
  protected readonly shouldRender = computed(() => {
    const { userSelectionActive, width, height } = this.bounds();
    return !userSelectionActive && width !== null && height !== null;
  });

  protected readonly outerClass = computed(() => {
    const classes = ['react-flow__nodesselection', 'react-flow__container'];
    const noPan = this.noPanClassName();
    if (noPan) {
      classes.push(noPan);
    }
    return classes.join(' ');
  });

  protected readonly rectStyle = computed<CSSProperties>(() => {
    const { width, height } = this.bounds();
    return { width: width ?? undefined, height: height ?? undefined };
  });

  constructor() {
    const self = this;
    /*
     * Drag the whole selection. `disabled` re-reads `shouldRender` reactively inside `useDrag`'s
     * effect, matching React's `disabled: !shouldRender`.
     */
    useDrag({
      nodeRef: this.rect,
      get disabled() {
        return !self.shouldRender();
      },
    });

    // React's `useEffect(() => nodeRef.current?.focus({ preventScroll: true }), [disableKeyboardA11y])`.
    afterNextRender(() => {
      if (!this.disableKeyboardA11y()) {
        this.rect()?.nativeElement.focus({ preventScroll: true });
      }
    });
  }

  protected onContextMenu(event: MouseEvent): void {
    const selectedNodes = (this.store.getState().nodes as NodeType[]).filter((n) => n.selected);
    this.onSelectionContextMenu.emit({ event, nodes: selectedNodes });
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (this.disableKeyboardA11y()) {
      return;
    }
    if (Object.prototype.hasOwnProperty.call(arrowKeyDiffs, event.key)) {
      event.preventDefault();

      this.moveSelectedNodes({
        direction: arrowKeyDiffs[event.key],
        factor: event.shiftKey ? 4 : 1,
      });
    }
  }
}
