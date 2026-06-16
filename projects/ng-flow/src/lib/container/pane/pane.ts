import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { shallow } from 'zustand/shallow';
import {
  areSetsEqual,
  calcAutoPan,
  getEventPosition,
  getNodesInside,
  pointToRendererPoint,
  rendererPointToPoint,
  SelectionMode,
  type XYPosition,
} from '@xyflow/system';

import { UserSelection } from '../../components/user-selection/user-selection';
import { FlowStore } from '../../store/flow-store';
import { containerStyle } from '../../styles/utils';
import { getSelectionChanges } from '../../utils';
import type { ReactFlowState } from '../../types';

const selector = (s: ReactFlowState) => ({
  userSelectionActive: s.userSelectionActive,
  elementsSelectable: s.elementsSelectable,
  connectionInProgress: s.connection.inProgress,
  dragging: s.paneDragging,
  panBy: s.panBy,
  autoPanSpeed: s.autoPanSpeed,
});

/**
 * The pane: the surface behind the viewport that handles box-selection, pane clicks/context-menu/scroll,
 * and auto-pan while selecting. The Angular port of React Flow's `Pane` (container/Pane/index.tsx) — the
 * most intricate container.
 *
 * The **host is the `.react-flow__pane` div** with `[class.draggable]/[class.dragging]/[class.selection]`
 * and full-bleed `containerStyle`. Children (the Viewport) are projected via `<ng-content>`, with the
 * `<ng-flow-user-selection>` box as a sibling, matching React's `{children}<UserSelection />`.
 *
 * **Listeners — why they're manual.** React wires *capture-phase* (`onPointerDownCapture`,
 * `onClickCapture`) and *conditional* handlers via JSX props, switching the whole handler set on
 * `isSelectionEnabled`. Angular template `(event)` bindings can't register capture-phase listeners and
 * can't be conditionally detached cleanly, so in `afterNextRender` we `addEventListener` once on the host
 * for every event we care about (pointerdown + click in the *capture* phase, plus pointermove/up/cancel,
 * click, contextmenu, wheel, pointerenter/leave in bubble phase) and tear them down on `DestroyRef`. Each
 * handler then branches on `isSelectionEnabled()` (a computed) to reproduce React's exact per-mode wiring
 * — e.g. `pointermove` runs the selection logic when selection is enabled and `onPaneMouseMove` otherwise.
 *
 * Imperative refs (`autoPanId`, `containerBounds`, the selected-id `Set`s, `selectionInProgress`,
 * `position`, `autoPanStarted`) are plain class fields (React's `useRef`s), not signals.
 *
 * @internal
 */
@Component({
  selector: 'div[ng-flow-pane]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UserSelection],
  host: {
    'class': 'react-flow__pane',
    '[class.draggable]': 'draggable()',
    '[class.dragging]': 'flags().dragging',
    '[class.selection]': 'isSelecting()',
    '[style]': 'containerStyle',
  },
  template: `
    <ng-content />
    <ng-flow-user-selection />
  `,
})
export class Pane {
  readonly isSelecting = input.required<boolean>();
  readonly selectionKeyPressed = input.required<boolean>();
  readonly paneClickDistance = input<number>(0);

  // Picks from ReactFlowProps (Partial in React).
  readonly selectionMode = input<SelectionMode>(SelectionMode.Full);
  readonly panOnDrag = input<boolean | number[]>();
  readonly autoPanOnSelection = input<boolean>();
  readonly selectionOnDrag = input<boolean>();
  readonly onSelectionStart = input<(event: MouseEvent) => void>();
  readonly onSelectionEnd = input<(event: MouseEvent) => void>();
  readonly onPaneClick = input<(event: MouseEvent) => void>();
  readonly onPaneContextMenu = input<(event: MouseEvent) => void>();
  readonly onPaneScroll = input<(event?: WheelEvent) => void>();
  readonly onPaneMouseEnter = input<(event: MouseEvent) => void>();
  readonly onPaneMouseMove = input<(event: MouseEvent) => void>();
  readonly onPaneMouseLeave = input<(event: MouseEvent) => void>();

  private readonly store = inject(FlowStore);
  private readonly host = inject<ElementRef<HTMLDivElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly containerStyle = containerStyle;

  protected readonly flags = this.store.select(selector, shallow);

  /** React's `isSelectionEnabled = elementsSelectable && (isSelecting || userSelectionActive)`. */
  protected readonly isSelectionEnabled = computed(() => {
    const { elementsSelectable, userSelectionActive } = this.flags();
    return elementsSelectable && (this.isSelecting() || userSelectionActive);
  });

  /** React's `draggable = panOnDrag === true || (Array.isArray(panOnDrag) && panOnDrag.includes(0))`. */
  protected readonly draggable = computed(() => {
    const panOnDrag = this.panOnDrag();
    return panOnDrag === true || (Array.isArray(panOnDrag) && panOnDrag.includes(0));
  });

  // ── React's `useRef`s → plain imperative fields ──────────────────────────────
  private autoPanId = 0;
  private containerBounds: DOMRect | undefined;
  private selectedNodeIds = new Set<string>();
  private selectedEdgeIds = new Set<string>();
  /** Prevents click events when the user releases the selection key during a selection. */
  private selectionInProgress = false;
  /** Pointer position for auto-pan near the container edges during selection. */
  private position: XYPosition = { x: 0, y: 0 };
  private autoPanStarted = false;

  constructor() {
    afterNextRender(() => {
      const el = this.host.nativeElement;

      // Capture phase — these must intercept before a node/edge can start its own gesture.
      el.addEventListener('pointerdown', this.onPointerDownCapture, true);
      el.addEventListener('click', this.onClickCapture, true);

      // Bubble phase.
      el.addEventListener('click', this.onClickListener);
      el.addEventListener('contextmenu', this.onContextMenuListener);
      el.addEventListener('wheel', this.onWheelListener);
      el.addEventListener('pointerenter', this.onPointerEnterListener);
      el.addEventListener('pointermove', this.onPointerMoveListener);
      el.addEventListener('pointerup', this.onPointerUpListener);
      el.addEventListener('pointercancel', this.onPointerCancelListener);
      el.addEventListener('pointerleave', this.onPointerLeaveListener);
    });

    this.destroyRef.onDestroy(() => {
      const el = this.host.nativeElement;
      el.removeEventListener('pointerdown', this.onPointerDownCapture, true);
      el.removeEventListener('click', this.onClickCapture, true);
      el.removeEventListener('click', this.onClickListener);
      el.removeEventListener('contextmenu', this.onContextMenuListener);
      el.removeEventListener('wheel', this.onWheelListener);
      el.removeEventListener('pointerenter', this.onPointerEnterListener);
      el.removeEventListener('pointermove', this.onPointerMoveListener);
      el.removeEventListener('pointerup', this.onPointerUpListener);
      el.removeEventListener('pointercancel', this.onPointerCancelListener);
      el.removeEventListener('pointerleave', this.onPointerLeaveListener);
      this.cleanupAutoPan();
    });
  }

  /** React's `wrapHandler` — only fire when the event target is the pane host itself. */
  private wrap(handler: ((event: MouseEvent) => void) | undefined, event: MouseEvent): void {
    if (event.target !== this.host.nativeElement) {
      return;
    }
    handler?.(event);
  }

  private onClick = (event: MouseEvent): void => {
    /*
     * Prevent click events when the user released the selection key during a selection,
     * and when a connection is in progress.
     */
    if (this.selectionInProgress || this.flags().connectionInProgress) {
      this.selectionInProgress = false;
      return;
    }

    this.onPaneClick()?.(event);
    this.store.getState().resetSelectedElements();
    this.store.setState({ nodesSelectionActive: false });
  };

  private onContextMenu = (event: MouseEvent): void => {
    const panOnDrag = this.panOnDrag();
    if (Array.isArray(panOnDrag) && panOnDrag.includes(2)) {
      event.preventDefault();
      return;
    }
    this.onPaneContextMenu()?.(event);
  };

  // ── Native listener wrappers (branch on `isSelectionEnabled` to mirror React's JSX wiring) ──

  private onClickListener = (event: Event): void => {
    // React: `onClick={isSelectionEnabled ? undefined : wrapHandler(onClick)}`
    if (this.isSelectionEnabled()) {
      return;
    }
    this.wrap(this.onClick, event as MouseEvent);
  };

  private onContextMenuListener = (event: Event): void => {
    // React: `onContextMenu={wrapHandler(onContextMenu)}` (always)
    this.wrap(this.onContextMenu, event as MouseEvent);
  };

  private onWheelListener = (event: Event): void => {
    // React: `onWheel={wrapHandler(onWheel)}` where `onWheel = onPaneScroll ? ... : undefined`
    const handler = this.onPaneScroll();
    if (!handler) {
      return;
    }
    if (event.target !== this.host.nativeElement) {
      return;
    }
    handler(event as WheelEvent);
  };

  private onPointerEnterListener = (event: Event): void => {
    // React: `onPointerEnter={isSelectionEnabled ? undefined : onPaneMouseEnter}`
    if (this.isSelectionEnabled()) {
      return;
    }
    this.onPaneMouseEnter()?.(event as MouseEvent);
  };

  private onPointerMoveListener = (event: Event): void => {
    // React: `onPointerMove={isSelectionEnabled ? onPointerMove : onPaneMouseMove}`
    if (this.isSelectionEnabled()) {
      this.onPointerMove(event as PointerEvent);
    } else {
      this.onPaneMouseMove()?.(event as MouseEvent);
    }
  };

  private onPointerUpListener = (event: Event): void => {
    // React: `onPointerUp={isSelectionEnabled ? onPointerUp : undefined}`
    if (this.isSelectionEnabled()) {
      this.onPointerUp(event as PointerEvent);
    }
  };

  private onPointerCancelListener = (event: Event): void => {
    // React: `onPointerCancel={isSelectionEnabled ? onPointerCancel : undefined}`
    if (this.isSelectionEnabled()) {
      this.onPointerCancel(event as PointerEvent);
    }
  };

  private onPointerLeaveListener = (event: Event): void => {
    // React: `onPointerLeave={onPaneMouseLeave}` (always)
    this.onPaneMouseLeave()?.(event as MouseEvent);
  };

  private onClickCapture = (event: Event): void => {
    // React: `onClickCapture={isSelectionEnabled ? onClickCapture : undefined}`
    if (!this.isSelectionEnabled()) {
      return;
    }
    if (this.selectionInProgress) {
      event.stopPropagation();
      this.selectionInProgress = false;
    }
  };

  /*
   * Capture phase, so we can prevent other pointer events from starting a selection above a node/edge.
   * React: `onPointerDownCapture={isSelectionEnabled ? onPointerDownCapture : undefined}`.
   */
  private onPointerDownCapture = (e: Event): void => {
    if (!this.isSelectionEnabled()) {
      return;
    }
    const event = e as PointerEvent;
    const { domNode, transform } = this.store.getState();
    this.containerBounds = domNode?.getBoundingClientRect();
    if (!this.containerBounds) {
      return;
    }

    const eventTargetIsContainer = event.target === this.host.nativeElement;
    // if a child element has the 'nokey' class, we don't swallow the event nor start a selection
    const isNoKeyEvent = !eventTargetIsContainer && !!(event.target as HTMLElement).closest('.nokey');
    const isSelectionActive = (this.selectionOnDrag() && eventTargetIsContainer) || this.selectionKeyPressed();

    if (isNoKeyEvent || !this.isSelecting() || !isSelectionActive || event.button !== 0 || !event.isPrimary) {
      return;
    }

    (event.target as Partial<Element>)?.setPointerCapture?.(event.pointerId);

    this.selectionInProgress = false;

    const { x, y } = getEventPosition(event, this.containerBounds);
    const userSelectionStartPosition = pointToRendererPoint({ x, y }, transform);

    this.store.setState({
      userSelectionRect: {
        width: 0,
        height: 0,
        startX: userSelectionStartPosition.x,
        startY: userSelectionStartPosition.y,
        x,
        y,
      },
    });

    if (!eventTargetIsContainer) {
      event.stopPropagation();
      event.preventDefault();
    }
  };

  /** Commit the user-selection rect to the store on pointer-move or auto-pan during selection. */
  private commitUserSelectionRect(mouseX: number, mouseY: number): void {
    const { userSelectionRect } = this.store.getState();
    if (!userSelectionRect) {
      return;
    }

    const {
      transform,
      nodeLookup,
      edgeLookup,
      connectionLookup,
      triggerNodeChanges,
      triggerEdgeChanges,
      defaultEdgeOptions,
    } = this.store.getState();

    const userStartPosition = { x: userSelectionRect.startX, y: userSelectionRect.startY };
    const { x: screenStartX, y: screenStartY } = rendererPointToPoint(userStartPosition, transform);
    /*
     * This has to be in screen coordinates, not flow coordinates. We store the selection rectangle in
     * userSelectionStartPosition coordinates so we can fix the start position while auto-panning.
     */
    const nextUserSelectRect = {
      startX: userStartPosition.x,
      startY: userStartPosition.y,
      x: mouseX < screenStartX ? mouseX : screenStartX,
      y: mouseY < screenStartY ? mouseY : screenStartY,
      width: Math.abs(mouseX - screenStartX),
      height: Math.abs(mouseY - screenStartY),
    };

    const prevSelectedNodeIds = this.selectedNodeIds;
    const prevSelectedEdgeIds = this.selectedEdgeIds;

    this.selectedNodeIds = new Set(
      getNodesInside(nodeLookup, nextUserSelectRect, transform, this.selectionMode() === SelectionMode.Partial, true).map(
        (node) => node.id
      )
    );

    this.selectedEdgeIds = new Set();
    const edgesSelectable = defaultEdgeOptions?.selectable ?? true;

    // Look for all edges connected to the selected nodes.
    for (const nodeId of this.selectedNodeIds) {
      const connections = connectionLookup.get(nodeId);
      if (!connections) {
        continue;
      }
      for (const { edgeId } of connections.values()) {
        const edge = edgeLookup.get(edgeId);
        if (edge && (edge.selectable ?? edgesSelectable)) {
          this.selectedEdgeIds.add(edgeId);
        }
      }
    }

    if (!areSetsEqual(prevSelectedNodeIds, this.selectedNodeIds)) {
      const changes = getSelectionChanges(nodeLookup, this.selectedNodeIds, true);
      triggerNodeChanges(changes);
    }

    if (!areSetsEqual(prevSelectedEdgeIds, this.selectedEdgeIds)) {
      const changes = getSelectionChanges(edgeLookup, this.selectedEdgeIds);
      triggerEdgeChanges(changes);
    }

    this.store.setState({
      userSelectionRect: nextUserSelectRect,
      userSelectionActive: true,
      nodesSelectionActive: false,
    });
  }

  private autoPan = (): void => {
    if (!this.autoPanOnSelection() || !this.containerBounds) {
      return;
    }
    const { panBy, autoPanSpeed } = this.flags();
    const [x, y] = calcAutoPan(this.position, this.containerBounds, autoPanSpeed);

    panBy({ x, y }).then((panned) => {
      if (!this.selectionInProgress || !panned) {
        this.autoPanId = requestAnimationFrame(this.autoPan);
        return;
      }
      const { x: mx, y: my } = this.position;
      this.commitUserSelectionRect(mx, my);
      this.autoPanId = requestAnimationFrame(this.autoPan);
    });
  };

  private cleanupAutoPan(): void {
    cancelAnimationFrame(this.autoPanId);
    this.autoPanId = 0;
    this.autoPanStarted = false;
  }

  private onPointerMove(event: PointerEvent): void {
    const { userSelectionRect, transform, resetSelectedElements } = this.store.getState();

    if (!this.containerBounds || !userSelectionRect) {
      return;
    }

    const { x: mouseX, y: mouseY } = getEventPosition(event, this.containerBounds);
    this.position = { x: mouseX, y: mouseY };

    const screenStart = rendererPointToPoint({ x: userSelectionRect.startX, y: userSelectionRect.startY }, transform);

    if (!this.selectionInProgress) {
      const requiredDistance = this.selectionKeyPressed() ? 0 : this.paneClickDistance();
      const distance = Math.hypot(mouseX - screenStart.x, mouseY - screenStart.y);
      if (distance <= requiredDistance) {
        return;
      }
      resetSelectedElements();
      this.onSelectionStart()?.(event);
    }

    this.selectionInProgress = true;

    if (!this.autoPanStarted) {
      this.autoPan();
      this.autoPanStarted = true;
    }

    this.commitUserSelectionRect(mouseX, mouseY);
  }

  private onPointerUp(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }

    (event.target as Partial<Element>)?.releasePointerCapture?.(event.pointerId);

    /*
     * Only trigger click functions in selection mode if the user did not move the mouse.
     */
    if (
      !this.flags().userSelectionActive &&
      event.target === this.host.nativeElement &&
      this.store.getState().userSelectionRect
    ) {
      this.onClick(event);
    }

    this.store.setState({
      userSelectionActive: false,
      userSelectionRect: null,
    });

    if (this.selectionInProgress) {
      this.onSelectionEnd()?.(event);

      this.store.setState({
        nodesSelectionActive: this.selectedNodeIds.size > 0,
      });
    }

    this.cleanupAutoPan();
  }

  private onPointerCancel(event: PointerEvent): void {
    (event.target as Partial<Element>)?.releasePointerCapture?.(event.pointerId);
    this.cleanupAutoPan();
  }
}
