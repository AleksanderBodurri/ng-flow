import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  type Connection,
  type CSSProperties,
  type Edge,
  Handle,
  Position,
  useOnViewportChange,
  type Viewport,
} from 'ng-flow';

// React applied these as inline styles (numeric values auto-suffixed with `px`). Angular's
// native `[style]` object binding does not add units, so the offsets are written as `px` strings.
const targetHandleStyle: CSSProperties = { background: '#555' };
const sourceHandleStyleA: CSSProperties = { ...targetHandleStyle, top: '10px' };
const sourceHandleStyleB: CSSProperties = {
  ...targetHandleStyle,
  bottom: '10px',
  top: 'auto',
};

interface ColorSelectorData {
  color: string;
  onChange: (event: Event) => void;
}

/**
 * Custom node (React `ColorSelectorNode`): a color picker with one target handle (Left)
 * and two source handles `a`/`b` (Right). Uses `useOnViewportChange` from inside the node
 * to log viewport start/change/end, mirroring the React component.
 */
@Component({
  selector: 'app-color-selector-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Handle],
  template: `
    <ng-flow-handle
      type="target"
      [position]="Position.Left"
      [style]="targetHandleStyle"
      (connect)="onConnect($event)"
    />
    <div>
      Custom Color Picker Node: <strong>{{ data()?.color }}</strong>
    </div>
    <input
      class="nodrag nokey"
      type="color"
      [value]="data()?.color"
      (change)="data()?.onChange($event)"
    />
    <ng-flow-handle
      type="source"
      [position]="Position.Right"
      id="a"
      [style]="sourceHandleStyleA"
      [isConnectable]="isConnectable()"
      (mousedown)="onMouseDown($event)"
    />
    <ng-flow-handle
      type="source"
      [position]="Position.Right"
      id="b"
      [style]="sourceHandleStyleB"
      [isConnectable]="isConnectable()"
    />
  `,
})
export class ColorSelectorNode {
  readonly data = input<ColorSelectorData>();
  readonly isConnectable = input(true);

  protected readonly Position = Position;
  protected readonly targetHandleStyle = targetHandleStyle;
  protected readonly sourceHandleStyleA = sourceHandleStyleA;
  protected readonly sourceHandleStyleB = sourceHandleStyleB;

  constructor() {
    useOnViewportChange({
      onStart: (viewport: Viewport) => console.log('onStart', viewport),
      onChange: (viewport: Viewport) => console.log('onChange', viewport),
      onEnd: (viewport: Viewport) => console.log('onEnd', viewport),
    });
  }

  protected onConnect(params: Connection | Edge): void {
    console.log('handle onConnect', params);
  }

  protected onMouseDown(e: MouseEvent): void {
    console.log('You trigger mousedown event', e);
  }
}
