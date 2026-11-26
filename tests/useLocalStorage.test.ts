import { useLocalStorage } from '@/hooks/useLocalStorage';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('reads initial value, persists updates, syncs across same-tab instances and key changes, and removes key', async () => {
    window.localStorage.setItem('other-key', JSON.stringify({ count: 42 }));

    const { result: hookA, rerender: rerenderA, act } = await renderHook(
      (props?: { key: string }) =>
        useLocalStorage(props?.key ?? 'test-key', () => ({ count: 1 })),
      { initialProps: { key: 'test-key' } }
    );
    const { result: hookB } = await renderHook(() =>
      useLocalStorage('test-key', { count: 0 })
    );

    expect(hookA.current[0]).toEqual({ count: 1 });
    expect(hookB.current[0]).toEqual({ count: 0 });

    await act(async () => {
      hookA.current[1]((prev) => ({ count: prev.count + 4 }));
    });
    expect(hookA.current[0]).toEqual({ count: 5 });
    expect(hookB.current[0]).toEqual({ count: 5 });
    expect(window.localStorage.getItem('test-key')).toBe('{"count":5}');

    await act(async () => {
      hookA.current[2]();
    });
    expect(hookA.current[0]).toEqual({ count: 1 });
    expect(hookB.current[0]).toEqual({ count: 0 });
    expect(window.localStorage.getItem('test-key')).toBeNull();


    await rerenderA({ key: 'other-key' });
    expect(hookA.current[0]).toEqual({ count: 42 });
  });

  it('reacts to cross-tab window StorageEvents and ignores unrelated keys or storage areas', async () => {
    const { result, act } = await renderHook(() =>
      useLocalStorage('sync-key', 'initial')
    );


    await act(async () => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'different-key',
          newValue: JSON.stringify('ignored'),
          storageArea: window.localStorage,
        })
      );
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'sync-key',
          newValue: JSON.stringify('ignored-session'),
          storageArea: window.sessionStorage,
        })
      );
    });
    expect(result.current[0]).toBe('initial');


    await act(async () => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'sync-key',
          newValue: JSON.stringify('from-other-tab'),
          storageArea: window.localStorage,
        })
      );
    });
    expect(result.current[0]).toBe('from-other-tab');


    await act(async () => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: null,
          newValue: null,
          storageArea: window.localStorage,
        })
      );
    });
    expect(result.current[0]).toBe('initial');
  });

  it('supports custom serializer/deserializer and reports parse errors via onError', async () => {
    const onError = vi.fn();
    window.localStorage.setItem('bad-json', '{invalid');

    const { result: badResult } = await renderHook(() =>
      useLocalStorage('bad-json', 'fallback', { onError })
    );
    expect(badResult.current[0]).toBe('fallback');
    expect(onError).toHaveBeenCalled();

    const { result: customResult, act } = await renderHook(() =>
      useLocalStorage('custom-num', 10, {
        serializer: (v) => `num:${v}`,
        deserializer: (raw) => Number(raw.replace('num:', '')),
      })
    );

    await act(async () => {
      customResult.current[1](25);
    });
    expect(window.localStorage.getItem('custom-num')).toBe('num:25');
    expect(customResult.current[0]).toBe(25);
  });
});
