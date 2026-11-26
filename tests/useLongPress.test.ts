import { useLongPress, type UseLongPressOptions } from '@/hooks/useLongPress';
import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

function createPointerEvent(
  overrides: Partial<ReactPointerEvent<HTMLElement>> = {},
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

  it('triggers after threshold, allows movement within moveThreshold, suppresses only the first subsequent click, and cleans up on unmount', async () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const onStart = vi.fn();
    const onFinish = vi.fn();
    const onCancel = vi.fn();

    const { result, act, unmount } = await renderHook(() =>
      useLongPress(callback, {
        threshold: 300,
        moveThreshold: 10,
        onStart,
        onFinish,
        onCancel,
      }),
    );

    await act(async () => {
      result.current.onPointerDown(
        createPointerEvent({ clientX: 10, clientY: 10 }),
      );
      result.current.onPointerMove(
        createPointerEvent({ clientX: 13, clientY: 14 }),
      );
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
    const clickEvent = {
      preventDefault,
      stopPropagation,
    } as unknown as ReactMouseEvent<HTMLElement>;

    await act(async () => {
      result.current.onClickCapture(clickEvent);
      result.current.onClickCapture(clickEvent);
    });
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(stopPropagation).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.onPointerDown(createPointerEvent());
    });
    await unmount();
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('cancels on early release, excess movement, pointer cancel, or pointer leave (when cancelOnLeave is true)', async () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const onCancel = vi.fn();

    const { result, rerender, act } = await renderHook(
      (props?: UseLongPressOptions<HTMLElement>) =>
        useLongPress(callback, {
          threshold: 300,
          moveThreshold: 10,
          cancelOnLeave: true,
          onCancel,
          ...props,
        }),
    );

    await act(async () => {
      result.current.onPointerDown(
        createPointerEvent({ clientX: 0, clientY: 0 }),
      );
      result.current.onPointerMove(
        createPointerEvent({ clientX: 25, clientY: 0 }),
      );
      vi.advanceTimersByTime(300);
    });
    expect(onCancel).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.onPointerDown(createPointerEvent());
      result.current.onPointerLeave(createPointerEvent());
      vi.advanceTimersByTime(300);
    });
    expect(onCancel).toHaveBeenCalledTimes(2);

    await act(async () => {
      result.current.onPointerDown(createPointerEvent());
      result.current.onPointerCancel(createPointerEvent());
      vi.advanceTimersByTime(300);
    });
    expect(onCancel).toHaveBeenCalledTimes(3);
    expect(callback).not.toHaveBeenCalled();

    await rerender({ cancelOnLeave: false, preventClick: false });
    await act(async () => {
      result.current.onPointerDown(createPointerEvent());
      result.current.onPointerLeave(createPointerEvent());
      vi.advanceTimersByTime(300);
      result.current.onPointerUp(createPointerEvent());
    });
    expect(callback).toHaveBeenCalledTimes(1);

    const preventDefault = vi.fn();
    await act(async () => {
      result.current.onClickCapture({
        preventDefault,
        stopPropagation: vi.fn(),
      } as unknown as ReactMouseEvent<HTMLElement>);
    });
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('ignores non-primary mouse buttons and events rejected by filterEvents', async () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const onStart = vi.fn();

    const { result, act } = await renderHook(() =>
      useLongPress(callback, {
        threshold: 200,
        filterEvents: (e) => e.clientX > 0,
        onStart,
      }),
    );

    await act(async () => {
      result.current.onPointerDown(
        createPointerEvent({ button: 2, clientX: 50 }),
      );
      result.current.onPointerDown(
        createPointerEvent({ button: 0, clientX: 0 }),
      );
      vi.advanceTimersByTime(300);
    });

    expect(onStart).not.toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalled();
  });
});
