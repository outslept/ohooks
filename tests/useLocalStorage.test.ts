import { useLocalStorage } from '@/hooks/useLocalStorage';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('reads initial value, persists updates, syncs across hook instances, and removes key', async () => {
    const { result: hookA } = await renderHook(() =>
      useLocalStorage('test-key', () => ({ count: 1 })),
    );
    const { result: hookB } = await renderHook(() =>
      useLocalStorage('test-key', { count: 0 }),
    );

    expect(hookA.current[0]).toEqual({ count: 1 });
    expect(hookB.current[0]).toEqual({ count: 0 });

    act(() => {
      hookA.current[1]((prev) => ({ count: prev.count + 4 }));
    });

    expect(hookA.current[0]).toEqual({ count: 5 });
    expect(hookB.current[0]).toEqual({ count: 5 });
    expect(window.localStorage.getItem('test-key')).toBe('{"count":5}');

    act(() => {
      hookA.current[2]();
    });

    expect(hookA.current[0]).toEqual({ count: 1 });
    expect(hookB.current[0]).toEqual({ count: 0 });
    expect(window.localStorage.getItem('test-key')).toBeNull();
  });

  it('handles custom serializer/deserializer and reports parse errors via onError', async () => {
    const onError = vi.fn();
    window.localStorage.setItem('bad-json', '{invalid');

    const { result } = await renderHook(() =>
      useLocalStorage('bad-json', 'fallback', { onError }),
    );
    expect(result.current[0]).toBe('fallback');
    expect(onError).toHaveBeenCalledTimes(2);
  });
});
