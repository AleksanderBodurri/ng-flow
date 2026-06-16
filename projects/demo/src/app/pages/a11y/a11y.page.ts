import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  type AriaLabelConfig,
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  MiniMap,
  NgFlow,
  type Node,
  Panel,
} from 'ng-flow';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'A11y Node 1' },
    position: { x: 250, y: 5 },
    className: 'light',
    domAttributes: {
      tabIndex: 10,
      'aria-roledescription': 'A11y Node',
    },
  },
  {
    id: '2',
    data: { label: 'Node 2' },
    position: { x: 1000, y: 100 },
  },
  {
    id: '3',
    data: { label: 'Node 3' },
    position: { x: 100, y: 100 },
    className: 'light',
    ariaRole: 'button',
  },
  {
    id: '4',
    data: { label: 'Node 4' },
    position: { x: 300, y: 100 },
  },
  {
    id: '5',
    data: { label: 'Node 5' },
    position: { x: 400, y: 200 },
  },
  {
    id: '6',
    data: { label: 'Node 6' },
    position: { x: -1000, y: 200 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3' },
  { id: 'e1-4', source: '1', target: '4' },
  { id: 'e1-5', source: '4', target: '5' },
  { id: 'e1-6', source: '3', target: '6' },
];

// React `ariaLabelConfig` override, including the `ariaLiveMessage` FUNCTION builder.
const ariaLabelConfig: Partial<AriaLabelConfig> = {
  'node.a11yDescription.default': 'Custom Node Desc.',
  'node.a11yDescription.keyboardDisabled': 'Custom Keyboard Desc.',
  'node.a11yDescription.ariaLiveMessage': ({ direction, x, y }) =>
    `Custom Moved selected node ${direction}. New position, x: ${x}, y: ${y}`,
  'edge.a11yDescription.default': 'Custom Edge Desc.',
  'controls.ariaLabel': 'Custom Controls Aria Label',
  'controls.zoomIn.ariaLabel': 'Custom Zoom in',
  'controls.zoomOut.ariaLabel': 'Custom Zoom Out',
  'controls.fitView.ariaLabel': 'Custom Fit View',
  'controls.interactive.ariaLabel': 'Custom Toggle Interactivity',
  'minimap.ariaLabel': 'Custom Aria Label',
};

/**
 * Mirrors React `A11y`. Uncontrolled flow (`defaultNodes`/`defaultEdges`) demonstrating
 * accessibility features: a custom `ariaLabelConfig` (including the `ariaLiveMessage`
 * function builder), per-node `domAttributes` (node 1: `tabIndex` + `aria-roledescription`)
 * and `ariaRole` (node 3: `'button'`), and a Panel checkbox toggling `autoPanOnNodeFocus`.
 * `nodeDragThreshold={0}`, `selectNodesOnDrag={false}`, `elevateEdgesOnSelect`,
 * `elevateNodesOnSelect={false}`. Focus a node and use arrow keys to move it.
 */
@Component({
  selector: 'app-a11y',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlow, Background, MiniMap, Controls, Panel],
  host: { style: 'display:block;height:100%' },
  template: `
    <ng-flow
      [defaultNodes]="initialNodes"
      [defaultEdges]="initialEdges"
      [autoPanOnNodeFocus]="autoPanOnNodeFocus()"
      [selectNodesOnDrag]="false"
      [elevateEdgesOnSelect]="true"
      [elevateNodesOnSelect]="false"
      [nodeDragThreshold]="0"
      [ariaLabelConfig]="ariaLabelConfig"
    >
      <ng-flow-background [variant]="BackgroundVariant.Dots" />
      <ng-flow-minimap />
      <ng-flow-controls />
      <ng-flow-panel position="top-right">
        <div>
          <label for="focusPannable">
            <input
              id="focusPannable"
              type="checkbox"
              [checked]="autoPanOnNodeFocus()"
              (change)="onToggle($event)"
              class="xy-theme__checkbox"
            />
            autoPanOnNodeFocus
          </label>
        </div>
      </ng-flow-panel>
    </ng-flow>
  `,
})
export class A11yPage {
  protected readonly BackgroundVariant = BackgroundVariant;
  protected readonly initialNodes = initialNodes;
  protected readonly initialEdges = initialEdges;
  protected readonly ariaLabelConfig = ariaLabelConfig;

  protected readonly autoPanOnNodeFocus = signal(true);

  protected onToggle(event: Event): void {
    this.autoPanOnNodeFocus.set((event.target as HTMLInputElement).checked);
  }
}
