import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { useScreenOrientation } from '@/hooks/useScreenOrientation';

describe('useScreenOrientation', () => {
  const originalOrientation = Object.getOwnPropertyDescriptor(window.screen, 'orientation');

  afterEach(() => {
    if (originalOrientation) {
      Object.defineProperty(window.screen, 'orientation', originalOrientation);
    }
    vi.restoreAllMocks();
  });

  it('reads screen.orientation, updates on change, and delegates lock/unlock', async () => {
    const lock = vi.fn().mockResolvedValue(undefined);
    const unlock = vi.fn();

    const mockOrientation = Object.assign(new EventTarget(), {
      type: 'landscape-primary' as OrientationType,
      angle: 90,
      lock,
      unlock,
    });

    Object.defineProperty(window.screen, 'orientation', {
      value: mockOrientation,
      configurable: true,
    });

    const { result, act } = await renderHook(() => useScreenOrientation());

    expect(result.current.isSupported).toBe(true);
    expect(result.current.type).toBe('landscape-primary');
    expect(result.current.angle).toBe(90);

    await act(async () => {
      mockOrientation.type = 'portrait-primary';
      mockOrientation.angle = 0;
      mockOrientation.dispatchEvent(new Event('change'));
    });

    expect(result.current.type).toBe('portrait-primary');
    expect(result.current.angle).toBe(0);

    await act(async () => {
      await result.current.lock('portrait');
      result.current.unlock();
    });

    expect(lock).toHaveBeenCalledWith('portrait');
    expect(unlock).toHaveBeenCalledTimes(1);
  });
});
