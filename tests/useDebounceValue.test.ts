import { useDebounceValue } from '@/hooks/useDebounceValue';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useDebounceValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('updates value after debounce delay and exposes controls', async () => {
    const { result, rerender } = await renderHook((val: string = 'init') =>
      useDebounceValue(val, 100),
    );
    expect(result.current[0]).toBe('init');

    await rerender('next');
    expect(result.current[0]).toBe('init');
    expect(result.current[1].isPending()).toBe(true);

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current[0]).toBe('next');

    await rerender('flushed');
    act(() => {
      result.current[1].flush();
    });
    expect(result.current[0]).toBe('flushed');
  });
});
