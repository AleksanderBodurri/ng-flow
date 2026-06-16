import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  TemplateRef,
  ViewContainerRef,
  viewChild,
} from '@angular/core';
import { DomPortalOutlet, TemplatePortal } from '@angular/cdk/portal';
import cc from 'classcat';
import { shallow } from 'zustand/shallow';
import {
  Align,
  getInternalNodesBounds,
  getNodeToolbarTransform,
  NodeLookup,
  Position,
} from '@xyflow/system';

import { FlowStore } from '../../store/flow-store';
import { useNodeId } from '../../contexts/node-id';
import type { CSSProperties, InternalNode, ReactFlowState } from '../../types';

/**
 * Props for the {@link NodeToolbar} component, documented for reference. In Angular
 * these are expressed as individual `input()`s on the component.
 *
 * @public
 */
export type NodeToolbarProps = {
  /**
   * By passing in an array of node ids you can render a single tooltip for a group or collection
   * of nodes.
   */
  nodeId?: string | string[];
  /** If `true`, node toolbar is visible even if node is not selected. */
  isVisible?: boolean;
  /**
   * Position of the toolbar relative to the node.
   * @default Position.Top
   */
  position?: Position;
  /**
   * The space between the node and the toolbar, measured in pixels.
   * @default 10
   */
  offset?: number;
  /**
   * Align the toolbar relative to the node.
   * @default "center"
   */
  align?: Align;
  /** Class applied to the toolbar wrapper. */
  className?: string;
  /** Style applied to the toolbar wrapper. */
  style?: CSSProperties;
};

const nodeEqualityFn = (a?: InternalNode, b?: InternalNode) =>
  a?.internals.positionAbsolute.x !== b?.internals.positionAbsolute.x ||
  a?.internals.positionAbsolute.y !== b?.internals.positionAbsolute.y ||
  a?.measured.width !== b?.measured.width ||
  a?.measured.height !== b?.measured.height ||
  a?.selected !== b?.selected ||
  a?.internals.z !== b?.internals.z;

const nodesEqualityFn = (a: NodeLookup, b: NodeLookup) => {
  if (a.size !== b.size) {
    return false;
  }

  for (const [key, node] of a) {
    if (nodeEqualityFn(node, b.get(key))) {
      return false;
    }
  }

  return true;
};

const storeSelector = (state: ReactFlowState) => ({
  x: state.transform[0],
  y: state.transform[1],
  zoom: state.transform[2],
  selectedNodesCount: state.nodes.filter((node) => node.selected).length,
});

// Portal into a dedicated empty container (NOT `.react-flow__renderer` directly, which is an
// Angular-managed element with child views — reparenting DOM into it via CDK corrupts the view).
// The container sits at the renderer's origin, so React Flow's toolbar transform space is preserved.
const portalTargetSelector = (s: ReactFlowState) =>
  s.domNode?.querySelector<HTMLElement>('.react-flow__node-toolbar-portal') ?? null;

/**
 * This component can render a toolbar or tooltip to one side of a custom node. This
 * toolbar doesn't scale with the viewport so that the content is always visible.
 *
 * The Angular port of React Flow's `<NodeToolbar />`. Its content is projected,
 * wrapped in a positioned `react-flow__node-toolbar` div, and rendered into the
 * `react-flow__renderer` element via a CDK `DomPortalOutlet` + `TemplatePortal`.
 *
 * @public
 * @example
 * ```html
 * <ng-flow-node-toolbar [isVisible]="toolbarVisible()" [position]="Position.Top">
 *   <button>delete</button>
 * </ng-flow-node-toolbar>
 * ```
 *
 * @remarks By default, the toolbar is only visible when its node is selected and no
 * other node is selected. Override this by setting `isVisible` to `true`.
 */
@Component({
  selector: 'ng-flow-node-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #content>
      @if (isActive()) {
        <div
          [style]="wrapperStyle()"
          [class]="wrapperClass()"
          [attr.data-id]="dataId()"
        >
          <ng-content />
        </div>
      }
    </ng-template>
  `,
})
export class NodeToolbar {
  private readonly store = inject(FlowStore);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly contextNodeId = useNodeId();

  /**
   * By passing in an array of node ids you can render a single tooltip for a group or
   * collection of nodes.
   */
  readonly nodeId = input<string | string[]>();
  /** If `true`, node toolbar is visible even if node is not selected. */
  readonly isVisible = input<boolean>();
  /**
   * Position of the toolbar relative to the node.
   * @default Position.Top
   */
  readonly position = input<Position>(Position.Top);
  /**
   * The space between the node and the toolbar, measured in pixels.
   * @default 10
   */
  readonly offset = input(10);
  /**
   * Align the toolbar relative to the node.
   * @default "center"
   */
  readonly align = input<Align>('center');
  /** Class applied to the toolbar wrapper. */
  readonly className = input<string>();
  /** Style applied to the toolbar wrapper. */
  readonly style = input<CSSProperties>();

  /** Wraps the projected `<ng-content>` so it can be stamped into the portal outlet. */
  private readonly content = viewChild.required('content', { read: TemplateRef });

  /** The target div read reactively from the store; `null` until the flow mounts. */
  private readonly target = this.store.select(portalTargetSelector);

  private readonly nodeLookup = this.store.select((s) => s.nodeLookup);
  private readonly storeData = this.store.select(storeSelector, shallow);

  // The set of targeted internal nodes, recomputed when ids/context or relevant node fields change.
  private readonly nodes = computed<NodeLookup>(
    () => {
      const nodeId = this.nodeId();
      const contextNodeId = this.contextNodeId;
      const nodeLookup = this.nodeLookup();
      const nodeIds = Array.isArray(nodeId) ? nodeId : [nodeId || contextNodeId || ''];
      return nodeIds.reduce<NodeLookup>((res, id) => {
        const node = nodeLookup.get(id);
        if (node) {
          res.set(node.id, node);
        }
        return res;
      }, new Map());
    },
    { equal: nodesEqualityFn }
  );

  // if isVisible is not set, we show the toolbar only if its node is selected and no other node is selected
  protected readonly isActive = computed(() => {
    const isVisible = this.isVisible();
    const nodes = this.nodes();
    if (typeof isVisible === 'boolean') {
      return isVisible && nodes.size > 0;
    }
    const { selectedNodesCount } = this.storeData();
    return nodes.size === 1 && !!nodes.values().next().value?.selected && selectedNodesCount === 1;
  });

  private readonly nodesArray = computed(() => Array.from(this.nodes().values()));

  protected readonly dataId = computed(() =>
    this.nodesArray()
      .reduce((acc, node) => `${acc}${node.id} `, '')
      .trim()
  );

  protected readonly wrapperClass = computed(() => cc(['react-flow__node-toolbar', this.className()]));

  protected readonly wrapperStyle = computed<CSSProperties>(() => {
    const nodes = this.nodes();
    const { x, y, zoom } = this.storeData();
    const nodeRect = getInternalNodesBounds(nodes);
    const zIndex = Math.max(...this.nodesArray().map((node) => node.internals.z + 1));

    return {
      position: 'absolute',
      transform: getNodeToolbarTransform(nodeRect, { x, y, zoom }, this.position(), this.offset(), this.align()),
      zIndex,
      ...this.style(),
    };
  });

  private outlet: DomPortalOutlet | null = null;
  private portal: TemplatePortal | null = null;

  constructor() {
    // Attach the template into the renderer whenever the target appears/changes; the
    // `@if (isActive())` inside the template handles "render nothing when not active".
    effect(() => {
      const target = this.target();
      const template = this.content();

      this.teardown();

      if (target && template) {
        this.outlet = new DomPortalOutlet(target);
        this.portal = new TemplatePortal(template, this.viewContainerRef);
        this.outlet.attach(this.portal);
      }
    });

    inject(DestroyRef).onDestroy(() => this.teardown());
  }

  private teardown(): void {
    if (this.portal?.isAttached) {
      this.portal.detach();
    }
    this.outlet?.dispose();
    this.portal = null;
    this.outlet = null;
  }
}
