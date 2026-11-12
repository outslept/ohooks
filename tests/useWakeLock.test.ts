import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { useWakeLock } from '@/hooks/useWakeLock';

describe('useWakeLock', () => {
  const originalWakeLock = Object.getOwnPropertyDescriptor(navigator, 'wakeLock');

  afterEach(() => {
    if (originalWakeLock) {
      Object.defineProperty(navigator, 'wakeLock', originalWakeLock);
    } else {
      delete (navigator as unknown as Record<string, unknown>).wakeLock;
    }
    vi.restoreAllMocks();
  });

  it('acquires screen wake lock, handles release event, and releases on disable/unmount', async () => {
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');

    const createSentinel = () => {
      const sentinel = Object.assign(new EventTarget(), {
        released: false,
        type: 'screen' as const,
        onrelease: null,
        release: vi.fn(async () => {
          sentinel.released = true;
          sentinel.dispatchEvent(new Event('release'));
        }),
      });
      return sentinel;
    };

    const sentinel = createSentinel();
    const request = vi.fn().mockResolvedValue(sentinel);

    Object.defineProperty(navigator, 'wakeLock', {
      value: { request },
      configurable: true,
    });

    const { result, rerender } = await renderHook((enabled: boolean = true) =>
      useWakeLock(enabled)
    );

    await vi.waitFor(() => {
      expect(result.current.isLocked).toBe(true);
    });
    expect(result.current.isSupported).toBe(true);
    expect(request).toHaveBeenCalledWith('screen');

    await rerender(false);
    await vi.waitFor(() => {
      expect(result.current.isLocked).toBe(false);
    });
    expect(sentinel.release).toHaveBeenCalledTimes(1);
  });
});
