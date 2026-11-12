import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { useLongPress } from '@/hooks/useLongPress';

function createPointerEvent(
  overrides: Partial<ReactPointerEvent<HTMLElement>> = {}
): ReactPointerEvent<HTMLElement> {
  return {
    pointerType: 'mouse',
    button: 0,
    clientX: 10,
    clientY: 10,
    ...overrides,
  } as ReactPointerEvent<HTMLElement>;
}

describe('useLongPress', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('triggers callback after threshold, calls lifecycle handlers, and blocks click after trigger', async () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const onStart = vi.fn();
    const onFinish = vi.fn();
    const onCancel = vi.fn();

    const { result, act } = await renderHook(() =>
      useLongPress(callback, {
        threshold: 300,
        moveThreshold: 10,
        onStart,
        onFinish,
        onCancel,
      })
    );

    await act(async () => {
      result.current.onPointerDown(createPointerEvent());
      vi.advanceTimersByTime(300);
    });

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.onPointerUp(createPointerEvent());
    });
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();

    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();
    await act(async () => {
      result.current.onClickCapture({
        preventDefault,
        stopPropagation,
      } as unknown as ReactMouseEvent<HTMLElement>);
    });
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(stopPropagation).toHaveBeenCalledTimes(1);
  });

  it('cancels when released early or moved past moveThreshold', async () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const onCancel = vi.fn();

    const { result, act } = await renderHook(() =>
      useLongPress(callback, { threshold: 300, moveThreshold: 10, onCancel })
    );

    await act(async () => {
      result.current.onPointerDown(createPointerEvent({ clientX: 0, clientY: 0 }));
      result.current.onPointerMove(createPointerEvent({ clientX: 25, clientY: 0 }));
      vi.advanceTimersByTime(300);
    });

    expect(callback).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
