import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * The DnD palette (React `Sidebar`). Each entry is `draggable` and stores its node type in
 * the drag `dataTransfer` under the `application/reactflow` key on `dragstart`.
 */
@Component({
  selector: 'app-dragndrop-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'aside' },
  template: `
    <div class="description">You can drag these nodes to the pane on the left.</div>
    <div class="react-flow__node-input" (dragstart)="onDragStart($event, 'input')" draggable="true">Input Node</div>
    <div class="react-flow__node-default" (dragstart)="onDragStart($event, 'default')" draggable="true">
      Default Node
    </div>
    <div class="react-flow__node-output" (dragstart)="onDragStart($event, 'output')" draggable="true">Output Node</div>
  `,
  styles: [
    `
      :host.aside {
        display: block;
        border-right: 1px solid #eee;
        padding: 15px 10px;
        font-size: 12px;
        background: #fcfcfc;
      }

      :host.aside > * {
        margin-bottom: 10px;
        cursor: grab;
      }

      .description {
        margin-bottom: 10px;
      }

      @media screen and (min-width: 768px) {
        :host.aside {
          width: 20%;
          max-width: 180px;
        }
      }
    `,
  ],
})
export class DragNDropSidebar {
  protected onDragStart(event: DragEvent, nodeType: string): void {
    event.dataTransfer?.setData('application/reactflow', nodeType);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }
}
