import {
  StorageOptions,
  UseStorageReturn,
  useWebStorage,
} from './useLocalStorage';

/** Configuration options for `useSessionStorage`. */
export type UseSessionStorageOptions<T> = StorageOptions<T>;

/**
 * Persists reactive state in `window.sessionStorage` with automatic serialization and synchronization.
 *
 * @category Storage
 * @param key - The `sessionStorage` key to read and write
 * @param initialValue - Fallback initial value or lazy initializer
 * @param options - Custom serializer, deserializer, and error handler options
 * @returns A tuple of `[value, setValue, removeValue]`
 *
 * @example
 * ```tsx
 * const [draft, setDraft, clearDraft] = useSessionStorage('form-draft', '');
 * ```
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: UseSessionStorageOptions<T> = {}
): UseStorageReturn<T> {
  return useWebStorage('sessionStorage', key, initialValue, options);
}

export default useSessionStorage;
