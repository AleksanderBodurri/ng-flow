import {
  ApplicationRef,
  type ComponentRef,
  createComponent,
  Directive,
  effect,
  ElementRef,
  EnvironmentInjector,
  inject,
  Injector,
  input,
  type OnDestroy,
  reflectComponentType,
  Renderer2,
  type Type,
} from '@angular/core';

const SVG_NS = 'svg';

/*
 * SVG primitive elements a dynamic component may require *as its host* — i.e. components that paint
 * via host attribute bindings on an element selector (e.g. `rect[ng-flow-minimap-node]`) rather than
 * via their template. Such a component MUST get that exact element as its host; a `<g>` would
 * silently drop its `x`/`y`/`width`/`height`/`fill` attributes (a `<g>` is a container and ignores
 * them), so the minimap would render blank. Components with custom element selectors (the built-in
 * edges, `ng-flow-bezier-edge` …) render through their template and correctly default to `<g>`.
 */
const SVG_HOST_ELEMENTS = new Set([
  'g',
  'rect',
  'circle',
  'ellipse',
  'line',
  'path',
  'polygon',
  'polyline',
  'text',
  'tspan',
  'use',
  'image',
  'foreignObject',
]);

/** Pick the SVG host tag for a dynamic component from its selector (SVG primitive → that tag; else `g`). */
function svgHostTag(selector: string | null | undefined): string {
  const name = selector?.match(/^([a-zA-Z]+)/)?.[1];
  return name && SVG_HOST_ELEMENTS.has(name) ? name : 'g';
}

/**
 * Renders a dynamic component **inside the SVG namespace**.
 *
 * `*ngComponentOutlet` creates its component host in the HTML namespace, so SVG
 * content rendered by a dynamic component placed inside `<svg>` never paints. This
 * directive instead creates an `<svg:g>` host with `createComponent({ hostElement })`,
 * guaranteeing the component's SVG output (paths, circles, …) renders.
 *
 * Used for swappable SVG components: custom edge types, the minimap node component,
 * and custom connection lines. Inputs are filtered via `reflectComponentType` so only
 * declared inputs are set (mirroring React silently ignoring unknown props).
 *
 * @example
 * ```html
 * <svg:g [ngFlowSvgOutlet]="edgeComponent()" [ngFlowSvgOutletInputs]="edgeProps()"></svg:g>
 * ```
 */
@Directive({ selector: '[ngFlowSvgOutlet]' })
export class SvgComponentOutlet implements OnDestroy {
  readonly component = input.required<Type<unknown>>({ alias: 'ngFlowSvgOutlet' });
  readonly inputs = input<Record<string, unknown>>({}, { alias: 'ngFlowSvgOutletInputs' });

  private readonly host = inject(ElementRef).nativeElement as Element;
  private readonly renderer = inject(Renderer2);
  private readonly envInjector = inject(EnvironmentInjector);
  private readonly elInjector = inject(Injector);
  private readonly appRef = inject(ApplicationRef);

  private ref: ComponentRef<unknown> | null = null;
  private hostEl: Element | null = null;
  private accepted = new Set<string>();

  constructor() {
    // (Re)create whenever the component type changes.
    effect(() => {
      const cmp = this.component();
      this.teardown();
      this.create(cmp);
    });
    // Push input changes to the live component.
    effect(() => {
      const ins = this.inputs();
      if (this.ref) {
        this.applyInputs(ins);
      }
    });
  }

  private create(cmp: Type<unknown>): void {
    const mirror = reflectComponentType(cmp);
    // Host tag must match a component that paints via host bindings (e.g. the minimap node's
    // `rect[…]` selector); template-rendering components fall back to `<g>`.
    const hostEl = this.renderer.createElement(svgHostTag(mirror?.selector), SVG_NS) as Element;
    this.renderer.appendChild(this.host, hostEl);

    const ref = createComponent(cmp, {
      hostElement: hostEl,
      environmentInjector: this.envInjector,
      elementInjector: this.elInjector,
    });
    this.appRef.attachView(ref.hostView);

    this.accepted = new Set(mirror?.inputs.map((i) => i.templateName) ?? []);

    this.ref = ref;
    this.hostEl = hostEl;
    this.applyInputs(this.inputs());
    ref.changeDetectorRef.detectChanges();
  }

  private applyInputs(ins: Record<string, unknown>): void {
    const ref = this.ref;
    if (!ref) {
      return;
    }
    for (const [key, value] of Object.entries(ins)) {
      if (this.accepted.has(key)) {
        ref.setInput(key, value);
      }
    }
    ref.changeDetectorRef.markForCheck();
  }

  private teardown(): void {
    if (this.ref) {
      this.appRef.detachView(this.ref.hostView);
      this.ref.destroy();
      this.ref = null;
    }
    if (this.hostEl) {
      this.renderer.removeChild(this.host, this.hostEl);
      this.hostEl = null;
    }
  }

  ngOnDestroy(): void {
    this.teardown();
  }
}
