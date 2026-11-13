import { EventListenerTarget } from "@/hooks/useEventListener";

export function isRefObject<T>(
  target: EventListenerTarget<T> | undefined
): target is { readonly current: T | null } {
  return (
    typeof target === 'object' &&
    target !== null &&
    'current' in target &&
    !('addEventListener' in target) &&
    !('nodeType' in target)
  );
}

export function resolveTargetElement<T>(
  target: EventListenerTarget<T> | undefined,
  fallback: T | null = null
): T | null {
  if (target === undefined) {
    return fallback;
  }
  if (target === null) {
    return null;
  }
  if (isRefObject(target)) {
    return target.current ?? null;
  }
  return target;
}
