import { useWindowSize } from '@/hooks/useWindowSize';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('useWindowSize', () => {
  const originalWidth = window.innerWidth;
  const originalHeight = window.innerHeight;

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: originalWidth,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      writable: true,
      value: originalHeight,
    });
  });

  it('reads current window dimensions, ignores unchanged resize events, and updates on resize', async () => {
    const { result, act } = await renderHook(() => useWindowSize());

    expect(result.current.width).toBe(originalWidth);
    expect(result.current.height).toBe(originalHeight);

    const initialRef = result.current;
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toBe(initialRef);

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1234,
    });
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.width).toBe(1234);
  });

  it('throttles resize updates when throttleMs > 0', async () => {
    vi.useFakeTimers();
    const { result, act } = await renderHook(() =>
      useWindowSize({ throttleMs: 100 }),
    );


    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1200,
    });
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.width).toBe(1200);


    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1440,
    });
    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.width).toBe(1200);

    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.width).toBe(1440);
  });
});
