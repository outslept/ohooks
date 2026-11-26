import { useTextareaAutosize } from '@/hooks/useTextareaAutosize';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('useTextareaAutosize', () => {
  let textarea: HTMLTextAreaElement;

  beforeEach(() => {
    textarea = document.createElement('textarea');
    textarea.style.width = '200px';
    textarea.style.lineHeight = '20px';
    textarea.style.padding = '0px';
    textarea.style.border = 'none';
    document.body.appendChild(textarea);
  });

  afterEach(() => {
    textarea.remove();
  });

  it('adjusts height within minHeight/maxHeight bounds, toggles overflowY, and handles input/resize events', async () => {
    const onResize = vi.fn();
    const { rerender, unmount, act } = await renderHook(
      (val: string = 'short') =>
        useTextareaAutosize(textarea, val, {
          minHeight: 40,
          maxHeight: 100,
          onResize,
        }),
    );

    expect(parseFloat(textarea.style.height)).toBeGreaterThanOrEqual(40);
    expect(onResize).toHaveBeenCalled();


    const longText = Array.from({ length: 20 }, (_, i) => `Line ${i}`).join('\n');
    textarea.value = longText;
    await rerender(longText);

    expect(textarea.style.height).toBe('100px');
    expect(textarea.style.overflowY).toBe('auto');


    textarea.value = 'short';
    await act(async () => {
      textarea.dispatchEvent(new Event('input'));
    });

    expect(parseFloat(textarea.style.height)).toBeLessThan(100);
    expect(textarea.style.overflowY).toBe('hidden');

    const callsBeforeUnmount = onResize.mock.calls.length;
    await unmount();

    await act(async () => {
      textarea.dispatchEvent(new Event('input'));
      window.dispatchEvent(new Event('resize'));
    });
    expect(onResize).toHaveBeenCalledTimes(callsBeforeUnmount);
  });

  it('handles content-box sizing and null target gracefully', async () => {
    textarea.style.boxSizing = 'content-box';
    textarea.style.paddingTop = '4px';
    textarea.style.paddingBottom = '4px';

    const onResize = vi.fn();
    await renderHook(() =>
      useTextareaAutosize(textarea, 'hello', { minHeight: 30, onResize }),
    );
    expect(onResize).toHaveBeenCalled();

    const nullRef = { current: null };
    const { result } = await renderHook(() => useTextareaAutosize(nullRef));
    expect(() => result.current.resize()).not.toThrow();
  });
});
