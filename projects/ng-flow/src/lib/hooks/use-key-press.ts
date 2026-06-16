import { computed, effect, isSignal, signal, type Signal } from '@angular/core';
import { isInputDOMNode, type KeyCode } from '@xyflow/system';

type Keys = Array<string>;
type PressedKeys = Set<string>;
type KeyOrCode = 'key' | 'code';

export type UseKeyPressOptions = {
  /**
   * Listen to key presses on a specific element.
   * @default document
   */
  target?: Window | Document | HTMLElement | ShadowRoot | null;
  /**
   * You can use this flag to prevent triggering the key press hook when an input field is focused.
   * @default true
   */
  actInsideInputWithModifier?: boolean;
  preventDefault?: boolean;
};

const defaultDoc = typeof document !== 'undefined' ? document : null;

/** Accept either a plain value or a `Signal` of it. */
type ValueOrSignal<T> = T | Signal<T>;

function read<T>(source: ValueOrSignal<T>): T {
  return isSignal(source) ? source() : source;
}

/**
 * Listen for specific key codes and get a `Signal<boolean>` telling you whether they are
 * currently pressed. The ng-flow port of React Flow's `useKeyPress`.
 *
 * `keyCode` and `options` may be plain values **or** `Signal`s — when a signal is passed,
 * the listeners are re-attached reactively via an `effect()` as the value changes. The
 * combo/array parsing, modifier tracking, input-field suppression and blur/contextmenu
 * reset all match the React source. The pressed-keys `Set`s are plain (non-reactive)
 * closure variables (React's refs); only the boolean result is a signal. Listener cleanup
 * is automatic via the surrounding `DestroyRef`.
 *
 * Must be called in an injection context inside a flow.
 *
 * @public
 * @param keyCode - A single key (`'a'`), a combination (`'Meta+s'`), or an array of either.
 * @param options - {@link UseKeyPressOptions}.
 * @returns A `Signal<boolean>` of whether the key(s) are pressed.
 *
 * @example
 * ```ts
 * readonly spacePressed = useKeyPress('Space');
 * readonly cmdAndSPressed = useKeyPress(['Meta+s', 'Strg+s']);
 * ```
 */
export function useKeyPress(
  keyCode: ValueOrSignal<KeyCode | null> = null,
  options: ValueOrSignal<UseKeyPressOptions> = { target: defaultDoc, actInsideInputWithModifier: true }
): Signal<boolean> {
  const keyPressed = signal(false);

  // React's `useRef` — non-reactive imperative state, so plain closure variables.
  let modifierPressed = false;
  const pressedKeys: PressedKeys = new Set([]);

  /*
   * keyCodes = array with single keys [['a']] or key combinations [['a', 's']]
   * keysToWatch = array with all keys flattened ['a', 'd', 'ShiftLeft']
   */
  const parsed = computed<[Array<Keys>, Keys]>(() => {
    const kc = read(keyCode);
    if (kc !== null) {
      const keyCodeArr = Array.isArray(kc) ? kc : [kc];
      const keys = keyCodeArr
        .filter((k) => typeof k === 'string')
        /*
         * we first replace all '+' with '\n'  which we will use to split the keys on
         * then we replace '\n\n' with '\n+', this way we can also support the combination 'key++'
         * in the end we simply split on '\n' to get the key array
         */
        .map((k) => k.replace('+', '\n').replace('\n\n', '\n+').split('\n'));
      const keysFlat = keys.reduce((res: Keys, item) => res.concat(...item), []);

      return [keys, keysFlat];
    }

    return [[], []];
  });

  effect((onCleanup) => {
    const kc = read(keyCode);
    const opts = read(options);
    const [keyCodes, keysToWatch] = parsed();

    const target = opts?.target ?? defaultDoc;
    const actInsideInputWithModifier = opts?.actInsideInputWithModifier ?? true;

    if (kc === null) {
      return;
    }

    const downHandler = (event: KeyboardEvent) => {
      modifierPressed = event.ctrlKey || event.metaKey || event.shiftKey || event.altKey;
      const preventAction =
        (!modifierPressed || (modifierPressed && !actInsideInputWithModifier)) && isInputDOMNode(event);

      if (preventAction) {
        return false;
      }
      const keyOrCode = useKeyOrCode(event.code, keysToWatch);
      pressedKeys.add(event[keyOrCode]);

      if (isMatchingKey(keyCodes, pressedKeys, false)) {
        const eventTarget = (event.composedPath?.()?.[0] || event.target) as Element | null;
        const isInteractiveElement = eventTarget?.nodeName === 'BUTTON' || eventTarget?.nodeName === 'A';

        if (opts.preventDefault !== false && (modifierPressed || !isInteractiveElement)) {
          event.preventDefault();
        }

        keyPressed.set(true);
      }

      return undefined;
    };

    const upHandler = (event: KeyboardEvent) => {
      const keyOrCode = useKeyOrCode(event.code, keysToWatch);

      if (isMatchingKey(keyCodes, pressedKeys, true)) {
        keyPressed.set(false);
        pressedKeys.clear();
      } else {
        pressedKeys.delete(event[keyOrCode]);
      }

      // fix for Mac: when cmd key is pressed, keyup is not triggered for any other key, see: https://stackoverflow.com/questions/27380018/when-cmd-key-is-kept-pressed-keyup-is-not-triggered-for-any-other-key
      if (event.key === 'Meta') {
        pressedKeys.clear();
      }

      modifierPressed = false;
    };

    const resetHandler = () => {
      pressedKeys.clear();
      keyPressed.set(false);
    };

    target?.addEventListener('keydown', downHandler as EventListenerOrEventListenerObject);
    target?.addEventListener('keyup', upHandler as EventListenerOrEventListenerObject);
    window.addEventListener('blur', resetHandler);
    window.addEventListener('contextmenu', resetHandler);

    onCleanup(() => {
      target?.removeEventListener('keydown', downHandler as EventListenerOrEventListenerObject);
      target?.removeEventListener('keyup', upHandler as EventListenerOrEventListenerObject);
      window.removeEventListener('blur', resetHandler);
      window.removeEventListener('contextmenu', resetHandler);
    });
  });

  return keyPressed.asReadonly();
}

// utils

function isMatchingKey(keyCodes: Array<Keys>, pressedKeys: PressedKeys, isUp: boolean): boolean {
  return (
    keyCodes
      /*
       * we only want to compare same sizes of keyCode definitions
       * and pressed keys. When the user specified 'Meta' as a key somewhere
       * this would also be truthy without this filter when user presses 'Meta' + 'r'
       */
      .filter((keys) => isUp || keys.length === pressedKeys.size)
      /*
       * since we want to support multiple possibilities only one of the
       * combinations need to be part of the pressed keys
       */
      .some((keys) => keys.every((k) => pressedKeys.has(k)))
  );
}

function useKeyOrCode(eventCode: string, keysToWatch: KeyCode): KeyOrCode {
  return keysToWatch.includes(eventCode) ? 'code' : 'key';
}
