import { useThrottleValue } from '@/hooks/useThrottleValue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('useThrottleValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('throttles rapid value updates across wait window and exposes controller', async () => {
    const { result, rerender, act } = await renderHook((val: number = 1) =>
      useThrottleValue(val, 100),
    );

    expect(result.current[0]).toBe(1);

    await rerender(2);
    expect(result.current[0]).toBe(2);

    await rerender(3);
    expect(result.current[0]).toBe(2);
    expect(result.current[1].isPending()).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current[0]).toBe(3);


    const {
      result: trailingOnly,
      rerender: rerenderTrailing,
      act: actTrailing,
    } = await renderHook((val: string = 'a') =>
      useThrottleValue(val, 100, { leading: false }),
    );

    await rerenderTrailing('b');
    expect(trailingOnly.current[0]).toBe('a');

    await actTrailing(async () => {
      trailingOnly.current[1].flush();
    });
    expect(trailingOnly.current[0]).toBe('b');
  });
});
