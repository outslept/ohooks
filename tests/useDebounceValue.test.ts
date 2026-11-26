import { useDebounceValue } from '@/hooks/useDebounceValue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useDebounceValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces value changes and supports flush, cancel, and manual setter calls', async () => {
    const { result, rerender, act } = await renderHook(
      (props?: { val: string }) =>
        useDebounceValue(props?.val ?? 'init', 100),
      { initialProps: { val: 'init' } },
    );

    expect(result.current[0]).toBe('init');
    expect(result.current[1].isPending()).toBe(false);

    await rerender({ val: 'next' });
    expect(result.current[0]).toBe('init');
    expect(result.current[1].isPending()).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current[0]).toBe('next');
    expect(result.current[1].isPending()).toBe(false);


    await rerender({ val: 'cancelled' });
    await act(async () => {
      result.current[1].cancel();
      vi.advanceTimersByTime(100);
    });
    expect(result.current[0]).toBe('next');


    await rerender({ val: 'flushed' });
    await act(async () => {
      result.current[1].flush();
    });
    expect(result.current[0]).toBe('flushed');


    await act(async () => {
      result.current[1]('manual');
      vi.advanceTimersByTime(100);
    });
    expect(result.current[0]).toBe('manual');
  });

  it('forwards debounce options such as leading: true', async () => {
    const { result, rerender } = await renderHook(
      (props?: { val: string }) =>
        useDebounceValue(props?.val ?? 'a', 100, { leading: true }),
      { initialProps: { val: 'a' } },
    );

    await rerender({ val: 'b' });
    expect(result.current[0]).toBe('b');
  });
});
