import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { usePointerDrag } from '@/hooks/usePointerDrag';

describe('usePointerDrag', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    document.body.style.userSelect = '';
  });

  it('tracks drag lifecycle, respects threshold and axis lock, and restores userSelect', async () => {
    const box = document.createElement('div');
    document.body.appendChild(box);

    const onDragStart = vi.fn();
    const onDragMove = vi.fn();
    const onDragEnd = vi.fn();

    const { result, act } = await renderHook(() =>
      usePointerDrag(box, {
        axis: 'x',
        threshold: 10,
        preventUserSelect: true,
        onDragStart,
        onDragMove,
        onDragEnd,
      })
    );

    await act(async () => {
      box.dispatchEvent(
        new PointerEvent('pointerdown', {
          pointerId: 1,
          pointerType: 'mouse',
          button: 0,
          clientX: 100,
          clientY: 100,
          bubbles: true,
        })
      );
    });

    await act(async () => {
      window.dispatchEvent(
        new PointerEvent('pointermove', {
          pointerId: 1,
          clientX: 105,
          clientY: 105,
        })
      );
    });
    expect(result.current.isDragging).toBe(false);

    await act(async () => {
      window.dispatchEvent(
        new PointerEvent('pointermove', {
          pointerId: 1,
          clientX: 120,
          clientY: 150,
        })
      );
    });
    expect(result.current.isDragging).toBe(true);
    expect(onDragStart).toHaveBeenCalledTimes(1);

    await act(async () => {
      window.dispatchEvent(
        new PointerEvent('pointermove', {
          pointerId: 1,
          clientX: 125,
          clientY: 160,
        })
      );
    });

    expect(result.current.deltaX).toBe(25);
    expect(result.current.deltaY).toBe(0);
    expect(document.body.style.userSelect).toBe('none');
    expect(onDragMove).toHaveBeenCalledTimes(1);

    await act(async () => {
      window.dispatchEvent(
        new PointerEvent('pointerup', {
          pointerId: 1,
          clientX: 130,
          clientY: 160,
        })
      );
    });

    expect(result.current.isDragging).toBe(false);
    expect(document.body.style.userSelect).toBe('');
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });
});
