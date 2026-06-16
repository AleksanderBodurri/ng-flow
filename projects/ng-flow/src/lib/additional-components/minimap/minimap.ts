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
  viewChild,
  type Type,
} from '@angular/core';
import { shallow } from 'zustand/shallow';
import {
  getBoundsOfRects,
  getInternalNodesBounds,
  getNodeDimensions,
  nodeHasDimensions,
  XYMinimap,
  type PanelPosition,
  type Rect,
  type XYMinimapInstance,
  type XYPosition,
} from '@xyflow/system';

import { FlowStore } from '../../store/flow-store';
import { Panel } from '../../components/panel/panel';
import { SvgComponentOutlet } from '../../utils/svg-component-outlet';
import type { CSSProperties, Node, ReactFlowState } from '../../types';

import { MiniMapNode, type MiniMapNodeProps } from './minimap-node';

const defaultWidth = 200;
const defaultHeight = 150;

const ARIA_LABEL_KEY = 'react-flow__minimap-desc';

/**
 * Resolves a MiniMap node attribute (color/stroke/className) for a given node.
 *
 * @public
 */
export type GetMiniMapNodeAttribute<NodeType extends Node = Node> = (node: NodeType) => string;

/**
 * Props for the {@link MiniMap} component.
 *
 * @public
 */
export type MiniMapProps<NodeType extends Node = Node> = {
  nodeColor?: string | GetMiniMapNodeAttribute<NodeType>;
  nodeStrokeColor?: string | GetMiniMapNodeAttribute<NodeType>;
  nodeClassName?: string | GetMiniMapNodeAttribute<NodeType>;
  nodeBorderRadius?: number;
  nodeStrokeWidth?: number;
  nodeComponent?: Type<unknown>;
  bgColor?: string;
  maskColor?: string;
  maskStrokeColor?: string;
  maskStrokeWidth?: number;
  position?: PanelPosition;
  pannable?: boolean;
  zoomable?: boolean;
  ariaLabel?: string | null;
  inversePan?: boolean;
  zoomStep?: number;
  offsetScale?: number;
  style?: CSSProperties;
  className?: string;
};

const filterHidden = (node: Node) => !node.hidden;

const selector = <NodeType extends Node>(s: ReactFlowState<NodeType>) => {
  const viewBB: Rect = {
    x: -s.transform[0] / s.transform[2],
    y: -s.transform[1] / s.transform[2],
    width: s.width / s.transform[2],
    height: s.height / s.transform[2],
  };

  return {
    viewBB,
    boundingRect:
      s.nodeLookup.size > 0
        ? getBoundsOfRects(getInternalNodesBounds(s.nodeLookup, { filter: filterHidden }), viewBB)
        : viewBB,
    rfId: s.rfId,
    panZoom: s.panZoom,
    translateExtent: s.translateExtent,
    flowWidth: s.width,
    flowHeight: s.height,
    ariaLabelConfig: s.ariaLabelConfig,
  };
};

const getAttrFunction = <NodeType extends Node>(
  func: string | GetMiniMapNodeAttribute<NodeType> | undefined
): GetMiniMapNodeAttribute<NodeType> => (func instanceof Function ? func : () => func ?? '');

/**
 * The `<ng-flow-minimap>` component renders an overview of your flow. It renders each
 * node as an SVG element and visualizes where the current viewport is in relation to
 * the rest of the flow. The Angular port of React Flow's `<MiniMap />`.
 *
 * @public
 *
 * @example
 * ```html
 * <ng-flow>
 *   <ng-flow-minimap [nodeStrokeWidth]="3" />
 * </ng-flow>
 * ```
 */
@Component({
  selector: 'ng-flow-minimap',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Panel, SvgComponentOutlet],
  template: `
    <ng-flow-panel [position]="position()" [style]="panelStyle()" [className]="panelClassName()" data-testid="rf__minimap">
      <svg
        #svg
        [attr.width]="elementWidth()"
        [attr.height]="elementHeight()"
        [attr.viewBox]="viewBox()"
        class="react-flow__minimap-svg"
        role="img"
        [attr.aria-labelledby]="labelledBy()"
        (click)="onSvgClick($event)"
      >
        @if (resolvedAriaLabel(); as label) {
          <svg:title [attr.id]="labelledBy()">{{ label }}</svg:title>
        }

        @for (node of nodeData(); track node.id) {
          <svg:g [ngFlowSvgOutlet]="nodeComponent()" [ngFlowSvgOutletInputs]="node.props"></svg:g>
        }

        <svg:path
          class="react-flow__minimap-mask"
          [attr.d]="maskPath()"
          fill-rule="evenodd"
          pointer-events="none"
        ></svg:path>
      </svg>
    </ng-flow-panel>
  `,
})
export class MiniMap<NodeType extends Node = Node> {
  private readonly store = inject(FlowStore) as unknown as FlowStore<NodeType>;
  private readonly destroyRef = inject(DestroyRef);

  /** Reference to the inner `<svg>` host (the minimap surface). */
  private readonly svgRef = viewChild.required<ElementRef<SVGSVGElement>>('svg');

  readonly style = input<CSSProperties>();
  readonly className = input<string>();
  readonly nodeStrokeColor = input<string | GetMiniMapNodeAttribute<NodeType>>();
  readonly nodeColor = input<string | GetMiniMapNodeAttribute<NodeType>>();
  readonly nodeClassName = input<string | GetMiniMapNodeAttribute<NodeType>>('');
  readonly nodeBorderRadius = input<number>(5);
  readonly nodeStrokeWidth = input<number>();
  readonly nodeComponent = input<Type<unknown>>(MiniMapNode);
  readonly bgColor = input<string>();
  readonly maskColor = input<string>();
  readonly maskStrokeColor = input<string>();
  readonly maskStrokeWidth = input<number>(1);
  readonly position = input<PanelPosition>('bottom-right');
  readonly pannable = input<boolean>(false);
  readonly zoomable = input<boolean>(false);
  readonly ariaLabel = input<string | null>();
  readonly inversePan = input<boolean>();
  readonly zoomStep = input<number>(1);
  readonly offsetScale = input<number>(5);

  /** Callback called when the minimap is clicked. */
  readonly onClick = output<{ event: MouseEvent; position: XYPosition }>();
  /** Callback called when a node on the minimap is clicked. */
  readonly onNodeClick = output<{ event: MouseEvent; node: NodeType }>();

  private readonly state = this.store.select((s) => selector(s), shallow);

  protected readonly elementWidth = computed(() => (this.style()?.['width'] as number) ?? defaultWidth);
  protected readonly elementHeight = computed(() => (this.style()?.['height'] as number) ?? defaultHeight);

  protected readonly viewScale = computed(() => {
    const { boundingRect } = this.state();
    const scaledWidth = boundingRect.width / this.elementWidth();
    const scaledHeight = boundingRect.height / this.elementHeight();
    return Math.max(scaledWidth, scaledHeight);
  });

  /** Geometry used both for the `viewBox` and the mask path. */
  private readonly geometry = computed(() => {
    const { boundingRect } = this.state();
    const viewScale = this.viewScale();
    const viewWidth = viewScale * this.elementWidth();
    const viewHeight = viewScale * this.elementHeight();
    const offset = this.offsetScale() * viewScale;
    const x = boundingRect.x - (viewWidth - boundingRect.width) / 2 - offset;
    const y = boundingRect.y - (viewHeight - boundingRect.height) / 2 - offset;
    const width = viewWidth + offset * 2;
    const height = viewHeight + offset * 2;
    return { x, y, width, height, offset };
  });

  protected readonly viewBox = computed(() => {
    const { x, y, width, height } = this.geometry();
    return `${x} ${y} ${width} ${height}`;
  });

  protected readonly maskPath = computed(() => {
    const { x, y, width, height, offset } = this.geometry();
    const { viewBB } = this.state();
    return (
      `M${x - offset},${y - offset}h${width + offset * 2}v${height + offset * 2}h${-width - offset * 2}z` +
      `M${viewBB.x},${viewBB.y}h${viewBB.width}v${viewBB.height}h${-viewBB.width}z`
    );
  });

  protected readonly labelledBy = computed(() => `${ARIA_LABEL_KEY}-${this.state().rfId}`);

  protected readonly resolvedAriaLabel = computed(
    () => this.ariaLabel() ?? this.state().ariaLabelConfig['minimap.ariaLabel']
  );

  /**
   * Per-node render data. Mirrors React's `MiniMapNodes` + `NodeComponentWrapper`:
   * for each node id, reads the latest position/dimensions from `nodeLookup`, skips
   * hidden / unmeasured nodes, and resolves the attribute functions per node.
   */
  protected readonly nodeData = computed(() => {
    // Read the root state signal (fresh object on every store update) so this recomputes when
    // the in-place-mutated nodeLookup changes (e.g. node measurement) — a ref-equal select would
    // never propagate those mutations.
    const rootState = this.store.state();
    const nodeIds = rootState.nodes.map((node) => node.id);
    const nodeLookup = rootState.nodeLookup;
    const nodeColorFunc = getAttrFunction<NodeType>(this.nodeColor());
    const nodeStrokeColorFunc = getAttrFunction<NodeType>(this.nodeStrokeColor());
    const nodeClassNameFunc = getAttrFunction<NodeType>(this.nodeClassName());
    const borderRadius = this.nodeBorderRadius();
    const strokeWidth = this.nodeStrokeWidth();
    const shapeRendering = this.shapeRendering;
    const onClick = (event: MouseEvent, nodeId: string) => this.emitNodeClick(event, nodeId);

    const result: Array<{ id: string; props: MiniMapNodeProps }> = [];

    for (const nodeId of nodeIds) {
      const internalNode = nodeLookup.get(nodeId);
      if (!internalNode) {
        continue;
      }

      const userNode = internalNode.internals.userNode as NodeType;
      const { x, y } = internalNode.internals.positionAbsolute;
      const { width, height } = getNodeDimensions(userNode);

      if (userNode.hidden || !nodeHasDimensions(internalNode)) {
        continue;
      }

      result.push({
        id: nodeId,
        props: {
          id: userNode.id,
          x,
          y,
          width,
          height,
          style: userNode.style,
          selected: !!userNode.selected,
          className: nodeClassNameFunc(userNode),
          color: nodeColorFunc(userNode),
          borderRadius,
          strokeColor: nodeStrokeColorFunc(userNode),
          strokeWidth,
          shapeRendering,
          onClick,
        },
      });
    }

    return result;
  });

  /** Mirrors React's SSR-safe `crispEdges` for Chrome/SSR, `geometricPrecision` otherwise. */
  private readonly shapeRendering =
    typeof window === 'undefined' || !!(window as unknown as { chrome?: unknown }).chrome
      ? 'crispEdges'
      : 'geometricPrecision';

  /** CSS-variable overrides + consumer style, merged on the Panel host. */
  protected readonly panelStyle = computed<CSSProperties>(() => {
    const viewScale = this.viewScale();
    const bgColor = this.bgColor();
    const maskColor = this.maskColor();
    const maskStrokeColor = this.maskStrokeColor();
    const maskStrokeWidth = this.maskStrokeWidth();
    const nodeColor = this.nodeColor();
    const nodeStrokeColor = this.nodeStrokeColor();
    const nodeStrokeWidth = this.nodeStrokeWidth();

    return {
      ...this.style(),
      '--xy-minimap-background-color-props': typeof bgColor === 'string' ? bgColor : undefined,
      '--xy-minimap-mask-background-color-props': typeof maskColor === 'string' ? maskColor : undefined,
      '--xy-minimap-mask-stroke-color-props': typeof maskStrokeColor === 'string' ? maskStrokeColor : undefined,
      '--xy-minimap-mask-stroke-width-props':
        typeof maskStrokeWidth === 'number' ? maskStrokeWidth * viewScale : undefined,
      '--xy-minimap-node-background-color-props': typeof nodeColor === 'string' ? nodeColor : undefined,
      '--xy-minimap-node-stroke-color-props': typeof nodeStrokeColor === 'string' ? nodeStrokeColor : undefined,
      '--xy-minimap-node-stroke-width-props': typeof nodeStrokeWidth === 'number' ? nodeStrokeWidth : undefined,
    };
  });

  protected readonly panelClassName = computed(() => {
    const className = this.className();
    return className ? `react-flow__minimap ${className}` : 'react-flow__minimap';
  });

  /**
   * Holds the imperative d3 minimap. A signal (not a plain field) so the update
   * `effect` re-runs once the instance is created in `afterNextRender`, pushing the
   * initial `.update(...)` — React gets this for free by co-locating create+update.
   */
  private readonly minimapInstance = signal<XYMinimapInstance | undefined>(undefined);

  constructor() {
    /*
     * The d3-based XYMinimap lives for the component lifetime. Create it after the
     * `<svg>` host exists; its callbacks read store state synchronously.
     */
    afterNextRender(() => {
      const domNode = this.svgRef().nativeElement;
      const panZoom = this.store.getState().panZoom;

      if (!panZoom) {
        return;
      }

      this.minimapInstance.set(
        XYMinimap({
          domNode,
          panZoom,
          getTransform: () => this.store.getState().transform,
          getViewScale: () => this.viewScale(),
        })
      );
    });

    // Push reactive updates into the imperative instance (mirrors React's update effect).
    effect(() => {
      const instance = this.minimapInstance();
      const { translateExtent, flowWidth, flowHeight } = this.state();
      const inversePan = this.inversePan();
      const pannable = this.pannable();
      const zoomStep = this.zoomStep();
      const zoomable = this.zoomable();

      instance?.update({
        translateExtent,
        width: flowWidth,
        height: flowHeight,
        inversePan,
        pannable,
        zoomStep,
        zoomable,
      });
    });

    this.destroyRef.onDestroy(() => this.minimapInstance()?.destroy());
  }

  protected onSvgClick(event: MouseEvent): void {
    const [x, y] = this.minimapInstance()?.pointer(event) || [0, 0];
    this.onClick.emit({ event, position: { x, y } });
  }

  private emitNodeClick(event: MouseEvent, nodeId: string): void {
    const node = this.store.getState().nodeLookup.get(nodeId)?.internals.userNode;
    if (node) {
      this.onNodeClick.emit({ event, node });
    }
  }
}
