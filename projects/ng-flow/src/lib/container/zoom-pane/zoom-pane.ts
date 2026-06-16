import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { shallow } from 'zustand/shallow';
import {
  PanOnScrollMode,
  XYPanZoom,
  type CoordinateExtent,
  type KeyCode,
  type PanZoomInstance,
  type Transform,
  type Viewport,
} from '@xyflow/system';

import { FlowStore } from '../../store/flow-store';
import { useKeyPress } from '../../hooks/use-key-press';
import { useResizeHandler } from '../../hooks/use-resize-handler';
import { containerStyle } from '../../styles/utils';
import type { ReactFlowState } from '../../types';

const selector = (s: ReactFlowState) => ({
  userSelectionActive: s.userSelectionActive,
  lib: s.lib,
  connectionInProgress: s.connection.inProgress,
});

/**
 * Owns the d3-zoom pan/zoom behavior. The Angular port of React Flow's `ZoomPane`
 * (container/ZoomPane/index.tsx).
 *
 * The **host is the `.react-flow__renderer` div** (full-bleed `containerStyle`); `XYPanZoom` attaches its
 * d3 zoom behavior to this host element. Lifecycle:
 *  - In `afterNextRender` (the host element now exists): create the `XYPanZoom` instance, seed the store
 *    with `{ panZoom, transform, domNode }` (where `domNode` is the outer `.react-flow`), and `destroy()`
 *    on `DestroyRef` — mirroring React's mount-effect + cleanup.
 *  - An `effect()` calls `panZoom.update(...)` whenever any interaction option / `userSelectionActive` /
 *    `lib` / `connectionInProgress` / the zoom-activation key changes — mirroring React's update-effect.
 *
 * `onTransformChange` calls `onViewportChange` then writes `transform` to the store **only when the
 * viewport isn't controlled** (React's `isControlledViewport` guard). The pan/zoom start/move/end
 * callbacks read fresh handlers from `getState()` and invoke `onMove*` + `onViewportChange*`. The
 * dragging callback writes `paneDragging` with a no-op guard. `useResizeHandler(host)` keeps the store
 * width/height in sync. The Pane is projected via `<ng-content>`.
 *
 * @internal
 */
@Component({
  selector: 'ng-flow-zoom-pane',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'react-flow__renderer',
    '[style]': 'containerStyle',
  },
  template: `<ng-content /><div class="react-flow__node-toolbar-portal" style="position:absolute;top:0;left:0"></div>`,
})
export class ZoomPane {
  readonly onPaneContextMenu = input<(event: MouseEvent) => void>();
  readonly zoomOnScroll = input<boolean>(true);
  readonly zoomOnPinch = input<boolean>(true);
  readonly panOnScroll = input<boolean>(false);
  readonly panOnScrollSpeed = input<number>(0.5);
  readonly panOnScrollMode = input<PanOnScrollMode>(PanOnScrollMode.Free);
  readonly zoomOnDoubleClick = input<boolean>(true);
  readonly panOnDrag = input<boolean | number[]>(true);
  readonly defaultViewport = input<Viewport>({ x: 0, y: 0, zoom: 1 });
  readonly translateExtent = input.required<CoordinateExtent>();
  readonly minZoom = input.required<number>();
  readonly maxZoom = input.required<number>();
  readonly zoomActivationKeyCode = input<KeyCode | null>();
  readonly preventScrolling = input<boolean>(true);
  readonly noWheelClassName = input<string>('nowheel');
  readonly noPanClassName = input<string>('nopan');
  readonly onViewportChange = input<(viewport: Viewport) => void>();
  readonly isControlledViewport = input.required<boolean>();
  readonly paneClickDistance = input<number>(0);
  readonly selectionOnDrag = input<boolean>();

  protected readonly containerStyle = containerStyle;

  private readonly store = inject(FlowStore);
  private readonly host = inject<ElementRef<HTMLDivElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  private readonly flags = this.store.select(selector, shallow);
  // Pass the input as a signal so the key-press listeners stay reactive to a changing key code.
  private readonly zoomActivationKeyPressed = useKeyPress(
    computed(() => this.zoomActivationKeyCode() ?? null)
  );

  /*
   * React's `useRef<PanZoomInstance>()`. Modelled as a signal (like Minimap's `XYMinimap`) so that
   * setting it in `afterNextRender` re-triggers the update `effect()` below — that effect runs once
   * during the first change detection (before `afterNextRender`, when the instance is still undefined),
   * and needs to re-run to push the initial interaction options after the instance is created. This
   * reproduces React's mount-effect-then-update-effect ordering.
   */
  private readonly panZoom = signal<PanZoomInstance | undefined>(undefined);

  constructor() {
    // Keep the store width/height in sync with the renderer host.
    useResizeHandler(this.host);

    afterNextRender(() => {
      const domNode = this.host.nativeElement;

      const panZoom = XYPanZoom({
        domNode,
        minZoom: this.minZoom(),
        maxZoom: this.maxZoom(),
        translateExtent: this.translateExtent(),
        viewport: this.defaultViewport(),
        onDraggingChange: (paneDragging) =>
          this.store.setState((prevState) =>
            prevState.paneDragging === paneDragging ? prevState : { paneDragging }
          ),
        onPanZoomStart: (event, vp) => {
          const { onViewportChangeStart, onMoveStart } = this.store.getState();
          onMoveStart?.(event, vp);
          onViewportChangeStart?.(vp);
        },
        onPanZoom: (event, vp) => {
          const { onViewportChange, onMove } = this.store.getState();
          onMove?.(event, vp);
          onViewportChange?.(vp);
        },
        onPanZoomEnd: (event, vp) => {
          const { onViewportChangeEnd, onMoveEnd } = this.store.getState();
          onMoveEnd?.(event, vp);
          onViewportChangeEnd?.(vp);
        },
      });

      const { x, y, zoom } = panZoom.getViewport();

      this.store.setState({
        panZoom,
        transform: [x, y, zoom],
        domNode: domNode.closest('.react-flow') as HTMLDivElement,
      });

      this.panZoom.set(panZoom);
    });

    this.destroyRef.onDestroy(() => this.panZoom()?.destroy());

    // React's update-effect: push reactive options into the imperative instance on any change.
    effect(() => {
      const { userSelectionActive, lib, connectionInProgress } = this.flags();
      this.panZoom()?.update({
        onPaneContextMenu: this.onPaneContextMenu(),
        zoomOnScroll: this.zoomOnScroll(),
        zoomOnPinch: this.zoomOnPinch(),
        panOnScroll: this.panOnScroll(),
        panOnScrollSpeed: this.panOnScrollSpeed(),
        panOnScrollMode: this.panOnScrollMode(),
        zoomOnDoubleClick: this.zoomOnDoubleClick(),
        panOnDrag: this.panOnDrag(),
        zoomActivationKeyPressed: this.zoomActivationKeyPressed(),
        preventScrolling: this.preventScrolling(),
        noPanClassName: this.noPanClassName(),
        userSelectionActive,
        noWheelClassName: this.noWheelClassName(),
        lib,
        onTransformChange: (transform) => this.onTransformChange(transform),
        connectionInProgress,
        selectionOnDrag: this.selectionOnDrag(),
        paneClickDistance: this.paneClickDistance(),
      });
    });
  }

  /** Calls `onViewportChange`, then writes `transform` to the store unless the viewport is controlled. */
  private onTransformChange(transform: Transform): void {
    this.onViewportChange()?.({ x: transform[0], y: transform[1], zoom: transform[2] });

    if (!this.isControlledViewport()) {
      this.store.setState({ transform });
    }
  }
}
