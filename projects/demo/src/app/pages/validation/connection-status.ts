import { ChangeDetectionStrategy, Component } from '@angular/core';
import { type ReactFlowState, shallow, useStore } from 'ng-flow';

const selector = (state: ReactFlowState) => {
  const c = state.connection;
  return {
    connectionPosition: c.inProgress ? c.to : null,
    connectionStatus: c.isValid === null ? null : c.isValid ? 'valid' : 'invalid',
    connectionStartNodeId: c.fromHandle?.nodeId,
    connectionStartHandleType: c.fromHandle?.type,
    connectionEndNodeId: c.toHandle?.nodeId,
    connectionEndHandleType: c.toHandle?.type,
  };
};

@Component({
  selector: 'app-validation-connection-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (state().connectionPosition) {
      <div class="connectionstatus">
        @if (state().connectionStartNodeId; as startNodeId) {
          <div><strong>connection info</strong></div>
          <div>position: {{ stringify(state().connectionPosition) }}</div>
          <div>status: {{ state().connectionStatus }}</div>
          <div>from node id: {{ startNodeId }}</div>
          <div>from handle type: {{ state().connectionStartHandleType }}</div>
          <div>to node id: {{ state().connectionEndNodeId }}</div>
          <div>to handle type: {{ state().connectionEndHandleType }}</div>
        } @else {
          no connection data
        }
      </div>
    }
  `,
  styles: [
    `
      .connectionstatus {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
      }
    `,
  ],
})
export class ValidationConnectionStatus {
  protected readonly state = useStore(selector, shallow);
  protected readonly stringify = (v: unknown): string => JSON.stringify(v);
}
