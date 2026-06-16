import { ChangeDetectionStrategy, Component } from '@angular/core';
import { type CSSProperties } from 'ng-flow';

const nodeStyles: CSSProperties = {
  padding: '10px 15px',
  border: '1px solid #ddd',
};

/** React `NodeA` — a minimal custom node rendering the letter "A". */
@Component({
  selector: 'app-node-a',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [style]="nodeStyles">A</div>`,
})
export class NodeA {
  protected readonly nodeStyles = nodeStyles;
}
