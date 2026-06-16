import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { Handle, Position, useNodeId, useReactFlow } from 'ng-flow';

type TextData = { text: string };

/**
 * Mirrors React's TextNode.tsx. Two inputs:
 *  - "useState + updateNodeData": keeps a local signal (React's `useState`) to avoid caret jumps
 *    while also pushing the value into node data via `updateNodeData`.
 *  - "updateNodeData": writes straight to node data on each keystroke, value bound to `data.text`.
 *
 * `updateNodeData` comes from `useReactFlow()` (constructor injection context); the node id is
 * resolved via `useNodeId()` (provided by NodeWrapper), matching React reading `id` from props.
 */
@Component({
  selector: 'app-text-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Handle],
  template: `
    <div class="data-node">
      <div>node {{ nodeId }}</div>
      <div style="margin-top:5px">
        <label style="font-size:12px">useState + updateNodeData</label>
        <input style="display:block" [value]="text()" (input)="updateText($any($event.target).value)" />

        <label style="font-size:12px">updateNodeData</label>
        <input
          style="display:block"
          [value]="data()?.text ?? ''"
          (input)="updateNodeData($any($event.target).value)"
        />
      </div>
      <ng-flow-handle type="source" [position]="Position.Right" />
    </div>
  `,
  styles: [
    `
      .data-node {
        background: #eee;
        color: #222;
        padding: 10px;
        font-size: 12px;
        border-radius: 10px;
      }
    `,
  ],
})
export class TextNode {
  readonly data = input<TextData>();
  protected readonly Position = Position;
  protected readonly nodeId = useNodeId();

  private readonly flow = useReactFlow();

  // React's `useState(data.text)` — local value to avoid caret jumping on the first input.
  // Seeded once from the live node's initial data (read synchronously at construction; the
  // `data` input isn't set yet in the field initializer, so we read it from the store instead).
  protected readonly text = signal<string>(
    (this.flow.getNode(this.nodeId ?? '')?.data as TextData | undefined)?.text ?? ''
  );

  protected updateText(text: string): void {
    this.text.set(text);
    if (this.nodeId) {
      this.flow.updateNodeData(this.nodeId, { text });
    }
  }

  protected updateNodeData(text: string): void {
    if (this.nodeId) {
      this.flow.updateNodeData(this.nodeId, { text });
    }
  }
}
