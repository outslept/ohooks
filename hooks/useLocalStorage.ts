import { type Dispatch, type SetStateAction, useRef, useState } from 'react';
import { useEventCallback } from './useEventCallback';
import { useEventListener } from './useEventListener';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { useUpdateEffect } from './useUpdateEffect';

export interface UseLocalStorageOptions<T> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  initializeWithValue?: boolean;
}

interface CustomStorageEventDetail {
  key: string;
  source: object;
}

const CUSTOM_STORAGE_EVENT = 'custom-local-storage';

export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: UseLocalStorageOptions<T> = {},
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const { initializeWithValue = true } = options;
  const instanceId = useRef<object>({});

  const resolveInitialValue = (): T =>
    typeof initialValue === 'function'
      ? (initialValue as () => T)()
      : initialValue;

  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return resolveInitialValue();
    }

    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        return options.deserializer
          ? options.deserializer(raw)
          : (JSON.parse(raw) as T);
      }
    } catch {
      return resolveInitialValue();
    }

    return resolveInitialValue();
  };

  const [storedValue, setStoredValue] = useState<T>(() =>
    initializeWithValue ? readValue() : resolveInitialValue(),
  );

  const currentValueRef = useRef<T>(storedValue);

  useIsomorphicLayoutEffect(() => {
    currentValueRef.current = storedValue;
  });

  const syncFromStorage = useEventCallback(() => {
    const next = readValue();
    currentValueRef.current = next;
    setStoredValue(next);
  });

  useIsomorphicLayoutEffect(() => {
    if (!initializeWithValue) {
      syncFromStorage();
    }
  }, []);

  useUpdateEffect(() => {
    syncFromStorage();
  }, [key]);

  const setValue: Dispatch<SetStateAction<T>> = useEventCallback((value) => {
    const nextValue =
      typeof value === 'function'
        ? (value as (prevState: T) => T)(currentValueRef.current)
        : value;

    currentValueRef.current = nextValue;
    setStoredValue(nextValue);

    if (typeof window !== 'undefined') {
      let persisted = false;
      try {
        const serialized = options.serializer
          ? options.serializer(nextValue)
          : JSON.stringify(nextValue);

        if ((serialized as string | undefined) === undefined) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, serialized);
        }
        persisted = true;
      } catch {
        persisted = false;
      }

      if (persisted) {
        window.dispatchEvent(
          new CustomEvent<CustomStorageEventDetail>(CUSTOM_STORAGE_EVENT, {
            detail: { key, source: instanceId.current },
          }),
        );
      }
    }
  });

  const removeValue = useEventCallback(() => {
    const defaultValue = resolveInitialValue();
    currentValueRef.current = defaultValue;
    setStoredValue(defaultValue);

    if (typeof window !== 'undefined') {
      let removed = false;
      try {
        window.localStorage.removeItem(key);
        removed = true;
      } catch {
        removed = false;
      }

      if (removed) {
        window.dispatchEvent(
          new CustomEvent<CustomStorageEventDetail>(CUSTOM_STORAGE_EVENT, {
            detail: { key, source: instanceId.current },
          }),
        );
      }
    }
  });

  useEventListener('storage', (event: StorageEvent) => {
    if (event.storageArea !== null) {
      try {
        if (event.storageArea !== window.localStorage) {
          return;
        }
      } catch {
        return;
      }
    }

    if (event.key !== null && event.key !== key) {
      return;
    }

    if (event.newValue === null) {
      const defaultValue = resolveInitialValue();
      currentValueRef.current = defaultValue;
      setStoredValue(defaultValue);
      return;
    }

    let nextValue: T;
    try {
      nextValue = options.deserializer
        ? options.deserializer(event.newValue)
        : (JSON.parse(event.newValue) as T);
    } catch {
      nextValue = resolveInitialValue();
    }

    currentValueRef.current = nextValue;
    setStoredValue(nextValue);
  });

  useEventListener(
    CUSTOM_STORAGE_EVENT,
    (event: CustomEvent<CustomStorageEventDetail>) => {
      if (
        event.detail.key === key &&
        event.detail.source !== instanceId.current
      ) {
        syncFromStorage();
      }
    },
  );

  return [storedValue, setValue, removeValue];
}
