import {
  StorageOptions,
  UseStorageReturn,
  useWebStorage,
} from './useLocalStorage';

export type UseSessionStorageOptions<T> = StorageOptions<T>;

export function useSessionStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options: UseSessionStorageOptions<T> = {}
): UseStorageReturn<T> {
  return useWebStorage('sessionStorage', key, initialValue, options);
}

export default useSessionStorage;
