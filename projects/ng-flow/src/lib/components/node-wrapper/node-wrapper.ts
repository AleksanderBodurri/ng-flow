import { NgComponentOutlet } from '@angular/common';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  type ElementRef,
  inject,
  input,
  reflectComponentType,
  Renderer2,
  type Signal,
  viewChild,
} from '@angular/core';
import { shallow } from 'zustand/shallow';
import {
  elementSelectionKeys,
  getNodeDimensions,
  getNodesInside,
  isInputDOMNode,
  nodeHasDimensions,
  type CoordinateExtent,
  type OnError,
} from '@xyflow/system';

import { ARIA_NODE_DESC_KEY } from '../a11y/a11y.constants';
import { NODE_ID } from '../../contexts/node-id';
import { useDrag } from '../../hooks/use-drag';
import { useMoveSelectedNodes } from '../../hooks/use-move-selected-nodes';
import { FlowStore } from '../../store/flow-store';
import type { CSSProperties, InternalNode, Node, NodeMouseHandler, NodeTypes } from '../../types';
import { handleNodeClick } from '../nodes/node-click';
import { resolveNodeType } from './node-types-registry';
import { arrowKeyDiffs, getNodeInlineStyleDimensions } from './node-wrapper.utils';
import { useNodeObserver } from './use-node-observer';

/**
 * Wraps a single node, providing the chrome (`react-flow__node` element) that enables selection,
 * dragging, keyboard a11y and focus auto-pan, and renders the resolved node component inside it.
 * The Angular port of React Flow's `NodeWrapper`.
 *
 * The host `<ng-flow-node-wrapper>` is `display: contents` (it never paints); the painted chrome is
 * the inner `<div class="react-flow__node">`, rendered via `@if` so a hidden node produces no DOM
 * (matching React returning `null`). The owning node id is provided to descendants (e.g. `Handle`)
 * via the {@link NODE_ID} token using a factory that reads this component's `id` input.
 *
 * @internal
 */
@Component({
  selector: 'ng-flow-node-wrapper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgComponentOutlet],
  host: { style: 'display: contents' },
  providers: [{ provide: NODE_ID, useFactory: () => inject(NodeWrapper).id() }],
  template: `
    @if (!node().hidden) {
      <div
        #nodeEl
        [class]="nodeClass()"
        [style]="nodeStyle()"
        [attr.data-id]="id()"
        [attr.data-testid]="'rf__node-' + id()"
        [attr.tabindex]="isFocusable() ? 0 : null"
        [attr.role]="role()"
        aria-roledescription="node"
        [attr.aria-describedby]="ariaDescribedBy()"
        [attr.aria-label]="node().ariaLabel"
        (mouseenter)="onMouseEnterHandler($event)"
        (mousemove)="onMouseMoveHandler($event)"
        (mouseleave)="onMouseLeaveHandler($event)"
        (contextmenu)="onContextMenuHandler($event)"
        (click)="onSelectNodeHandler($event)"
        (dblclick)="onDoubleClickHandler($event)"
        (keydown)="onKeyDownHandler($event)"
        (focus)="onFocusHandler()"
      >
        <ng-container
          [ngComponentOutlet]="nodeComponent()"
          [ngComponentOutletInputs]="filteredInputs()"
        />
      </div>
    }
  `,
})
export class NodeWrapper<NodeType extends Node = Node> {
  readonly id = input.required<string>();
  readonly nodesConnectable = input<boolean>(false);
  readonly elementsSelectable = input<boolean>(false);
  readonly nodesDraggable = input<boolean>(false);
  readonly nodesFocusable = input<boolean>(false);
  readonly resizeObserver = input<ResizeObserver | null>(null);
  readonly noDragClassName = input<string>('');
  readonly noPanClassName = input<string>('');
  readonly rfId = input<string>('');
  readonly disableKeyboardA11y = input<boolean>(false);
  readonly nodeTypes = input<NodeTypes>();
  readonly nodeExtent = input<CoordinateExtent>();
  readonly onError = input<OnError>();
  readonly nodeClickDistance = input<number>();

  // React received these as callback props; ng-flow's NodeRenderer passes them as function inputs
  // (their return value is irrelevant — they re-emit to the user with the live node object).
  readonly onClick = input<NodeMouseHandler<NodeType>>();
  readonly onDoubleClick = input<NodeMouseHandler<NodeType>>();
  readonly onMouseEnter = input<NodeMouseHandler<NodeType>>();
  readonly onMouseMove = input<NodeMouseHandler<NodeType>>();
  readonly onMouseLeave = input<NodeMouseHandler<NodeType>>();
  readonly onContextMenu = input<NodeMouseHandler<NodeType>>();

  private readonly store = inject(FlowStore) as unknown as FlowStore<NodeType>;
  /** Base-typed view of the store for helpers that operate on the generic `Node` type. */
  private readonly baseStore = this.store as unknown as FlowStore;
  private readonly moveSelectedNodes = useMoveSelectedNodes();
  private readonly renderer = inject(Renderer2);

  private readonly nodeEl = viewChild<ElementRef<HTMLDivElement>>('nodeEl');

  /** node / internals / isParent — the selector mirrors React's `useStore(..., shallow)`. */
  private readonly storeData = this.store.select((s) => {
    const node = s.nodeLookup.get(this.id())! as InternalNode<NodeType>;
    const isParent = s.parentLookup.has(this.id());
    return { node, internals: node.internals, isParent };
  }, shallow);

  protected readonly node = computed(() => this.storeData().node);
  private readonly internals = computed(() => this.storeData().internals);
  private readonly isParent = computed(() => this.storeData().isParent);

  private readonly resolved = computed(() =>
    resolveNodeType(this.node().type, this.nodeTypes(), this.onError())
  );
  protected readonly nodeComponent = computed(() => this.resolved().component);
  private readonly nodeType = computed(() => this.resolved().nodeType);

  private readonly isDraggable = computed(() => {
    const node = this.node();
    return !!(node.draggable || (this.nodesDraggable() && typeof node.draggable === 'undefined'));
  });
  private readonly isSelectable = computed(() => {
    const node = this.node();
    return !!(node.selectable || (this.elementsSelectable() && typeof node.selectable === 'undefined'));
  });
  private readonly isConnectable = computed(() => {
    const node = this.node();
    return !!(node.connectable || (this.nodesConnectable() && typeof node.connectable === 'undefined'));
  });
  protected readonly isFocusable = computed(() => {
    const node = this.node();
    return !!(node.focusable || (this.nodesFocusable() && typeof node.focusable === 'undefined'));
  });

  private readonly hasDimensions = computed(() => nodeHasDimensions(this.node()));
  private readonly nodeDimensions = computed(() => getNodeDimensions(this.node()));
  private readonly inlineDimensions = computed(() => getNodeInlineStyleDimensions(this.node()));

  private readonly hasPointerEvents = computed(
    () =>
      this.isSelectable() ||
      this.isDraggable() ||
      !!this.onClick() ||
      !!this.onMouseEnter() ||
      !!this.onMouseMove() ||
      !!this.onMouseLeave()
  );

  /** Whether a drag is in progress. Wired in the constructor via `useDrag`. */
  private readonly dragging: Signal<boolean>;

  protected readonly nodeClass = computed(() => {
    const node = this.node();
    const classes = ['react-flow__node', `react-flow__node-${this.nodeType()}`];
    if (this.isDraggable()) {
      // overwritable by passing `nopan` as a class name
      classes.push(this.noPanClassName());
    }
    if (node.className) {
      classes.push(node.className);
    }
    if (node.selected) {
      classes.push('selected');
    }
    if (this.isSelectable()) {
      classes.push('selectable');
    }
    if (this.isParent()) {
      classes.push('parent');
    }
    if (this.isDraggable()) {
      classes.push('draggable');
    }
    if (this.dragging()) {
      classes.push('dragging');
    }
    return classes.join(' ');
  });

  protected readonly nodeStyle = computed<CSSProperties>(() => {
    const node = this.node();
    const internals = this.internals();
    return {
      zIndex: internals.z,
      transform: `translate(${internals.positionAbsolute.x}px,${internals.positionAbsolute.y}px)`,
      pointerEvents: this.hasPointerEvents() ? 'all' : 'none',
      visibility: this.hasDimensions() ? 'visible' : 'hidden',
      ...node.style,
      ...this.inlineDimensions(),
    };
  });

  protected readonly role = computed(() => this.node().ariaRole ?? (this.isFocusable() ? 'group' : undefined));
  protected readonly ariaDescribedBy = computed(() =>
    this.disableKeyboardA11y() ? undefined : `${ARIA_NODE_DESC_KEY}-${this.rfId()}`
  );

  /**
   * The props passed to the resolved node component, filtered through `reflectComponentType` so
   * only declared inputs are set — mirroring React silently ignoring unknown props on swapped-in
   * custom node components.
   */
  protected readonly filteredInputs = computed<Record<string, unknown>>(() => {
    const node = this.node();
    const internals = this.internals();
    const dimensions = this.nodeDimensions();

    const props: Record<string, unknown> = {
      id: this.id(),
      data: node.data,
      type: this.nodeType(),
      positionAbsoluteX: internals.positionAbsolute.x,
      positionAbsoluteY: internals.positionAbsolute.y,
      selected: node.selected ?? false,
      selectable: this.isSelectable(),
      draggable: this.isDraggable(),
      deletable: node.deletable ?? true,
      isConnectable: this.isConnectable(),
      sourcePosition: node.sourcePosition,
      targetPosition: node.targetPosition,
      dragging: this.dragging(),
      dragHandle: node.dragHandle,
      zIndex: internals.z,
      parentId: node.parentId,
      width: dimensions.width,
      height: dimensions.height,
    };

    const mirror = reflectComponentType(this.nodeComponent());
    const accepted = new Set(mirror?.inputs.map((i) => i.templateName) ?? []);
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(props)) {
      if (accepted.has(key)) {
        out[key] = props[key];
      }
    }
    return out;
  });

  constructor() {
    const self = this;
    /*
     * `useDrag` re-reads these params inside its `effect()` on every run, so live getters keep
     * them reactive — matching React reading `node.hidden`, `isDraggable`, etc. each render.
     * React: `disabled: node.hidden || !isDraggable`.
     */
    this.dragging = useDrag({
      nodeRef: this.nodeEl,
      get disabled() {
        return self.node().hidden || !self.isDraggable();
      },
      get noDragClassName() {
        return self.noDragClassName();
      },
      get handleSelector() {
        return self.node().dragHandle;
      },
      get nodeId() {
        return self.id();
      },
      get isSelectable() {
        return self.isSelectable();
      },
      get nodeClickDistance() {
        return self.nodeClickDistance();
      },
    });

    useNodeObserver({
      nodeElement: () => this.nodeEl()?.nativeElement ?? null,
      node: this.node,
      nodeType: this.nodeType,
      hasDimensions: this.hasDimensions,
      resizeObserver: this.resizeObserver,
    });

    /*
     * Port of React's `{...node.domAttributes}` spread on the node div. Applied imperatively
     * since Angular can't spread an arbitrary attribute object in the template; stale keys from
     * a previous `domAttributes` object are removed on change.
     */
    let prevAttrKeys: string[] = [];
    afterRenderEffect(() => {
      const el = this.nodeEl()?.nativeElement;
      const attrs = this.node().domAttributes;
      if (!el) {
        prevAttrKeys = [];
        return;
      }
      for (const key of prevAttrKeys) {
        if (!attrs || !(key in attrs)) {
          this.renderer.removeAttribute(el, key);
        }
      }
      const nextKeys: string[] = [];
      if (attrs) {
        for (const [key, value] of Object.entries(attrs)) {
          if (value === null || value === undefined) {
            this.renderer.removeAttribute(el, key);
          } else {
            this.renderer.setAttribute(el, key, String(value));
            nextKeys.push(key);
          }
        }
      }
      prevAttrKeys = nextKeys;
    });
  }

  protected onMouseEnterHandler(event: MouseEvent): void {
    this.onMouseEnter()?.(event, { ...this.internals().userNode });
  }
  protected onMouseMoveHandler(event: MouseEvent): void {
    this.onMouseMove()?.(event, { ...this.internals().userNode });
  }
  protected onMouseLeaveHandler(event: MouseEvent): void {
    this.onMouseLeave()?.(event, { ...this.internals().userNode });
  }
  protected onContextMenuHandler(event: MouseEvent): void {
    this.onContextMenu()?.(event, { ...this.internals().userNode });
  }
  protected onDoubleClickHandler(event: MouseEvent): void {
    this.onDoubleClick()?.(event, { ...this.internals().userNode });
  }

  protected onSelectNodeHandler(event: MouseEvent): void {
    const { selectNodesOnDrag, nodeDragThreshold } = this.store.getState();

    if (this.isSelectable() && (!selectNodesOnDrag || !this.isDraggable() || nodeDragThreshold > 0)) {
      /*
       * called by XYDrag on drag start when selectNodesOnDrag=true;
       * here we only need to call it when selectNodesOnDrag=false
       */
      handleNodeClick({
        id: this.id(),
        store: this.baseStore,
        nodeEl: this.nodeEl()?.nativeElement ?? null,
      });
    }

    this.onClick()?.(event, { ...this.internals().userNode });
  }

  protected onKeyDownHandler(event: KeyboardEvent): void {
    if (!this.isFocusable()) {
      return;
    }
    if (isInputDOMNode(event) || this.disableKeyboardA11y()) {
      return;
    }

    if (elementSelectionKeys.includes(event.key) && this.isSelectable()) {
      const unselect = event.key === 'Escape';

      handleNodeClick({
        id: this.id(),
        store: this.baseStore,
        unselect,
        nodeEl: this.nodeEl()?.nativeElement ?? null,
      });
    } else if (
      this.isDraggable() &&
      this.node().selected &&
      Object.prototype.hasOwnProperty.call(arrowKeyDiffs, event.key)
    ) {
      // prevent default scrolling behavior on arrow key press when node is moved
      event.preventDefault();

      const { ariaLabelConfig } = this.store.getState();
      const internals = this.internals();

      this.store.setState({
        ariaLiveMessage: ariaLabelConfig['node.a11yDescription.ariaLiveMessage']({
          direction: event.key.replace('Arrow', '').toLowerCase(),
          x: ~~internals.positionAbsolute.x,
          y: ~~internals.positionAbsolute.y,
        }),
      });

      this.moveSelectedNodes({
        direction: arrowKeyDiffs[event.key],
        factor: event.shiftKey ? 4 : 1,
      });
    }
  }

  protected onFocusHandler(): void {
    if (!this.isFocusable()) {
      return;
    }
    const nodeEl = this.nodeEl()?.nativeElement;
    if (this.disableKeyboardA11y() || !nodeEl?.matches(':focus-visible')) {
      return;
    }

    const { transform, width, height, autoPanOnNodeFocus, setCenter } = this.store.getState();

    if (!autoPanOnNodeFocus) {
      return;
    }

    const node = this.node();
    const withinViewport =
      getNodesInside(new Map([[this.id(), node]]), { x: 0, y: 0, width, height }, transform, true).length > 0;

    if (!withinViewport) {
      const dimensions = this.nodeDimensions();
      setCenter(node.position.x + dimensions.width / 2, node.position.y + dimensions.height / 2, {
        zoom: transform[2],
      });
    }
  }
}
