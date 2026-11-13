import { useEventListener } from './useEventListener';

/**
 * Prompts the user with a confirmation dialog before leaving or reloading the page.
 *
 * @category Browser
 * @param enabled - Whether the prompt is active, or a predicate function evaluated before unload (default: `true`)
 * @param message - Optional custom message (ignored by most modern browsers)
 *
 * @example
 * ```tsx
 * useBeforeUnload(isDirty, 'You have unsaved changes. Are you sure you want to leave?');
 * ```
 */
export function useBeforeUnload(
  enabled: boolean | (() => boolean) = true,
  message?: string,
): void {
  const shouldAttach = Boolean(enabled);
  const target =
    shouldAttach && typeof window !== 'undefined' ? window : null;

  useEventListener(
    'beforeunload',
    (event: BeforeUnloadEvent) => {
      const isEnabled =
        typeof enabled === 'function' ? enabled() : enabled;

      if (!isEnabled) {
        return;
      }

      event.preventDefault();
      const returnValue = message ?? '';
      event.returnValue = returnValue;
      return returnValue;
    },
    target,
  );
}
