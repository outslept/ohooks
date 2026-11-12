import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { useMouse } from '@/hooks/useMouse';

describe('useMouse', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('tracks viewport, page, screen, and target-relative coordinates via rAF', async () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 1;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    const box = document.createElement('div');
    document.body.appendChild(box);
    vi.spyOn(box, 'getBoundingClientRect').mockReturnValue({
      left: 50,
      top: 100,
      width: 200,
      height: 100,
      right: 250,
      bottom: 200,
      x: 50,
      y: 100,
      toJSON: () => ({}),
    });

    const { result, act, unmount } = await renderHook(() => useMouse(box));

    await act(async () => {
      window.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: 120,
          clientY: 180,
          screenX: 300,
          screenY: 400,
        })
      );
    });

    expect(result.current.clientX).toBe(120);
    expect(result.current.clientY).toBe(180);
    expect(result.current.screenX).toBe(300);
    expect(result.current.screenY).toBe(400);
    expect(result.current.elementPositionX).toBe(50);
    expect(result.current.elementPositionY).toBe(100);
    expect(result.current.elementX).toBe(70);
    expect(result.current.elementY).toBe(80);

    await unmount();
  });

  it('cancels previous pending rAF when mousemove fires rapidly', async () => {
    let savedCallback: FrameRequestCallback | null = null;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      savedCallback = cb;
      return 42;
    });
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    const { result, act, unmount } = await renderHook(() => useMouse());

    await act(async () => {
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 20 }));
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 30, clientY: 40 }));
    });

    expect(cancelSpy).toHaveBeenCalledWith(42);

    await act(async () => {
      savedCallback?.(0);
    });

    expect(result.current.clientX).toBe(30);
    expect(result.current.clientY).toBe(40);

    await unmount();
  });
});
