import { useSessionStorage } from '@/hooks/useSessionStorage';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useSessionStorage', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    window.sessionStorage.clear();
  });

  it('stores, updates, syncs, and removes values in sessionStorage', async () => {
    const { result: hookA, act } = await renderHook(() =>
      useSessionStorage('session-key', 'alpha'),
    );
    const { result: hookB } = await renderHook(() =>
      useSessionStorage('session-key', 'alpha'),
    );

    expect(hookA.current[0]).toBe('alpha');

    await act(async () => {
      hookA.current[1]('beta');
    });
    expect(hookA.current[0]).toBe('beta');
    expect(hookB.current[0]).toBe('beta');
    expect(window.sessionStorage.getItem('session-key')).toBe('"beta"');

    await act(async () => {
      hookB.current[2]();
    });
    expect(hookA.current[0]).toBe('alpha');
    expect(window.sessionStorage.getItem('session-key')).toBeNull();
  });
});
