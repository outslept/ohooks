import { useEventListener } from './useEventListener';

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
