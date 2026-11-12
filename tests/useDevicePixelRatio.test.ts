import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { useDevicePixelRatio } from '@/hooks/useDevicePixelRatio';

describe('useDevicePixelRatio', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reads window.devicePixelRatio and updates when resolution media query changes', async () => {
    let changeHandler: (() => void) | null = null;

    vi.spyOn(window, 'devicePixelRatio', 'get').mockReturnValue(1);
    vi.spyOn(window, 'matchMedia').mockImplementation(((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: (_type: string, cb: () => void) => {
        changeHandler = cb;
      },
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia);

    const { result, act } = await renderHook(() =>
      useDevicePixelRatio({ defaultValue: 1 })
    );

    expect(result.current).toBe(1);

    await act(async () => {
      vi.spyOn(window, 'devicePixelRatio', 'get').mockReturnValue(2);
      changeHandler?.();
    });

    expect(result.current).toBe(2);
  });
});
