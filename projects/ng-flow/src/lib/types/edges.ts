/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TemplateRef } from '@angular/core';
import type {
  BezierPathOptions,
  ConnectionLineType,
  DefaultEdgeOptionsBase,
  EdgeBase,
  EdgePosition,
  FinalConnectionState,
  Handle,
  HandleType,
  OnError,
  OnReconnect,
  Position,
  SmoothStepPathOptions,
  StepPathOptions,
  XYPosition,
} from '@xyflow/system';

import type { CSSProperties } from './css';
import type { EdgeTypes, InternalNode, Node } from '.';

/**
 * A label rendered along an edge. Either plain text/number or an Angular template
 * (the ng-flow equivalent of React's `ReactNode` label).
 */
export type EdgeLabel = string | number | TemplateRef<unknown> | null | undefined;

/**
 * @inline
 */
export type EdgeLabelOptions = {
  /** The label or custom element to render along the edge. */
  label?: EdgeLabel;
  /** Custom styles to apply to the label. */
  labelStyle?: CSSProperties;
  labelShowBg?: boolean;
  labelBgStyle?: CSSProperties;
  labelBgPadding?: [number, number];
  labelBgBorderRadius?: number;
};

/**
 * An `Edge` is the complete description with everything ng-flow needs to render it.
 * @public
 */
export type Edge<
  EdgeData extends Record<string, unknown> = Record<string, unknown>,
  EdgeType extends string | undefined = string | undefined
> = EdgeBase<EdgeData, EdgeType> &
  EdgeLabelOptions & {
    style?: CSSProperties;
    className?: string;
    /**
     * Determines whether the edge can be updated by dragging the source or target
     * to a new node. Overrides the `edgesReconnectable` prop on `<ng-flow>`.
     */
    reconnectable?: boolean | HandleType;
    focusable?: boolean;
    /**
     * The ARIA role attribute for the edge, used for accessibility.
     * @default "group"
     */
    ariaRole?: string;
    /** General escape hatch for adding custom attributes to the edge's DOM element. */
    domAttributes?: Record<string, string | number | boolean | null | undefined>;
  };

type SmoothStepEdgeType<EdgeData extends Record<string, unknown> = Record<string, unknown>> = Edge<
  EdgeData,
  'smoothstep'
> & {
  pathOptions?: SmoothStepPathOptions;
};

type BezierEdgeType<EdgeData extends Record<string, unknown> = Record<string, unknown>> = Edge<EdgeData, 'default'> & {
  pathOptions?: BezierPathOptions;
};

type StepEdgeType<EdgeData extends Record<string, unknown> = Record<string, unknown>> = Edge<EdgeData, 'step'> & {
  pathOptions?: StepPathOptions;
};

type StraightEdgeType<EdgeData extends Record<string, unknown> = Record<string, unknown>> = Edge<EdgeData, 'straight'>;

export type BuiltInEdge = SmoothStepEdgeType | BezierEdgeType | StepEdgeType | StraightEdgeType;

export type EdgeMouseHandler<EdgeType extends Edge = Edge> = (event: MouseEvent, edge: EdgeType) => void;

/** Internal props for the edge host component. */
export type EdgeWrapperProps<EdgeType extends Edge = Edge> = {
  id: string;
  edgesFocusable: boolean;
  edgesReconnectable: boolean;
  elementsSelectable: boolean;
  noPanClassName: string;
  onClick?: EdgeMouseHandler<EdgeType>;
  onDoubleClick?: EdgeMouseHandler<EdgeType>;
  onReconnect?: OnReconnect<EdgeType>;
  onContextMenu?: EdgeMouseHandler<EdgeType>;
  onMouseEnter?: EdgeMouseHandler<EdgeType>;
  onMouseMove?: EdgeMouseHandler<EdgeType>;
  onMouseLeave?: EdgeMouseHandler<EdgeType>;
  reconnectRadius?: number;
  onReconnectStart?: (event: MouseEvent, edge: EdgeType, handleType: HandleType) => void;
  onReconnectEnd?: (
    event: MouseEvent | TouchEvent,
    edge: EdgeType,
    handleType: HandleType,
    connectionState: FinalConnectionState
  ) => void;
  rfId?: string;
  edgeTypes?: EdgeTypes;
  onError?: OnError;
  disableKeyboardA11y?: boolean;
};

/**
 * Defaults applied to all new edges added to the flow.
 */
export type DefaultEdgeOptions = DefaultEdgeOptionsBase<Edge>;

export type EdgeTextProps = EdgeLabelOptions & {
  /** The x position where the label should be rendered. */
  x: number;
  /** The y position where the label should be rendered. */
  y: number;
  className?: string;
  [key: string]: unknown;
};

/**
 * When you implement a custom edge it is wrapped in a component that enables basic
 * functionality. The `EdgeProps` type is what is passed to it.
 * @public
 */
export type EdgeProps<EdgeType extends Edge = Edge> = Pick<
  EdgeType,
  'id' | 'type' | 'animated' | 'data' | 'style' | 'selected' | 'source' | 'target' | 'selectable' | 'deletable'
> &
  EdgePosition &
  EdgeLabelOptions & {
    sourceHandleId?: string | null;
    targetHandleId?: string | null;
    markerStart?: string;
    markerEnd?: string;
    pathOptions?: any;
    interactionWidth?: number;
  };

/**
 * BaseEdge component props.
 * @public
 */
export type BaseEdgeProps = EdgeLabelOptions & {
  id?: string;
  /** The width of the invisible interaction area around the edge. @default 20 */
  interactionWidth?: number;
  /** The x position of the edge label. */
  labelX?: number;
  /** The y position of the edge label. */
  labelY?: number;
  /** The SVG path string that defines the edge, e.g. `'M 0 0 L 100 100'`. */
  path: string;
  /** The id of the SVG marker to use at the start, e.g. `url(#markerId)`. */
  markerStart?: string;
  /** The id of the SVG marker to use at the end, e.g. `url(#markerId)`. */
  markerEnd?: string;
  style?: CSSProperties;
  className?: string;
  strokeWidth?: number;
  [key: string]: unknown;
};

/**
 * Helper type for edge components exported by the library.
 * @public
 */
export type EdgeComponentProps = EdgePosition &
  EdgeLabelOptions & {
    id?: EdgeProps['id'];
    markerStart?: EdgeProps['markerStart'];
    markerEnd?: EdgeProps['markerEnd'];
    interactionWidth?: EdgeProps['interactionWidth'];
    style?: EdgeProps['style'];
    sourceHandleId?: EdgeProps['sourceHandleId'];
    targetHandleId?: EdgeProps['targetHandleId'];
  };

export type EdgeComponentWithPathOptions<PathOptions> = EdgeComponentProps & {
  pathOptions?: PathOptions;
};

/** @public */
export type BezierEdgeProps = EdgeComponentWithPathOptions<BezierPathOptions>;
/** @public */
export type SmoothStepEdgeProps = EdgeComponentWithPathOptions<SmoothStepPathOptions>;
/** @public */
export type StepEdgeProps = EdgeComponentWithPathOptions<StepPathOptions>;
/** @public */
export type StraightEdgeProps = Omit<EdgeComponentProps, 'sourcePosition' | 'targetPosition'>;
/** @public */
export type SimpleBezierEdgeProps = EdgeComponentProps;

/**
 * The props passed to a custom connection-line component.
 * @public
 */
export type ConnectionLineComponentProps<NodeType extends Node = Node> = {
  connectionLineStyle?: CSSProperties;
  connectionLineType: ConnectionLineType;
  /** The node the connection line originates from. */
  fromNode: InternalNode<NodeType>;
  /** The handle on the `fromNode` that the connection line originates from. */
  fromHandle: Handle;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  fromPosition: Position;
  toPosition: Position;
  connectionStatus: 'valid' | 'invalid' | null;
  toNode: InternalNode<NodeType> | null;
  toHandle: Handle | null;
  pointer: XYPosition;
};

/** An Angular component class used to render a custom connection line. */
export type ConnectionLineComponent<NodeType extends Node = Node> = import('@angular/core').Type<
  ConnectionLineComponentProps<NodeType>
>;
