import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  Background,
  type BackgroundProps,
  BackgroundVariant,
  type Node,
  NgFlow,
  NgFlowProvider,
  useNodesState,
} from 'ng-flow';

const initialNodes: Node[] = [
  {
    id: '1',
    data: { label: 'Node 1' },
    position: { x: 50, y: 50 },
  },
];

/** One flow + provider, rendering an arbitrary stack of `<ng-flow-background>`s. */
@Component({
  selector: 'app-background-flow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFlowProvider, NgFlow, Background],
  host: { style: 'display:block;flex:1;height:100%;border-right:1px solid #ddd' },
  template: `
    <ng-flow-provider>
      <ng-flow [nodes]="ns.nodes()" [onNodesChange]="ns.onNodesChange" [id]="id()">
        @for (props of bgProps(); track $index) {
          <ng-flow-background
            [id]="$index.toString()"
            [variant]="props.variant ?? BackgroundVariant.Dots"
            [gap]="props.gap ?? 20"
            [offset]="props.offset ?? 0"
            [color]="props.color"
          />
        }
      </ng-flow>
    </ng-flow-provider>
  `,
})
export class BackgroundFlowComponent {
  protected readonly BackgroundVariant = BackgroundVariant;
  readonly id = input.required<string>();
  readonly bgProps = input.required<BackgroundProps[]>();

  protected readonly ns = useNodesState(initialNodes);
}

@Component({
  selector: 'app-backgrounds',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BackgroundFlowComponent],
  host: { style: 'display:flex;height:100%' },
  template: `
    <app-background-flow id="flow-a" [bgProps]="[{ variant: BackgroundVariant.Dots }]" />
    <app-background-flow id="flow-b" [bgProps]="[{ variant: BackgroundVariant.Lines, gap: [50, 50] }]" />
    <app-background-flow id="flow-c" [bgProps]="[{ variant: BackgroundVariant.Cross, gap: [100, 50] }]" />
    <app-background-flow
      id="flow-d"
      [bgProps]="[
        { variant: BackgroundVariant.Lines, gap: 10 },
        { variant: BackgroundVariant.Lines, gap: 100, offset: 2, color: '#ccc' },
      ]"
    />
  `,
})
export class BackgroundsPage {
  protected readonly BackgroundVariant = BackgroundVariant;
}
