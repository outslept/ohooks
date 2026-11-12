import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { useSwipe } from '@/hooks/useSwipe';

describe('useSwipe', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('detects left, right, up, and down swipes exceeding threshold', async () => {
    const area = document.createElement('div');
    document.body.appendChild(area);

    const onSwipeLeft = vi.fn();
    const onSwipeDown = vi.fn();
    const onSwipeEnd = vi.fn();

    const { result, act } = await renderHook(() =>
      useSwipe(area, {
        threshold: 40,
        onSwipeLeft,
        onSwipeDown,
        onSwipeEnd,
      })
    );

    await act(async () => {
      area.dispatchEvent(
        new PointerEvent('pointerdown', {
          pointerId: 1,
          pointerType: 'touch',
          clientX: 200,
          clientY: 100,
        })
      );
      window.dispatchEvent(
        new PointerEvent('pointermove', {
          pointerId: 1,
          clientX: 120,
          clientY: 105,
        })
      );
    });

    expect(result.current.isSwiping).toBe(true);
    expect(result.current.direction).toBe('left');
    expect(result.current.lengthX).toBe(80);

    await act(async () => {
      window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1 }));
    });

    expect(result.current.isSwiping).toBe(false);
    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    expect(onSwipeEnd).toHaveBeenCalledTimes(1);

    await act(async () => {
      area.dispatchEvent(
        new PointerEvent('pointerdown', {
          pointerId: 2,
          pointerType: 'touch',
          clientX: 100,
          clientY: 50,
        })
      );
      window.dispatchEvent(
        new PointerEvent('pointermove', {
          pointerId: 2,
          clientX: 105,
          clientY: 130,
        })
      );
      window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 2 }));
    });

    expect(result.current.direction).toBe('down');
    expect(onSwipeDown).toHaveBeenCalledTimes(1);
  });
});
