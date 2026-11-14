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
    content.style.width = '100%';
    content.style.height = '300px';
    container.appendChild(content);
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    vi.useRealTimers();
  });

  it('tracks scroll position, directions, arrived edges, and idle reset', async () => {
    const { result, act } = await renderHook(() =>
      useElementScroll(container, { idleDelayMs: 40 }),
    );

    expect(result.current.arrived.top).toBe(true);
    expect(result.current.arrived.bottom).toBe(false);

    await act(async () => {
      result.current.scrollTo(0, 200);
      container.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.y).toBe(200);
    expect(result.current.isScrolling).toBe(true);
    expect(result.current.directions.bottom).toBe(true);
    expect(result.current.arrived.bottom).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    expect(result.current.isScrolling).toBe(false);
    expect(result.current.directions.bottom).toBe(false);
  });
});
