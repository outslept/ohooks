import {
  useResizeObserver,
  type UseResizeObserverOptions,
} from '@/hooks/useResizeObserver';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

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
    vi.restoreAllMocks();
  });

  it('observes element size changes, passes box option, and disconnects when disabled or unmounted', async () => {
    const observeSpy = vi.spyOn(ResizeObserver.prototype, 'observe');
    const disconnectSpy = vi.spyOn(ResizeObserver.prototype, 'disconnect');
    const callback = vi.fn();

    const { rerender, unmount } = await renderHook(
      (props?: UseResizeObserverOptions & { target?: HTMLElement | null }) =>
        useResizeObserver(
          props && 'target' in props ? (props.target ?? null) : el,
          callback,
          props
        ),
      { initialProps: { enabled: true, box: 'border-box' } }
    );

    expect(observeSpy).toHaveBeenCalledWith(el, { box: 'border-box' });
    await expect.poll(() => callback.mock.calls.length).toBeGreaterThan(0);

    const countBeforeResize = callback.mock.calls.length;
    el.style.width = '180px';
    await expect
      .poll(() => callback.mock.calls.length)
      .toBeGreaterThan(countBeforeResize);


    await rerender({ enabled: false });
    expect(disconnectSpy).toHaveBeenCalledTimes(1);


    await rerender({ enabled: true, target: null });
    expect(observeSpy).toHaveBeenCalledTimes(1);

    await unmount();
  });
});
