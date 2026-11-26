import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { useEventCallback } from "./useEventCallback";
import { useHydrated } from "./useHydrated";
import { useLatest } from "./useLatest";

export interface StorageOptions<T> {
  /** Custom serializer function (default: `JSON.stringify`) */
  serializer?: (value: T) => string;
  /** Custom deserializer function (default: `JSON.parse`) */
  deserializer?: (value: string) => T;
  /** Read from storage immediately on initial client render (default: `true`) */
  initializeWithValue?: boolean;
  /** Callback invoked when reading, writing, or parsing storage throws an error */
  onError?: (error: unknown) => void;
}

export type UseLocalStorageOptions<T> = StorageOptions<T>;

export type UseStorageReturn<T> = [
  value: T,
  setValue: Dispatch<SetStateAction<T>>,
  removeValue: () => void,
];

const CUSTOM_STORAGE_EVENT = "custom-web-storage-change";

interface CustomStorageEventDetail {
  key: string;
  newValue: string | null;
  storageArea: Storage;
}

function resolveInitial<T>(initialValue: T | (() => T)): T {
  return typeof initialValue === "function" ? (initialValue as () => T)() : initialValue;
}

export function useWebStorage<T>(
  storageType: "localStorage" | "sessionStorage",
  key: string,
  initialValue: T | (() => T),
  options: StorageOptions<T> = {},
): UseStorageReturn<T> {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    initializeWithValue = true,
    onError,
  } = options;

  const isHydrated = useHydrated();
  const serializerRef = useLatest(serializer);
  const deserializerRef = useLatest(deserializer);
  const initialValueRef = useLatest(initialValue);
  const onErrorRef = useLatest(onError);

  const getStorage = useCallback((): Storage | null => {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      return window[storageType];
    } catch (error) {
      onErrorRef.current?.(error);
      return null;
    }
  }, [storageType, onErrorRef]);

  const readValue = useCallback((): T => {
    const fallback = resolveInitial(initialValueRef.current);
    const storage = getStorage();
    if (!storage) {
      return fallback;
    }

    try {
      const raw = storage.getItem(key);
      if (raw === null) {
        return fallback;
      }
      return deserializerRef.current(raw);
    } catch (error) {
      onErrorRef.current?.(error);
      return fallback;
    }
  }, [getStorage, key, initialValueRef, deserializerRef, onErrorRef]);

  const [storedValue, setStoredValue] = useState<T>(() => {
    const fallback = resolveInitial(initialValue);
    if (!initializeWithValue || typeof window === "undefined") {
      return fallback;
    }

    try {
      const storage = window[storageType];
      if (!storage) {
        return fallback;
      }
      const raw = storage.getItem(key);
      if (raw === null) {
        return fallback;
      }
      return deserializer(raw);
    } catch (error) {
      onError?.(error);
      return fallback;
    }
  });

  useEffect(() => {
    const syncStoredValue = () => {
      setStoredValue(readValue());
    };
    syncStoredValue();
  }, [key, readValue]);

  const setValue: Dispatch<SetStateAction<T>> = useEventCallback((value: SetStateAction<T>) => {
    try {
      const currentValue = isHydrated ? storedValue : readValue();
      const nextValue =
        typeof value === "function" ? (value as (prevState: T) => T)(currentValue) : value;

      setStoredValue(nextValue);

      const storage = getStorage();
      if (storage) {
        const serialized = serializerRef.current(nextValue);
        storage.setItem(key, serialized);
        window.dispatchEvent(
          new CustomEvent<CustomStorageEventDetail>(CUSTOM_STORAGE_EVENT, {
            detail: {
              key,
              newValue: serialized,
              storageArea: storage,
            },
          }),
        );
      }
    } catch (error) {
      onErrorRef.current?.(error);
    }
  });

  const removeValue = useEventCallback(() => {
    try {
      const fallback = resolveInitial(initialValueRef.current);
      setStoredValue(fallback);

      const storage = getStorage();
      if (storage) {
        storage.removeItem(key);
        window.dispatchEvent(
          new CustomEvent<CustomStorageEventDetail>(CUSTOM_STORAGE_EVENT, {
            detail: {
              key,
              newValue: null,
              storageArea: storage,
            },
          }),
        );
      }
    } catch (error) {
      onErrorRef.current?.(error);
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storage = getStorage();
    if (!storage) {
      return;
    }

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.storageArea !== storage) return;
      if (event.key !== key && event.key !== null) return;

      if (event.key === null || event.newValue === null) {
        setStoredValue(resolveInitial(initialValueRef.current));
        return;
      }

      try {
        setStoredValue(deserializerRef.current(event.newValue));
      } catch (error) {
        onErrorRef.current?.(error);
      }
    };

    const handleCustomEvent = (event: Event) => {
      const customEvent = event as CustomEvent<CustomStorageEventDetail>;
      const detail = customEvent.detail;
      if (!detail || detail.storageArea !== storage || detail.key !== key) {
        return;
      }

      if (detail.newValue === null) {
        setStoredValue(resolveInitial(initialValueRef.current));
        return;
      }

      try {
        setStoredValue(deserializerRef.current(detail.newValue));
      } catch (error) {
        onErrorRef.current?.(error);
      }
    };

    window.addEventListener("storage", handleStorageEvent);
    window.addEventListener(CUSTOM_STORAGE_EVENT, handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorageEvent);
      window.removeEventListener(CUSTOM_STORAGE_EVENT, handleCustomEvent);
    };
  }, [key, getStorage, initialValueRef, deserializerRef, onErrorRef]);

  return [storedValue, setValue, removeValue];
}

/**
 * Persists and synchronizes state with `window.localStorage` across components and browser tabs.
 *
 * @category Storage
 * @param key - `localStorage` key to read and write
 * @param initialValue - Fallback initial value or lazy initializer function
 * @param options - Custom serialization, SSR initialization, and error handling options
 * @returns Tuple of `[storedValue, setValue, removeValue]`
 *
 * @example
 * ```tsx
 * const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: UseLocalStorageOptions<T> = {},
): UseStorageReturn<T> {
  return useWebStorage("localStorage", key, initialValue, options);
}

export default useLocalStorage;
