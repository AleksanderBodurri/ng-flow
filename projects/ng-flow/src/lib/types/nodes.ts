import type { CoordinateExtent, InternalNodeBase, NodeBase, NodeProps as NodePropsBase, OnError } from '@xyflow/system';

import type { CSSProperties } from './css';
import type { NodeTypes } from './general';

/**
 * The `Node` type represents everything ng-flow needs to know about a given node.
 * Whenever you want to update a certain attribute of a node, you need to create a
 * new node object.
 *
 * @public
 */
export type Node<
  NodeData extends Record<string, unknown> = Record<string, unknown>,
  NodeType extends string | undefined = string | undefined
> = NodeBase<NodeData, NodeType> & {
  style?: CSSProperties;
  className?: string;
  resizing?: boolean;
  focusable?: boolean;
  /**
   * The ARIA role attribute for the node element, used for accessibility.
   * @default "group"
   */
  ariaRole?: string;
  /**
   * General escape hatch for adding custom attributes to the node's DOM element.
   */
  domAttributes?: Record<string, string | number | boolean | null | undefined>;
};

/**
 * The `InternalNode` type is identical to the base {@link Node} type but is extended
 * with some additional properties used internally.
 *
 * @public
 */
export type InternalNode<NodeType extends Node = Node> = InternalNodeBase<NodeType>;

export type NodeMouseHandler<NodeType extends Node = Node> = (event: MouseEvent, node: NodeType) => void;
export type SelectionDragHandler<NodeType extends Node = Node> = (event: MouseEvent, nodes: NodeType[]) => void;
export type OnNodeDrag<NodeType extends Node = Node> = (
  event: MouseEvent | TouchEvent,
  node: NodeType,
  nodes: NodeType[]
) => void;

/** Internal props for the node host component. */
export type NodeWrapperProps<NodeType extends Node = Node> = {
  id: string;
  nodesConnectable: boolean;
  elementsSelectable: boolean;
  nodesDraggable: boolean;
  nodesFocusable: boolean;
  onClick?: NodeMouseHandler<NodeType>;
  onDoubleClick?: NodeMouseHandler<NodeType>;
  onMouseEnter?: NodeMouseHandler<NodeType>;
  onMouseMove?: NodeMouseHandler<NodeType>;
  onMouseLeave?: NodeMouseHandler<NodeType>;
  onContextMenu?: NodeMouseHandler<NodeType>;
  resizeObserver: ResizeObserver | null;
  noDragClassName: string;
  noPanClassName: string;
  rfId: string;
  disableKeyboardA11y: boolean;
  nodeTypes?: NodeTypes;
  nodeExtent?: CoordinateExtent;
  onError?: OnError;
  nodeClickDistance?: number;
};

/**
 * The `BuiltInNode` type represents the built-in node types that are available in ng-flow.
 *
 * @public
 */
export type BuiltInNode =
  | Node<{ label: string }, 'input' | 'output' | 'default' | undefined>
  | Node<Record<string, never>, 'group'>;

/**
 * When you implement a custom node it is wrapped in a component that enables basic
 * functionality like selection and dragging. Your custom node receives `NodeProps`.
 *
 * @public
 */
export type NodeProps<NodeType extends Node = Node> = NodePropsBase<NodeType>;
