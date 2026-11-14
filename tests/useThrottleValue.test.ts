import { useThrottleValue } from '@/hooks/useThrottleValue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useThrottleValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('throttles rapid value updates across wait window', async () => {
    const { result, rerender, act } = await renderHook((val: number = 1) =>
      useThrottleValue(val, 100),
    );

    expect(result.current[0]).toBe(1);

    await rerender(2);
    expect(result.current[0]).toBe(2);

    await rerender(3);
    expect(result.current[0]).toBe(2);

    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current[0]).toBe(3);
  });
});
