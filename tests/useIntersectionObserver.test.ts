import {
  useIntersectionObserver,
  type UseIntersectionObserverOptions,
} from '@/hooks/useIntersectionObserver';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('useIntersectionObserver', () => {
  let el: HTMLDivElement;

  beforeEach(() => {
    el = document.createElement('div');
    el.style.width = '50px';
    el.style.height = '50px';
    document.body.appendChild(el);
  });

  afterEach(() => {
    el.remove();
  });

  it('tracks intersection changes and stops observing after first intersection when freezeOnceVisible is true', async () => {
    const onChange = vi.fn();
    const { result, rerender } = await renderHook(
      (props?: UseIntersectionObserverOptions) =>
        useIntersectionObserver(el, {
          threshold: [0, 0.5],
          freezeOnceVisible: false,
          onChange,
          ...props,
        }),
    );

    await expect.poll(() => result.current?.isIntersecting).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);

    el.style.display = 'none';
    await expect.poll(() => result.current?.isIntersecting).toBe(false);

    el.style.display = 'block';
    await rerender({ freezeOnceVisible: true });
    await expect.poll(() => result.current?.isIntersecting).toBe(true);

    const callsAfterFreeze = onChange.mock.calls.length;
    el.style.display = 'none';
    expect(result.current?.isIntersecting).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(callsAfterFreeze);
  });

  it('does not observe when enabled is false or target is null', async () => {
    const onChange = vi.fn();
    const { result, rerender } = await renderHook(
      (props?: { target: Element | null; enabled: boolean }) =>
        useIntersectionObserver(props ? props.target : el, {
          enabled: props?.enabled ?? false,
          onChange,
        }),
    );

    expect(result.current).toBeNull();
    expect(onChange).not.toHaveBeenCalled();

    await rerender({ target: null, enabled: true });
    expect(result.current).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });
});
