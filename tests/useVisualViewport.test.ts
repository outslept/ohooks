import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { useVisualViewport } from '@/hooks/useVisualViewport';

describe('useVisualViewport', () => {
  const originalVisualViewport = Object.getOwnPropertyDescriptor(window, 'visualViewport');

  afterEach(() => {
    if (originalVisualViewport) {
      Object.defineProperty(window, 'visualViewport', originalVisualViewport);
    }
    vi.restoreAllMocks();
  });

  it('tracks visualViewport resize and scroll events when supported', async () => {
    const mockVv = Object.assign(new EventTarget(), {
      width: 1024,
      height: 768,
      offsetLeft: 0,
      offsetTop: 0,
      pageLeft: 0,
      pageTop: 0,
      scale: 1,
    });

    Object.defineProperty(window, 'visualViewport', {
      value: mockVv,
      configurable: true,
    });

    const { result, act } = await renderHook(() => useVisualViewport());

    expect(result.current.isSupported).toBe(true);
    expect(result.current.width).toBe(1024);
    expect(result.current.scale).toBe(1);

    await act(async () => {
      mockVv.width = 512;
      mockVv.scale = 2;
      mockVv.dispatchEvent(new Event('resize'));
    });

    expect(result.current.width).toBe(512);
    expect(result.current.scale).toBe(2);
  });

  it('falls back to window dimensions when visualViewport is unavailable', async () => {
    Object.defineProperty(window, 'visualViewport', {
      value: null,
      configurable: true,
    });

    const { result } = await renderHook(() => useVisualViewport());

    expect(result.current.isSupported).toBe(false);
    expect(result.current.width).toBe(window.innerWidth);
    expect(result.current.height).toBe(window.innerHeight);
  });
});
