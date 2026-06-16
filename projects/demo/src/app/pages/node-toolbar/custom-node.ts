import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { type Align, Handle, NodeToolbar, Position } from 'ng-flow';

interface CustomNodeData {
  label: string;
  toolbarPosition?: Position;
  toolbarAlign?: Align;
  toolbarVisible?: boolean;
}

/**
 * React `NodeToolbar/CustomNode`: a default-styled node that renders a `NodeToolbar`
 * (with delete/copy/expand buttons) whose position/align/visibility come from the node's
 * `data`. The toolbar lives INSIDE the node component.
 */
@Component({
  selector: 'app-node-toolbar-custom-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Handle, NodeToolbar],
  template: `
    <ng-flow-node-toolbar
      [isVisible]="data()?.toolbarVisible"
      [position]="data()?.toolbarPosition ?? Position.Top"
      [align]="data()?.toolbarAlign ?? 'center'"
    >
      <button>delete</button>
      <button>copy</button>
      <button>expand</button>
    </ng-flow-node-toolbar>
    <div>{{ data()?.label }}</div>
    <ng-flow-handle type="target" [position]="Position.Left" />
    <ng-flow-handle type="source" [position]="Position.Right" />
  `,
})
export class NodeToolbarCustomNode {
  readonly id = input<string>();
  readonly data = input<CustomNodeData>();
  protected readonly Position = Position;
}
