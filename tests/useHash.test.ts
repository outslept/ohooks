import { useHash } from '@/hooks/useHash';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useHash', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', window.location.pathname);
  });

  afterEach(() => {
    window.history.replaceState(null, '', window.location.pathname);
    vi.restoreAllMocks();
  });

  it('normalizes hashes, uses pushState or replaceState, skips duplicate updates, and syncs across hooks', async () => {
    const pushSpy = vi.spyOn(window.history, 'pushState');
    const replaceSpy = vi.spyOn(window.history, 'replaceState');

    const { result: hookA, act } = await renderHook(() => useHash());
    const { result: hookB } = await renderHook(() => useHash());

    expect(hookA.current[0]).toBe('');
    expect(hookB.current[0]).toBe('');

    await act(async () => {
      hookA.current[1]('section-1');
    });
    expect(hookA.current[0]).toBe('#section-1');
    expect(hookB.current[0]).toBe('#section-1');
    expect(window.location.hash).toBe('#section-1');
    expect(pushSpy).toHaveBeenCalledTimes(1);


    await act(async () => {
      hookA.current[1]('#section-1');
    });
    expect(pushSpy).toHaveBeenCalledTimes(1);


    await act(async () => {
      hookA.current[1]('#section-2', { replace: true });
    });
    expect(hookA.current[0]).toBe('#section-2');
    expect(replaceSpy).toHaveBeenCalledTimes(1);


    await act(async () => {
      hookA.current[1]('#');
    });
    expect(hookA.current[0]).toBe('');
    expect(hookB.current[0]).toBe('');


    await act(async () => {
      window.location.hash = '#external';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(hookA.current[0]).toBe('#external');
    expect(hookB.current[0]).toBe('#external');
  });
});
