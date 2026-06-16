import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Animated overlay (React `Timer` + `Timer.module.css`). Slides up from the bottom when
 * `show` is true and renders a progress bar that fills as the countdown elapses.
 *
 * The React version used CSS-modules-scoped class names; here the styles are scoped to the
 * component, so the `.timer` / `.show` / `.progress` class names are kept plain.
 */
@Component({
  selector: 'app-cancel-connection-timer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="timer" [class.show]="show()">
      <div class="progress" [style.width.%]="percentage()"></div>
      Connection will be canceled in {{ remaining() }} seconds
    </div>
  `,
  styles: [
    `
      .timer {
        position: absolute;
        bottom: 0;
        transition-duration: 0.3s;
        left: 50%;
        transform: translate(-50%, 100%);
        font-size: 1.5rem;
        z-index: 999;
        background: linear-gradient(#fff, #fff, #f5f5f5);
        padding: 0.8rem 1.5rem;
        border-radius: 5px;
        border: 1px solid #ccc;
        box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.2);
        color: #222;
      }

      .timer.show {
        transform: translate(-50%, 0%) translateY(-15px);
      }

      .progress {
        display: none;
        position: absolute;
        bottom: 0;
        left: 0;
        height: 5px;
        background: linear-gradient(to right, #42df96, #16dfed);
      }

      .timer.show .progress {
        display: block;
      }
    `,
  ],
})
export class CancelConnectionTimer {
  readonly duration = input.required<number>();
  readonly remaining = input.required<number>();
  readonly show = input.required<boolean>();

  protected readonly percentage = computed(() => 100 - (this.remaining() / this.duration()) * 100);
}
