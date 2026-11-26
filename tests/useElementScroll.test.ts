import { useElementScroll } from '@/hooks/useElementScroll';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useElementScroll', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    container.style.width = '100px';
    container.style.height = '100px';
    container.style.overflow = 'auto';

    const content = document.createElement('div');
    content.style.width = '300px';
    content.style.height = '300px';
    container.appendChild(content);
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    vi.useRealTimers();
  });

  it('tracks vertical and horizontal scroll positions, directions, arrived edges, and idle reset', async () => {
    const { result, act } = await renderHook(() =>
      useElementScroll(container, { idleDelayMs: 40 }),
    );

    expect(result.current.x).toBe(0);
    expect(result.current.y).toBe(0);
    expect(result.current.arrived).toEqual({
      top: true,
      bottom: false,
      left: true,
      right: false,
    });


    await act(async () => {
      result.current.scrollTo(200, 200);
      container.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.x).toBe(200);
    expect(result.current.y).toBe(200);
    expect(result.current.isScrolling).toBe(true);
    expect(result.current.directions).toEqual({
      left: false,
      right: true,
      top: false,
      bottom: true,
    });
    expect(result.current.arrived).toEqual({
      top: false,
      bottom: true,
      left: false,
      right: true,
    });


    await act(async () => {
      result.current.scrollTo({ top: 50, left: 100 });
      container.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.directions).toEqual({
      left: true,
      right: false,
      top: true,
      bottom: false,
    });

    await act(async () => {
      result.current.scrollTo(0);
      container.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.x).toBe(0);
    expect(result.current.y).toBe(50);
    expect(result.current.arrived.left).toBe(true);


    await act(async () => {
      vi.advanceTimersByTime(40);
    });
    expect(result.current.isScrolling).toBe(false);
    expect(result.current.directions).toEqual({
      left: false,
      right: false,
      top: false,
      bottom: false,
    });
  });

  it('respects custom arrival offsets and throttles scroll updates when throttleMs > 0', async () => {
    const { result, act } = await renderHook(() =>
      useElementScroll(container, {
        throttleMs: 100,
        offset: { top: 20, bottom: 30, left: 15, right: 25 },
      }),
    );


    await act(async () => {
      result.current.scrollTo(15, 20);
      container.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.arrived.top).toBe(true);
    expect(result.current.arrived.left).toBe(true);


    await act(async () => {
      result.current.scrollTo(175, 170);
      container.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.y).toBe(20);

    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.x).toBe(175);
    expect(result.current.y).toBe(170);
    expect(result.current.arrived).toEqual({
      top: false,
      bottom: true,
      left: false,
      right: true,
    });
  });
});
