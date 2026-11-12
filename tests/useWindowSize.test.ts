import { useWindowSize } from '@/hooks/useWindowSize';
import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useWindowSize', () => {
  it('reads current window dimensions and updates on resize event', async () => {
    const { result } = await renderHook(() => useWindowSize());
    expect(result.current.width).toBe(window.innerWidth);
    expect(result.current.height).toBe(window.innerHeight);

    const originalWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1234,
    });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.width).toBe(1234);

    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: originalWidth,
    });
  });
});
