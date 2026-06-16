import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import cc from 'classcat';
import { shallow } from 'zustand/shallow';
import type { PanelPosition } from '@xyflow/system';

import { FlowStore } from '../../store/flow-store';
import { useReactFlow } from '../../hooks/use-react-flow';
import { Panel } from '../../components/panel/panel';
import type { CSSProperties, FitViewOptions, ReactFlowState } from '../../types';
import { ControlButton } from './control-button';

const selector = (s: ReactFlowState) => ({
  isInteractive: s.nodesDraggable || s.nodesConnectable || s.elementsSelectable,
  minZoomReached: s.transform[2] <= s.minZoom,
  maxZoomReached: s.transform[2] >= s.maxZoom,
  ariaLabelConfig: s.ariaLabelConfig,
});

/**
 * The `<ng-flow-controls>` component renders a small panel that contains convenient
 * buttons to zoom in, zoom out, fit the view, and lock the viewport.
 *
 * The Angular port of React Flow's `<Controls />`. It composes {@link Panel} and
 * {@link ControlButton}, with the icon SVGs inlined. Projected content is appended
 * after the built-in buttons.
 *
 * @public
 * @example
 * ```html
 * <ng-flow-controls />
 * ```
 *
 * @remarks To extend or customise the controls, project {@link ControlButton}s.
 */
@Component({
  selector: 'ng-flow-controls',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Panel, ControlButton],
  template: `
    <ng-flow-panel
      [className]="panelClass()"
      [position]="position()"
      [style]="style()"
      data-testid="rf__controls"
      [attr.aria-label]="ariaLabel() ?? ariaLabelConfig()['controls.ariaLabel']"
    >
      @if (showZoom()) {
        <ng-flow-control-button
          (click)="onZoomInHandler()"
          className="react-flow__controls-zoomin"
          [title]="ariaLabelConfig()['controls.zoomIn.ariaLabel']"
          [attr.aria-label]="ariaLabelConfig()['controls.zoomIn.ariaLabel']"
          [disabled]="maxZoomReached()"
        >
          <svg:svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <svg:path d="M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z" />
          </svg:svg>
        </ng-flow-control-button>
        <ng-flow-control-button
          (click)="onZoomOutHandler()"
          className="react-flow__controls-zoomout"
          [title]="ariaLabelConfig()['controls.zoomOut.ariaLabel']"
          [attr.aria-label]="ariaLabelConfig()['controls.zoomOut.ariaLabel']"
          [disabled]="minZoomReached()"
        >
          <svg:svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 5">
            <svg:path d="M0 0h32v4.2H0z" />
          </svg:svg>
        </ng-flow-control-button>
      }
      @if (showFitView()) {
        <ng-flow-control-button
          className="react-flow__controls-fitview"
          (click)="onFitViewHandler()"
          [title]="ariaLabelConfig()['controls.fitView.ariaLabel']"
          [attr.aria-label]="ariaLabelConfig()['controls.fitView.ariaLabel']"
        >
          <svg:svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 30">
            <svg:path
              d="M3.692 4.63c0-.53.4-.938.939-.938h5.215V0H4.708C2.13 0 0 2.054 0 4.63v5.216h3.692V4.631zM27.354 0h-5.2v3.692h5.17c.53 0 .984.4.984.939v5.215H32V4.631A4.624 4.624 0 0027.354 0zm.954 24.83c0 .532-.4.94-.939.94h-5.215v3.768h5.215c2.577 0 4.631-2.13 4.631-4.707v-5.139h-3.692v5.139zm-23.677.94c-.531 0-.939-.4-.939-.94v-5.138H0v5.139c0 2.577 2.13 4.707 4.708 4.707h5.138V25.77H4.631z"
            />
          </svg:svg>
        </ng-flow-control-button>
      }
      @if (showInteractive()) {
        <ng-flow-control-button
          className="react-flow__controls-interactive"
          (click)="onToggleInteractivity()"
          [title]="ariaLabelConfig()['controls.interactive.ariaLabel']"
          [attr.aria-label]="ariaLabelConfig()['controls.interactive.ariaLabel']"
        >
          @if (isInteractive()) {
            <svg:svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 32">
              <svg:path
                d="M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0c-4.114 1.828-1.37 2.133.305 2.438 1.676.305 4.42 2.59 4.42 5.181v3.048H3.047A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047z"
              />
            </svg:svg>
          } @else {
            <svg:svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 32">
              <svg:path
                d="M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0 8 0 4.571 3.429 4.571 7.619v3.048H3.048A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047zm4.724-13.866H7.467V7.619c0-2.59 2.133-4.724 4.723-4.724 2.591 0 4.724 2.133 4.724 4.724v3.048z"
              />
            </svg:svg>
          }
        </ng-flow-control-button>
      }
      <ng-content />
    </ng-flow-panel>
  `,
})
export class Controls {
  private readonly store = inject(FlowStore);
  private readonly flow = useReactFlow();
  private readonly storeData = this.store.select(selector, shallow);

  /**
   * Whether or not to show the zoom in and zoom out buttons.
   * @default true
   */
  readonly showZoom = input(true);
  /**
   * Whether or not to show the fit view button.
   * @default true
   */
  readonly showFitView = input(true);
  /**
   * Show button for toggling interactivity.
   * @default true
   */
  readonly showInteractive = input(true);
  /**
   * Customise the options for the fit view button. These are the same options you would pass to
   * the `fitView` function.
   */
  readonly fitViewOptions = input<FitViewOptions>();
  /**
   * Position of the controls on the pane.
   * @default 'bottom-left'
   */
  readonly position = input<PanelPosition>('bottom-left');
  /**
   * Orientation of the controls.
   * @default 'vertical'
   */
  readonly orientation = input<'horizontal' | 'vertical'>('vertical');
  /** Style applied to the container. */
  readonly style = input<CSSProperties>();
  /** Class name applied to the container. */
  readonly className = input<string>();
  /**
   * @default 'React Flow controls'
   */
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });

  /** Called in addition to the default zoom behavior when the zoom in button is clicked. */
  readonly onZoomIn = output<void>();
  /** Called in addition to the default zoom behavior when the zoom out button is clicked. */
  readonly onZoomOut = output<void>();
  /** Called when the fit view button is clicked. */
  readonly onFitView = output<void>();
  /** Called when the interactive (lock) button is clicked. */
  readonly onInteractiveChange = output<boolean>();

  protected readonly isInteractive = computed(() => this.storeData().isInteractive);
  protected readonly minZoomReached = computed(() => this.storeData().minZoomReached);
  protected readonly maxZoomReached = computed(() => this.storeData().maxZoomReached);
  protected readonly ariaLabelConfig = computed(() => this.storeData().ariaLabelConfig);

  protected readonly panelClass = computed(() => {
    const orientationClass = this.orientation() === 'horizontal' ? 'horizontal' : 'vertical';
    return cc(['react-flow__controls', orientationClass, this.className()]);
  });

  protected onZoomInHandler(): void {
    this.flow.zoomIn();
    this.onZoomIn.emit();
  }

  protected onZoomOutHandler(): void {
    this.flow.zoomOut();
    this.onZoomOut.emit();
  }

  protected onFitViewHandler(): void {
    this.flow.fitView(this.fitViewOptions());
    this.onFitView.emit();
  }

  protected onToggleInteractivity(): void {
    const isInteractive = this.isInteractive();
    this.store.setState({
      nodesDraggable: !isInteractive,
      nodesConnectable: !isInteractive,
      elementsSelectable: !isInteractive,
    });

    this.onInteractiveChange.emit(!isInteractive);
  }
}
