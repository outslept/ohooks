import { useTextareaAutosize } from '@/hooks/useTextareaAutosize';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

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

  it('adjusts textarea height within minHeight/maxHeight bounds and fires onResize', async () => {
    const onResize = vi.fn();

    const { result, rerender } = await renderHook(
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

    act(() => {
      result.current.resize();
    });
    expect(textarea.style.height).toBe('100px');
  });
});
