import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { shallow } from 'zustand/shallow';
import { PanOnScrollMode, SelectionMode, type CoordinateExtent, type KeyCode, type Viewport } from '@xyflow/system';

import { ZoomPane } from '../zoom-pane/zoom-pane';
import { Pane } from '../pane/pane';
import { NodesSelection } from '../../components/nodes-selection/nodes-selection';
import { FlowStore } from '../../store/flow-store';
import { useGlobalKeyHandler } from '../../hooks/use-global-key-handler';
import { useKeyPress } from '../../hooks/use-key-press';
import type { Node, ReactFlowState } from '../../types';

const win = typeof window !== 'undefined' ? window : undefined;

const selector = (s: ReactFlowState) => ({
  nodesSelectionActive: s.nodesSelectionActive,
  userSelectionActive: s.userSelectionActive,
});

/**
 * Composes the renderer + pane and derives the pan/selection interaction mode. The Angular port of React
 * Flow's `FlowRenderer` (container/FlowRenderer/index.tsx).
 *
 * It has **no DOM of its own** (host is `display: contents`); it nests
 * `<ng-flow-zoom-pane><ng-flow-pane><ng-content/></ng-flow-pane></ng-flow-zoom-pane>` and conditionally
 * renders `<ng-flow-nodes-selection>` inside the pane when `nodesSelectionActive`. It watches the
 * selection/pan activation keys ({@link useKeyPress}) and the store's selection flags to compute:
 *  - `panOnDrag = panActivationKeyPressed || _panOnDrag`
 *  - `panOnScroll = panActivationKeyPressed || _panOnScroll`
 *  - `_selectionOnDrag = selectionOnDrag && panOnDrag !== true`
 *  - `isSelecting = selectionKeyPressed || userSelectionActive || _selectionOnDrag`
 *
 * passing `panOnDrag={!selectionKeyPressed && panOnDrag}` to ZoomPane and `isSelecting` /
 * `selectionKeyPressed` / `_selectionOnDrag` to Pane — exactly mirroring React. It also installs the
 * global delete/multi-select key handler ({@link useGlobalKeyHandler}). The big flattened prop bag is
 * forwarded down to ZoomPane and Pane.
 *
 * @internal
 */
@Component({
  selector: 'ng-flow-flow-renderer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZoomPane, Pane, NodesSelection],
  host: { style: 'display: contents' },
  template: `
    <ng-flow-zoom-pane
      [onPaneContextMenu]="onPaneContextMenu()"
      [zoomOnScroll]="zoomOnScroll()"
      [zoomOnPinch]="zoomOnPinch()"
      [panOnScroll]="panOnScrollComputed()"
      [panOnScrollSpeed]="panOnScrollSpeed()"
      [panOnScrollMode]="panOnScrollMode()"
      [zoomOnDoubleClick]="zoomOnDoubleClick()"
      [panOnDrag]="zoomPanePanOnDrag()"
      [defaultViewport]="defaultViewport()"
      [translateExtent]="translateExtent()"
      [minZoom]="minZoom()"
      [maxZoom]="maxZoom()"
      [zoomActivationKeyCode]="zoomActivationKeyCode()"
      [preventScrolling]="preventScrolling()"
      [noWheelClassName]="noWheelClassName()"
      [noPanClassName]="noPanClassName()"
      [onViewportChange]="onViewportChange()"
      [isControlledViewport]="isControlledViewport()"
      [paneClickDistance]="paneClickDistance()"
      [selectionOnDrag]="selectionOnDragComputed()"
    >
      <div
        ng-flow-pane
        [onSelectionStart]="onSelectionStart()"
        [onSelectionEnd]="onSelectionEnd()"
        [onPaneClick]="onPaneClick()"
        [onPaneMouseEnter]="onPaneMouseEnter()"
        [onPaneMouseMove]="onPaneMouseMove()"
        [onPaneMouseLeave]="onPaneMouseLeave()"
        [onPaneContextMenu]="onPaneContextMenu()"
        [onPaneScroll]="onPaneScroll()"
        [panOnDrag]="panOnDrag()"
        [autoPanOnSelection]="autoPanOnSelection()"
        [isSelecting]="isSelecting()"
        [selectionMode]="selectionMode()"
        [selectionKeyPressed]="selectionKeyPressed()"
        [paneClickDistance]="paneClickDistance()"
        [selectionOnDrag]="selectionOnDragComputed()"
      >
        <ng-content />
        @if (flags().nodesSelectionActive) {
          <ng-flow-nodes-selection
            [noPanClassName]="noPanClassName()"
            [disableKeyboardA11y]="disableKeyboardA11y()"
            (onSelectionContextMenu)="forwardSelectionContextMenu($event)"
          />
        }
      </div>
    </ng-flow-zoom-pane>
  `,
})
export class FlowRenderer<NodeType extends Node = Node> {
  // ── Pane / pointer handlers ──
  readonly onPaneClick = input<(event: MouseEvent) => void>();
  readonly onPaneMouseEnter = input<(event: MouseEvent) => void>();
  readonly onPaneMouseMove = input<(event: MouseEvent) => void>();
  readonly onPaneMouseLeave = input<(event: MouseEvent) => void>();
  readonly onPaneContextMenu = input<(event: MouseEvent) => void>();
  readonly onPaneScroll = input<(event?: WheelEvent) => void>();
  readonly paneClickDistance = input<number>(0);

  // ── Key codes ──
  readonly deleteKeyCode = input<KeyCode | null>();
  readonly selectionKeyCode = input<KeyCode | null>();
  readonly multiSelectionKeyCode = input<KeyCode | null>();
  readonly panActivationKeyCode = input<KeyCode | null>();
  readonly zoomActivationKeyCode = input<KeyCode | null>();

  // ── Selection ──
  readonly selectionOnDrag = input<boolean>();
  readonly selectionMode = input<SelectionMode>(SelectionMode.Full);
  readonly onSelectionStart = input<(event: MouseEvent) => void>();
  readonly onSelectionEnd = input<(event: MouseEvent) => void>();
  readonly onSelectionContextMenu = input<(event: MouseEvent, nodes: NodeType[]) => void>();

  // ── Zoom / pan ──
  // Defaults mirror React Flow's prop defaults so these flow into ZoomPane (whose matching inputs are
  // non-optional) without `undefined`. GraphView always provides concrete values.
  readonly elementsSelectable = input<boolean>(true);
  readonly zoomOnScroll = input<boolean>(true);
  readonly zoomOnPinch = input<boolean>(true);
  readonly panOnScroll = input<boolean>(false);
  readonly panOnScrollSpeed = input<number>(0.5);
  readonly panOnScrollMode = input<PanOnScrollMode>(PanOnScrollMode.Free);
  readonly zoomOnDoubleClick = input<boolean>(true);
  readonly panOnDrag = input<boolean | number[]>(true);
  readonly autoPanOnSelection = input<boolean>(true);
  readonly defaultViewport = input<Viewport>({ x: 0, y: 0, zoom: 1 });
  readonly translateExtent = input.required<CoordinateExtent>();
  readonly minZoom = input.required<number>();
  readonly maxZoom = input.required<number>();
  readonly preventScrolling = input<boolean>(true);
  readonly noWheelClassName = input<string>('nowheel');
  readonly noPanClassName = input<string>('nopan');
  readonly disableKeyboardA11y = input<boolean>(false);
  readonly onViewportChange = input<(viewport: Viewport) => void>();
  readonly isControlledViewport = input.required<boolean>();

  private readonly store = inject(FlowStore);
  protected readonly flags = this.store.select(selector, shallow);

  protected readonly selectionKeyPressed = useKeyPress(
    computed(() => this.selectionKeyCode() ?? null),
    { target: win }
  );
  private readonly panActivationKeyPressed = useKeyPress(
    computed(() => this.panActivationKeyCode() ?? null),
    { target: win }
  );

  /** React's `panOnDrag = panActivationKeyPressed || _panOnDrag`. */
  protected readonly panOnDragComputed = computed<boolean | number[]>(() =>
    this.panActivationKeyPressed() ? true : (this.panOnDrag() ?? true)
  );

  // ZoomPane receives `!selectionKeyPressed && panOnDrag`.
  protected readonly zoomPanePanOnDrag = computed<boolean | number[]>(() => {
    if (this.selectionKeyPressed()) {
      return false;
    }
    return this.panOnDragComputed();
  });

  /** React's `panOnScroll = panActivationKeyPressed || _panOnScroll`. */
  protected readonly panOnScrollComputed = computed<boolean>(() =>
    this.panActivationKeyPressed() || this.panOnScroll()
  );

  /** React's `_selectionOnDrag = selectionOnDrag && panOnDrag !== true`. */
  protected readonly selectionOnDragComputed = computed<boolean>(
    () => !!this.selectionOnDrag() && this.panOnDragComputed() !== true
  );

  /** React's `isSelecting = selectionKeyPressed || userSelectionActive || _selectionOnDrag`. */
  protected readonly isSelecting = computed<boolean>(
    () => !!(this.selectionKeyPressed() || this.flags().userSelectionActive || this.selectionOnDragComputed())
  );

  constructor() {
    useGlobalKeyHandler({
      deleteKeyCode: computed(() => this.deleteKeyCode() ?? null),
      multiSelectionKeyCode: computed(() => this.multiSelectionKeyCode() ?? null),
    });
  }

  protected forwardSelectionContextMenu(payload: { event: MouseEvent; nodes: Node[] }): void {
    this.onSelectionContextMenu()?.(payload.event, payload.nodes as NodeType[]);
  }
}
