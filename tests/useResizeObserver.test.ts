import { useResizeObserver } from '@/hooks/useResizeObserver';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useResizeObserver', () => {
  let el: HTMLDivElement;

  beforeEach(() => {
    el = document.createElement('div');
    el.style.width = '100px';
    el.style.height = '60px';
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it('observes element size changes and respects enabled option', async () => {
    const callback = vi.fn();

    const { rerender } = await renderHook(
      (enabled: boolean = true) =>
        useResizeObserver(el, callback, { enabled }),
    );

    await vi.waitFor(() => {
      expect(callback).toHaveBeenCalled();
    });

    const countBeforeResize = callback.mock.calls.length;
    el.style.width = '180px';

    await vi.waitFor(() => {
      expect(callback.mock.calls.length).toBeGreaterThan(countBeforeResize);
    });

    await rerender(false);
    const countAfterDisable = callback.mock.calls.length;
    el.style.width = '220px';

    await new Promise((r) => setTimeout(r, 50));
    expect(callback.mock.calls.length).toBe(countAfterDisable);
  });
});
