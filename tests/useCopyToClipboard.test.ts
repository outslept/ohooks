import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

describe('useCopyToClipboard', () => {
  const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

  afterEach(() => {
    vi.useRealTimers();
    if (originalClipboard) {
      Object.defineProperty(navigator, 'clipboard', originalClipboard);
    }
    vi.restoreAllMocks();
  });

  it('copies text, auto-resets isCopied after resetInterval, and supports manual reset and error handling', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    const { result, act } = await renderHook(() =>
      useCopyToClipboard({ resetInterval: 1000 })
    );

    expect(result.current.isCopied).toBe(false);
    expect(result.current.copiedText).toBeNull();

    let ok = false;
    await act(async () => {
      ok = await result.current.copy('hello world');
    });

    expect(ok).toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello world');
    expect(result.current.isCopied).toBe(true);
    expect(result.current.copiedText).toBe('hello world');

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.isCopied).toBe(false);
    expect(result.current.copiedText).toBe('hello world');

    await act(async () => {
      result.current.reset();
    });
    expect(result.current.copiedText).toBeNull();

    writeText.mockRejectedValueOnce(new Error('Denied'));
    await act(async () => {
      ok = await result.current.copy('fail');
    });
    expect(ok).toBe(false);
    expect(result.current.isCopied).toBe(false);
  });
});
