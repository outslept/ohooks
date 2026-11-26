import { useSessionStorage } from '@/hooks/useSessionStorage';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('useSessionStorage', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    window.sessionStorage.clear();
  });

  it('stores, updates via value or updater, syncs across hooks, and removes values', async () => {
    const { result: hookA, act } = await renderHook(() =>
      useSessionStorage('session-key', () => 'alpha'),
    );
    const { result: hookB } = await renderHook(() =>
      useSessionStorage('session-key', 'fallback'),
    );

    expect(hookA.current[0]).toBe('alpha');

    await act(async () => {
      hookA.current[1]('beta');
    });
    expect(hookA.current[0]).toBe('beta');
    expect(hookB.current[0]).toBe('beta');
    expect(window.sessionStorage.getItem('session-key')).toBe('"beta"');

    await act(async () => {
      hookA.current[1]((prev) => `${prev}-gamma`);
    });
    expect(hookA.current[0]).toBe('beta-gamma');
    expect(hookB.current[0]).toBe('beta-gamma');

    await act(async () => {
      hookB.current[2]();
    });
    expect(hookA.current[0]).toBe('alpha');
    expect(hookB.current[0]).toBe('fallback');
    expect(window.sessionStorage.getItem('session-key')).toBeNull();
  });

  it('supports custom serializer/deserializer and invokes onError on invalid stored data', async () => {
    window.sessionStorage.setItem('bad-json', '{corrupted');
    const onError = vi.fn();

    const { result } = await renderHook(() =>
      useSessionStorage('bad-json', 42, { onError }),
    );

    expect(result.current[0]).toBe(42);
    expect(onError).toHaveBeenCalled();

    const { result: customResult, act } = await renderHook(() =>
      useSessionStorage('custom-key', 10, {
        serializer: (v) => `num:${v}`,
        deserializer: (raw) => Number(raw.replace('num:', '')),
      }),
    );

    await act(async () => {
      customResult.current[1](25);
    });
    expect(window.sessionStorage.getItem('custom-key')).toBe('num:25');
    expect(customResult.current[0]).toBe(25);
  });
});
