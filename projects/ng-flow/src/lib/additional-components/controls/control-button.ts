import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import cc from 'classcat';

/**
 * You can add buttons to the control panel by using the `<ng-flow-control-button>`
 * component and projecting it as a child of the {@link Controls} component.
 *
 * The Angular port of React Flow's `<ControlButton />`. It renders a
 * `react-flow__controls-button` `<button>` and projects its content. The common
 * passthrough button attributes (`title`, `aria-label`, `disabled`) are exposed as
 * inputs; native events such as `(click)` bubble from the inner button.
 *
 * @public
 * @example
 * ```html
 * <ng-flow-controls>
 *   <ng-flow-control-button (click)="doMagic()">
 *     <my-icon />
 *   </ng-flow-control-button>
 * </ng-flow-controls>
 * ```
 */
@Component({
  selector: 'ng-flow-control-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      [class]="buttonClass()"
      [attr.title]="title()"
      [attr.aria-label]="ariaLabel()"
      [disabled]="disabled()"
    >
      <ng-content />
    </button>
  `,
})
export class ControlButton {
  /** Extra class name(s) merged onto the inner button, mirroring React's `className`. */
  readonly className = input<string>();
  /** Native `title` attribute forwarded to the button. */
  readonly title = input<string>();
  /** Native `aria-label` attribute forwarded to the button. */
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  /** Native `disabled` attribute forwarded to the button. */
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly buttonClass = computed(() => cc(['react-flow__controls-button', this.className()]));
}
