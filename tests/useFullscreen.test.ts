import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { useFullscreen } from '@/hooks/useFullscreen';

describe('useFullscreen', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('enters, exits, and toggles fullscreen and invokes lifecycle callbacks', async () => {
    const box = document.createElement('div');
    document.body.appendChild(box);

    let currentFsElement: Element | null = null;

    Object.defineProperty(document, 'fullscreenEnabled', {
      value: true,
      configurable: true,
    });
    Object.defineProperty(document, 'fullscreenElement', {
      get: () => currentFsElement,
      configurable: true,
    });

    box.requestFullscreen = vi.fn().mockImplementation(async () => {
      currentFsElement = box;
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    document.exitFullscreen = vi.fn().mockImplementation(async () => {
      currentFsElement = null;
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    const onEnter = vi.fn();
    const onExit = vi.fn();
    const onError = vi.fn();

    const { result, act } = await renderHook(() =>
      useFullscreen(box, { onEnter, onExit, onError })
    );

    expect(result.current.isSupported).toBe(true);
    expect(result.current.isFullscreen).toBe(false);

    await act(async () => {
      await result.current.enter();
    });
    expect(result.current.isFullscreen).toBe(true);
    expect(onEnter).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.toggle();
    });
    expect(result.current.isFullscreen).toBe(false);
    expect(onExit).toHaveBeenCalledTimes(1);

    box.requestFullscreen = vi.fn().mockRejectedValueOnce(new Error('Blocked'));
    await act(async () => {
      await result.current.enter();
    });
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
