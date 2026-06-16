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
  output,
  signal,
} from '@angular/core';
import cc from 'classcat';
import {
  evaluateAbsolutePosition,
  handleExpandParent,
  ResizeControlVariant,
  XYResizer,
  type ControlLinePosition,
  type ControlPosition,
  type NodeChange,
  type NodeDimensionChange,
  type NodePositionChange,
  type ParentExpandChild,
  type ResizeControlDirection,
  type ResizeDragEvent,
  type ResizeParams,
  type ResizeParamsWithDirection,
  type XYPosition,
  type XYResizerChange,
  type XYResizerChildChange,
  type XYResizerInstance,
} from '@xyflow/system';

import { FlowStore } from '../../store/flow-store';
import { useNodeId } from '../../contexts/node-id';
import type { CSSProperties, ReactFlowState } from '../../types';

/**
 * Props for the {@link NodeResizeControl} component.
 *
 * @public
 */
export type ResizeControlProps = {
  nodeId?: string;
  color?: string;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  keepAspectRatio?: boolean;
  autoScale?: boolean;
  position?: ControlPosition;
  variant?: ResizeControlVariant;
  resizeDirection?: ResizeControlDirection;
  className?: string;
  style?: CSSProperties;
};

/**
 * Props for a resize control rendered in the `Line` variant.
 *
 * @public
 */
export type ResizeControlLineProps = Omit<ResizeControlProps, 'resizeDirection'> & {
  position?: ControlLinePosition;
};

const defaultPositions: Record<ResizeControlVariant, ControlPosition> = {
  [ResizeControlVariant.Line]: 'right',
  [ResizeControlVariant.Handle]: 'bottom-right',
};

/**
 * Render your own resizing UI with `<ng-flow-node-resize-control>`, passing children
 * (such as icons) via content projection. The Angular port of React Flow's
 * `NodeResizeControl`.
 *
 * Wires the d3-based `XYResizer` (created once the host `<div>` exists, updated via an
 * `effect`, destroyed on teardown) and writes node changes back to the store.
 *
 * @public
 */
@Component({
  selector: 'ng-flow-node-resize-control',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: {
    '[class]': 'hostClass()',
    '[style]': 'hostStyle()',
  },
})
export class NodeResizeControl {
  private readonly store = inject(FlowStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject<ElementRef<HTMLDivElement>>(ElementRef);
  private readonly contextNodeId = useNodeId();

  readonly nodeId = input<string>();
  readonly position = input<ControlPosition>();
  readonly variant = input<ResizeControlVariant>(ResizeControlVariant.Handle);
  readonly color = input<string>();
  readonly minWidth = input<number>(10);
  readonly minHeight = input<number>(10);
  readonly maxWidth = input<number>(Number.MAX_VALUE);
  readonly maxHeight = input<number>(Number.MAX_VALUE);
  readonly keepAspectRatio = input<boolean>(false);
  readonly resizeDirection = input<ResizeControlDirection>();
  readonly autoScale = input<boolean>(true);
  readonly className = input<string>();
  readonly style = input<CSSProperties>();

  readonly shouldResize = input<(event: ResizeDragEvent, params: ResizeParamsWithDirection) => boolean>();
  readonly onResizeStart = output<{ event: ResizeDragEvent; params: ResizeParams }>();
  readonly onResize = output<{ event: ResizeDragEvent; params: ResizeParamsWithDirection }>();
  readonly onResizeEnd = output<{ event: ResizeDragEvent; params: ResizeParams }>();

  /** Resolve the node id: explicit input wins, else the surrounding node's id. */
  private readonly id = computed(() => {
    const explicit = this.nodeId();
    return typeof explicit === 'string' ? explicit : this.contextNodeId;
  });

  private readonly isHandleControl = computed(() => this.variant() === ResizeControlVariant.Handle);
  protected readonly controlPosition = computed<ControlPosition>(() => this.position() ?? defaultPositions[this.variant()]);

  /** `scale` from store zoom, only when this is an auto-scaling handle (mirrors React's `scaleSelector`). */
  private readonly scale = this.store.select((s: ReactFlowState) => s.transform[2]);
  private readonly resolvedScale = computed(() =>
    this.isHandleControl() && this.autoScale() ? `${Math.max(1 / this.scale(), 1)}` : undefined
  );

  protected readonly hostClass = computed(() =>
    cc(['react-flow__resize-control', 'nodrag', ...this.controlPosition().split('-'), this.variant(), this.className()])
  );

  protected readonly hostStyle = computed<CSSProperties>(() => {
    const color = this.color();
    return {
      ...this.style(),
      scale: this.resolvedScale(),
      ...(color ? { [this.isHandleControl() ? 'backgroundColor' : 'borderColor']: color } : {}),
    };
  });

  /**
   * Holds the imperative d3 resizer. A signal (not a plain field) so the update
   * `effect` re-runs once the instance is created in `afterNextRender` — pushing the
   * initial `.update(...)`, which React gets for free by co-locating create+update.
   */
  private readonly resizer = signal<XYResizerInstance | null>(null);

  constructor() {
    // The d3 XYResizer lives for the component lifetime; create after the host exists.
    afterNextRender(() => {
      const domNode = this.elementRef.nativeElement;
      const id = this.id();
      if (!domNode || !id) {
        return;
      }

      const instance = XYResizer({
        domNode,
        nodeId: id,
        getStoreItems: () => {
          const { nodeLookup, transform, snapGrid, snapToGrid, nodeOrigin, domNode: paneDomNode } = this.store.getState();
          return {
            nodeLookup,
            transform,
            snapGrid,
            snapToGrid,
            nodeOrigin,
            paneDomNode,
          };
        },
        onChange: (change: XYResizerChange, childChanges: XYResizerChildChange[]) =>
          this.handleChange(id, change, childChanges),
        onEnd: ({ width, height }) => {
          const dimensionChange: NodeDimensionChange = {
            id,
            type: 'dimensions',
            resizing: false,
            dimensions: { width, height },
          };
          this.store.getState().triggerNodeChanges([dimensionChange]);
        },
      });

      this.resizer.set(instance);
    });

    // Push reactive control config into the imperative instance.
    effect(() => {
      const resizer = this.resizer();
      const controlPosition = this.controlPosition();
      const minWidth = this.minWidth();
      const minHeight = this.minHeight();
      const maxWidth = this.maxWidth();
      const maxHeight = this.maxHeight();
      const keepAspectRatio = this.keepAspectRatio();
      const resizeDirection = this.resizeDirection();
      const shouldResize = this.shouldResize();

      resizer?.update({
        controlPosition,
        boundaries: { minWidth, minHeight, maxWidth, maxHeight },
        keepAspectRatio,
        resizeDirection,
        onResizeStart: (event, params) => this.onResizeStart.emit({ event, params }),
        onResize: (event, params) => this.onResize.emit({ event, params }),
        onResizeEnd: (event, params) => this.onResizeEnd.emit({ event, params }),
        shouldResize,
      });
    });

    this.destroyRef.onDestroy(() => this.resizer()?.destroy());
  }

  /** Ported from React's `onChange`: builds parent-expand + position + dimension + child changes. */
  private handleChange(id: string, change: XYResizerChange, childChanges: XYResizerChildChange[]): void {
    const { triggerNodeChanges, nodeLookup, parentLookup, nodeOrigin } = this.store.getState();
    const changes: NodeChange[] = [];
    const nextPosition: { x: number | undefined; y: number | undefined } = { x: change.x, y: change.y };
    const node = nodeLookup.get(id);

    if (node && node.expandParent && node.parentId) {
      const origin = node.origin ?? nodeOrigin;
      const width = change.width ?? node.measured.width ?? 0;
      const height = change.height ?? node.measured.height ?? 0;

      const child: ParentExpandChild = {
        id: node.id,
        parentId: node.parentId,
        rect: {
          width,
          height,
          ...evaluateAbsolutePosition(
            {
              x: change.x ?? node.position.x,
              y: change.y ?? node.position.y,
            },
            { width, height },
            node.parentId,
            nodeLookup,
            origin
          ),
        },
      };

      const parentExpandChanges = handleExpandParent([child], nodeLookup, parentLookup, nodeOrigin);
      changes.push(...parentExpandChanges);

      /*
       * when the parent was expanded by the child node, its position will be clamped at
       * 0,0 when node origin is 0,0 and to width, height if it's 1,1
       */
      nextPosition.x = change.x ? Math.max(origin[0] * width, change.x) : undefined;
      nextPosition.y = change.y ? Math.max(origin[1] * height, change.y) : undefined;
    }

    if (nextPosition.x !== undefined && nextPosition.y !== undefined) {
      const positionChange: NodePositionChange = {
        id,
        type: 'position',
        position: { ...(nextPosition as XYPosition) },
      };
      changes.push(positionChange);
    }

    if (change.width !== undefined && change.height !== undefined) {
      const resizeDirection = this.resizeDirection();
      const setAttributes = !resizeDirection ? true : resizeDirection === 'horizontal' ? 'width' : 'height';
      const dimensionChange: NodeDimensionChange = {
        id,
        type: 'dimensions',
        resizing: true,
        setAttributes,
        dimensions: {
          width: change.width,
          height: change.height,
        },
      };

      changes.push(dimensionChange);
    }

    for (const childChange of childChanges) {
      const positionChange = {
        ...childChange,
        type: 'position',
      } as NodePositionChange;

      changes.push(positionChange);
    }

    triggerNodeChanges(changes);
  }
}
