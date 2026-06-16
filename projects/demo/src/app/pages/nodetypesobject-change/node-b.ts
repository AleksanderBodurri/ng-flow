import { ChangeDetectionStrategy, Component } from '@angular/core';
import { type CSSProperties } from 'ng-flow';

const nodeStyles: CSSProperties = {
  padding: '10px 15px',
  border: '1px solid #ddd',
};

/** React `NodeB` — a minimal custom node rendering the letter "B". */
@Component({
  selector: 'app-node-b',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div [style]="nodeStyles">B</div>`,
})
export class NodeB {
  protected readonly nodeStyles = nodeStyles;
}
