import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  type KeyCode,
  NgFlow,
  type Node,
  type OnMove,
  type OnMoveEnd,
  type OnMoveStart,
  Panel,
  SelectionMode,
} from 'ng-flow';

const MULTI_SELECT_KEY: KeyCode = ['Meta', 'Shift'];

const initialNodes: Node[] = [
  { id: '1', type: 'input', data: { label: 'Node 1' }, position: { x: 250, y: 5 }, className: 'light' },
  { id: '2', data: { label: 'Node 2' }, position: { x: 100, y: 100 }, className: 'light' },
  { id: '3', data: { label: 'Node 3' }, position: { x: 400, y: 100 }, className: 'light' },
  { id: '4', data: { label: 'Node 4' }, position: { x: 400, y: 200 }, className: 'light' },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3' },
];

const onPaneContextMenu = (e: MouseEvent) => {
  e.preventDefault();
  console.log('context menu');
};

// Pan with middle (1) and right (2) mouse buttons, like Figma.
const panOnDrag = [1, 2];

const onMoveStart: OnMoveStart = (e) => console.log('move start', e);
const onMove: OnMove = (e) => console.log('move', e);
const onMoveEnd: OnMoveEnd = (e) => console.log('move end', e);

/**
 * Figma-like interaction example. Mirrors React Flow's Figma index.tsx: drag on the pane to
 * draw a selection box (`selectionOnDrag`) using `SelectionMode.Partial`; pan with the middle
 * and right mouse buttons (`panOnDrag = [1, 2]`); pan on scroll; a generous `paneClickDistance`
 * of 100; zoom only while holding `Meta`; multi-select with `Meta`+`Shift`; nodes are NOT
 * selected on drag (`selectNodesOnDrag = false`); plus context-menu and pointer/click logging.
 *
 * `defaultNodes`/`defaultEdges` keep the flow uncontrolled (matching React). `onPointerDown`,
 * `onPointerUp` and `onClick` are native DOM events bound on the `<ng-flow>` host (React Flow
 * forwards these as props; ng-flow does not).
 */
@Component({
  selector: 'app-figma',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background, Controls, Panel],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [defaultNodes]="nodes"
      [defaultEdges]="edges"
      [selectionOnDrag]="true"
      [selectionMode]="SelectionMode.Partial"
      [panOnDrag]="panOnDrag"
      [panOnScroll]="true"
      [paneClickDistance]="100"
      zoomActivationKeyCode="Meta"
      [multiSelectionKeyCode]="MULTI_SELECT_KEY"
      [onPaneContextMenu]="onPaneContextMenu"
      [fitView]="true"
      [selectNodesOnDrag]="false"
      [onSelectionContextMenu]="onSelectionContextMenu"
      [onMoveStart]="onMoveStart"
      [onMove]="onMove"
      [onMoveEnd]="onMoveEnd"
      [onPaneClick]="onPaneClick"
      [onSelectionStart]="onSelectionStart"
      [onSelectionEnd]="onSelectionEnd"
      (pointerdown)="onPointerDown($event)"
      (pointerup)="onPointerUp($event)"
      (click)="onClick($event)"
    >
      <ng-flow-background [variant]="BackgroundVariant.Cross" />
      <ng-flow-controls />
      <ng-flow-panel position="top-right">
        <input type="text" placeholder="name" />
      </ng-flow-panel>
    </ng-flow>
  `,
})
export class FigmaPage {
  protected readonly BackgroundVariant = BackgroundVariant;
  protected readonly SelectionMode = SelectionMode;
  protected readonly MULTI_SELECT_KEY = MULTI_SELECT_KEY;
  protected readonly panOnDrag = panOnDrag;

  protected readonly nodes = initialNodes;
  protected readonly edges = initialEdges;

  // `onSelectionContextMenu` reuses the same handler as the pane context menu (React did too).
  protected readonly onPaneContextMenu = onPaneContextMenu;
  protected readonly onSelectionContextMenu = onPaneContextMenu;
  protected readonly onMoveStart = onMoveStart;
  protected readonly onMove = onMove;
  protected readonly onMoveEnd = onMoveEnd;

  protected readonly onPaneClick = (e: MouseEvent): void => console.log('pane click', e);
  protected readonly onSelectionStart = (e: MouseEvent): void => console.log('on selection start', e);
  protected readonly onSelectionEnd = (e: MouseEvent): void => console.log('on selection end', e);

  protected onPointerDown(e: PointerEvent): void {
    console.log('pointer down', e);
  }
  protected onPointerUp(e: PointerEvent): void {
    console.log('pointer up', e);
  }
  protected onClick(e: MouseEvent): void {
    console.log('click', e);
  }
}
