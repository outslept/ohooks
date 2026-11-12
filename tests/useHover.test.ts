import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { useHover } from '@/hooks/useHover';

describe('useHover', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('tracks immediate mouseenter and mouseleave events', async () => {
    const el = document.createElement('div');
    const onEnter = vi.fn();
    const onLeave = vi.fn();

    const { result, act } = await renderHook(() =>
      useHover(el, { onEnter, onLeave })
    );

    expect(result.current).toBe(false);

    await act(async () => {
      el.dispatchEvent(new MouseEvent('mouseenter'));
    });
    expect(result.current).toBe(true);
    expect(onEnter).toHaveBeenCalledTimes(1);

    await act(async () => {
      el.dispatchEvent(new MouseEvent('mouseleave'));
    });
    expect(result.current).toBe(false);
    expect(onLeave).toHaveBeenCalledTimes(1);
  });

  it('supports enterDelay and leaveDelay and cancels pending timers on rapid transitions', async () => {
    vi.useFakeTimers();
    const el = document.createElement('div');
    const onEnter = vi.fn();
    const onLeave = vi.fn();

    const { result, act, unmount } = await renderHook(() =>
      useHover(el, { enterDelay: 100, leaveDelay: 150, onEnter, onLeave })
    );

    await act(async () => {
      el.dispatchEvent(new MouseEvent('mouseenter'));
      vi.advanceTimersByTime(50);
      el.dispatchEvent(new MouseEvent('mouseleave'));
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe(false);
    expect(onEnter).not.toHaveBeenCalled();
    onLeave.mockClear();

    await act(async () => {
      el.dispatchEvent(new MouseEvent('mouseenter'));
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe(true);
    expect(onEnter).toHaveBeenCalledTimes(1);

    await act(async () => {
      el.dispatchEvent(new MouseEvent('mouseleave'));
      vi.advanceTimersByTime(50);
      el.dispatchEvent(new MouseEvent('mouseenter'));
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe(true);
    expect(onLeave).not.toHaveBeenCalled();

    await act(async () => {
      el.dispatchEvent(new MouseEvent('mouseleave'));
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toBe(false);
    expect(onLeave).toHaveBeenCalledTimes(1);

    await unmount();
  });
});
