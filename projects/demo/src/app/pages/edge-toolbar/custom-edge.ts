import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  BaseEdge,
  EdgeToolbar,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  Position,
  useReactFlow,
} from 'ng-flow';

interface CustomEdgeData {
  type?: 'smoothstep' | 'straight' | 'bezier';
  align?: [('left' | 'center' | 'right')?, ('top' | 'center' | 'bottom')?];
}

/**
 * React `EdgeToolbar/CustomEdge`: a BaseEdge whose path function is chosen from
 * `data.type` (smoothstep/straight/bezier), with an always-visible `EdgeToolbar` at the
 * edge center. The toolbar's `alignX`/`alignY` come from `data.align`, and its Delete
 * button removes this edge via `useReactFlow().setEdges`.
 */
@Component({
  selector: 'app-edge-toolbar-custom-edge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseEdge, EdgeToolbar],
  template: `
    <svg:g ng-flow-base-edge [id]="id()" [path]="path()[0]" />
    <ng-flow-edge-toolbar
      [edgeId]="id()"
      [x]="path()[1]"
      [y]="path()[2]"
      [alignX]="data()?.align?.[0] ?? 'center'"
      [alignY]="data()?.align?.[1] ?? 'center'"
      [isVisible]="true"
    >
      <button (click)="deleteEdge()">Delete</button>
    </ng-flow-edge-toolbar>
  `,
})
export class EdgeToolbarCustomEdge {
  readonly id = input.required<string>();
  readonly sourceX = input.required<number>();
  readonly sourceY = input.required<number>();
  readonly targetX = input.required<number>();
  readonly targetY = input.required<number>();
  readonly sourcePosition = input<Position>(Position.Bottom);
  readonly targetPosition = input<Position>(Position.Top);
  readonly data = input<CustomEdgeData>();

  private readonly flow = useReactFlow();

  protected readonly path = computed<[string, number, number, number, number]>(() => {
    const params = {
      sourceX: this.sourceX(),
      sourceY: this.sourceY(),
      sourcePosition: this.sourcePosition(),
      targetX: this.targetX(),
      targetY: this.targetY(),
      targetPosition: this.targetPosition(),
    };
    switch (this.data()?.type) {
      case 'smoothstep':
        return getSmoothStepPath(params);
      case 'straight':
        return getStraightPath(params);
      default:
        return getBezierPath(params);
    }
  });

  protected deleteEdge(): void {
    this.flow.setEdges((edges) => edges.filter((edge) => edge.id !== this.id()));
  }
}
