import { useSwipe, type UseSwipeOptions } from '@/hooks/useSwipe';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('useSwipe', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('detects all 4 directions, respects threshold, and invokes lifecycle callbacks', async () => {
    const area = document.createElement('div');
    document.body.appendChild(area);

    const onSwipeStart = vi.fn();
    const onSwipe = vi.fn();
    const onSwipeEnd = vi.fn();
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    const onSwipeUp = vi.fn();
    const onSwipeDown = vi.fn();

    const { result, act } = await renderHook(() =>
      useSwipe(area, {
        threshold: 40,
        preventDefault: true,
        onSwipeStart,
        onSwipe,
        onSwipeEnd,
        onSwipeLeft,
        onSwipeRight,
        onSwipeUp,
        onSwipeDown,
      }),
    );


    await act(async () => {
      area.dispatchEvent(
        new PointerEvent('pointerdown', {
          pointerId: 1,
          clientX: 200,
          clientY: 100,
        }),
      );

      area.dispatchEvent(
        new PointerEvent('pointerdown', {
          pointerId: 99,
          clientX: 0,
          clientY: 0,
        }),
      );

      window.dispatchEvent(
        new PointerEvent('pointermove', {
          pointerId: 1,
          clientX: 190,
          clientY: 100,
        }),
      );
    });

    expect(onSwipeStart).toHaveBeenCalledTimes(1);
    expect(result.current.isSwiping).toBe(true);
    expect(result.current.direction).toBe('none');
    expect(onSwipe).not.toHaveBeenCalled();

    await act(async () => {
      const moveEvent = new PointerEvent('pointermove', {
        pointerId: 1,
        clientX: 120,
        clientY: 105,
        cancelable: true,
      });
      window.dispatchEvent(moveEvent);
      expect(moveEvent.defaultPrevented).toBe(true);
    });

    expect(result.current.direction).toBe('left');
    expect(result.current.lengthX).toBe(80);
    expect(onSwipe).toHaveBeenCalledTimes(1);


    await act(async () => {
      window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 99 }));
    });
    expect(result.current.isSwiping).toBe(true);

    await act(async () => {
      window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1 }));
    });
    expect(result.current.isSwiping).toBe(false);
    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    expect(onSwipeEnd).toHaveBeenCalledTimes(1);


    await act(async () => {
      area.dispatchEvent(
        new PointerEvent('pointerdown', { pointerId: 2, clientX: 50, clientY: 50 }),
      );
      window.dispatchEvent(
        new PointerEvent('pointermove', { pointerId: 2, clientX: 110, clientY: 55 }),
      );
      window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 2 }));
    });
    expect(result.current.direction).toBe('right');
    expect(onSwipeRight).toHaveBeenCalledTimes(1);


    await act(async () => {
      area.dispatchEvent(
        new PointerEvent('pointerdown', { pointerId: 3, clientX: 50, clientY: 150 }),
      );
      window.dispatchEvent(
        new PointerEvent('pointermove', { pointerId: 3, clientX: 55, clientY: 80 }),
      );
      window.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 3 }));
    });
    expect(result.current.direction).toBe('up');
    expect(result.current.isSwiping).toBe(false);
    expect(onSwipeUp).toHaveBeenCalledTimes(1);


    await act(async () => {
      area.dispatchEvent(
        new PointerEvent('pointerdown', { pointerId: 4, clientX: 100, clientY: 50 }),
      );
      window.dispatchEvent(
        new PointerEvent('pointermove', { pointerId: 4, clientX: 105, clientY: 130 }),
      );
      window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 4 }));
    });
    expect(result.current.direction).toBe('down');
    expect(onSwipeDown).toHaveBeenCalledTimes(1);
  });

  it('does not attach listeners when enabled is false and cleans up on unmount', async () => {
    const area = document.createElement('div');
    document.body.appendChild(area);
    const onSwipeStart = vi.fn();

    const { rerender, unmount, act } = await renderHook(
      (props?: UseSwipeOptions) => useSwipe(area, props),
      { initialProps: { enabled: false, onSwipeStart } },
    );

    await act(async () => {
      area.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1 }));
    });
    expect(onSwipeStart).not.toHaveBeenCalled();

    await rerender({ enabled: true, onSwipeStart });
    await unmount();

    await act(async () => {
      area.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1 }));
    });
    expect(onSwipeStart).not.toHaveBeenCalled();
  });
});
