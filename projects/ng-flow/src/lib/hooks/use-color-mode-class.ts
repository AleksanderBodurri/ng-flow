import { computed, effect, isSignal, signal, type Signal } from '@angular/core';
import type { ColorMode, ColorModeClass } from '@xyflow/system';

function getMediaQuery(): MediaQueryList | null {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return null;
  }

  return window.matchMedia('(prefers-color-scheme: dark)');
}

/** Accept either a plain value or a `Signal` of it. */
type ValueOrSignal<T> = T | Signal<T>;

/**
 * Resolves the effective color-mode class (`'light'` / `'dark'`) as a `Signal`. When the
 * mode is `'system'`, it tracks `matchMedia('(prefers-color-scheme: dark)')`. The ng-flow
 * port of React Flow's `useColorModeClass`.
 *
 * `colorMode` may be a plain `ColorMode` or a `Signal<ColorMode>`. The `matchMedia` listener
 * is attached via an `effect()` only while in `'system'` mode and is cleaned up via the
 * effect's `onCleanup` (and on destroy via `DestroyRef`). Guards `window`/`matchMedia` for SSR.
 *
 * Must be called in an injection context.
 *
 * @internal
 * @param colorMode - The color mode to use (`'dark'`, `'light'` or `'system'`).
 * @returns A `Signal<ColorModeClass>`.
 */
export function useColorModeClass(colorMode: ValueOrSignal<ColorMode>): Signal<ColorModeClass> {
  const read = (): ColorMode => (isSignal(colorMode) ? colorMode() : colorMode);

  const colorModeClass = signal<ColorModeClass | null>(read() === 'system' ? null : (read() as ColorModeClass));

  effect((onCleanup) => {
    const mode = read();

    if (mode !== 'system') {
      colorModeClass.set(mode);
      return;
    }

    const mediaQuery = getMediaQuery();
    const updateColorModeClass = () => colorModeClass.set(mediaQuery?.matches ? 'dark' : 'light');

    updateColorModeClass();
    mediaQuery?.addEventListener('change', updateColorModeClass);

    onCleanup(() => {
      mediaQuery?.removeEventListener('change', updateColorModeClass);
    });
  });

  return computed<ColorModeClass>(() => {
    const cls = colorModeClass();
    return cls !== null ? cls : getMediaQuery()?.matches ? 'dark' : 'light';
  });
}
