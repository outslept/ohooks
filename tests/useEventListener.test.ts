import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import useEventListenerDefault, {
  isRefObject,
  resolveTargetElement,
  useEventListener,
} from '@/hooks/useEventListener';

describe('useEventListener', () => {
  it('exports helper utilities and default export', () => {
    expect(useEventListenerDefault).toBe(useEventListener);

    const ref = createRef<HTMLDivElement>();
    const div = document.createElement('div');
    ref.current = div;

    expect(isRefObject(ref)).toBe(true);
    expect(isRefObject(div)).toBe(false);
    expect(isRefObject(null)).toBe(false);

    expect(resolveTargetElement(undefined, window)).toBe(window);
    expect(resolveTargetElement(null, window)).toBeNull();
    expect(resolveTargetElement(div)).toBe(div);
    expect(resolveTargetElement(ref)).toBe(div);
  });

  it('listens to window events by default and cleans up on unmount', async () => {
    const handler = vi.fn();
    const { unmount } = await renderHook(() => useEventListener('resize', handler));

    window.dispatchEvent(new Event('resize'));
    expect(handler).toHaveBeenCalledTimes(1);

    await unmount();
    window.dispatchEvent(new Event('resize'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('attaches listener to HTMLElement, RefObject, or Document and supports options', async () => {
    const button = document.createElement('button');
    const ref = { current: button };
    const clickHandler = vi.fn();
    const docHandler = vi.fn();

    await renderHook(() => {
      useEventListener('click', clickHandler, ref, { once: true });
      useEventListener('visibilitychange', docHandler, document, true);
    });

    button.click();
    button.click();
    expect(clickHandler).toHaveBeenCalledTimes(1);

    document.dispatchEvent(new Event('visibilitychange'));
    expect(docHandler).toHaveBeenCalledTimes(1);
  });

  it('does not attach listener when target resolves to null', async () => {
    const handler = vi.fn();
    const emptyRef = createRef<HTMLDivElement>();

    await renderHook(() => useEventListener('click', handler, emptyRef));
    window.dispatchEvent(new MouseEvent('click'));
    expect(handler).not.toHaveBeenCalled();
  });
});
