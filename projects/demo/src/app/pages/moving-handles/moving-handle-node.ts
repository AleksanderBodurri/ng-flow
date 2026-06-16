import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { type CSSProperties, Handle, Position, useConnection } from 'ng-flow';

// Base style shared by both target handles. React used numeric `top: 0`; Angular's `[style]`
// object binding does not auto-append `px`, so unit-bearing values are written as strings.
const sourceHandleStyle: CSSProperties = {
  position: 'relative',
  transform: 'translate(-50%, 0)',
  top: '0',
  transition: 'transform 0.5s',
};

const containerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  left: '0',
  top: '0',
  justifyContent: 'space-around',
  height: '100%',
};

const bodyStyle: CSSProperties = { background: '#f4f4f4', padding: '10px' };

/**
 * Custom node (React `MovingHandleNode`). Two target handles (`a`, `b`) sit on the Left and
 * slide outward (CSS-transitioned `transform`) whenever a connection is in progress, read via
 * `useConnection()`. Two source handles sit on the Right. Mirrors the React component exactly;
 * the moved handles only take visual effect once `updateNodeInternals` re-measures them, which
 * the page's rAF loop drives.
 */
@Component({
  selector: 'app-moving-handle-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Handle],
  template: `
    <div [style]="containerStyle">
      <ng-flow-handle type="target" id="a" [position]="Position.Left" [style]="targetHandleStyle()" />
      <ng-flow-handle type="target" id="b" [position]="Position.Left" [style]="targetHandleStyle()" />
    </div>
    <div [style]="bodyStyle">
      <div>moving handles</div>
      <ng-flow-handle type="source" [position]="Position.Right" />
      <ng-flow-handle type="source" [position]="Position.Right" />
    </div>
  `,
})
export class MovingHandleNode {
  protected readonly Position = Position;
  protected readonly containerStyle = containerStyle;
  protected readonly bodyStyle = bodyStyle;

  protected readonly connection = useConnection();

  // React: transform = connection.inProgress ? 'translate(-20px, 0)' : 'translate(-50%, 0)'.
  protected readonly targetHandleStyle = computed<CSSProperties>(() => ({
    ...sourceHandleStyle,
    transform: this.connection().inProgress ? 'translate(-20px, 0)' : 'translate(-50%, 0)',
  }));
}
