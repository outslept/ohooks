import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useCopyToClipboard', () => {
  const originalClipboard = Object.getOwnPropertyDescriptor(
    navigator,
    'clipboard',
  );

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    if (originalClipboard) {
      Object.defineProperty(navigator, 'clipboard', originalClipboard);
    }
    vi.restoreAllMocks();
  });

  it('copies text, auto-resets isCopied after resetInterval while keeping copiedText, and supports manual reset', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    const { result, act } = await renderHook(() =>
      useCopyToClipboard({ resetInterval: 1000 }),
    );

    expect(result.current.isCopied).toBe(false);
    expect(result.current.copiedText).toBeNull();

    let ok = false;
    await act(async () => {
      ok = await result.current.copy('hello world');
    });

    expect(ok).toBe(true);
    expect(writeText).toHaveBeenCalledExactlyOnceWith('hello world');
    expect(result.current.isCopied).toBe(true);
    expect(result.current.copiedText).toBe('hello world');


    await act(async () => {
      vi.advanceTimersByTime(999);
    });
    expect(result.current.isCopied).toBe(true);


    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.isCopied).toBe(false);
    expect(result.current.copiedText).toBe('hello world');

    await act(async () => {
      result.current.reset();
    });
    expect(result.current.isCopied).toBe(false);
    expect(result.current.copiedText).toBeNull();
  });

  it('does not auto-reset isCopied when resetInterval is null or non-positive', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    const { result, act } = await renderHook(() =>
      useCopyToClipboard({ resetInterval: null }),
    );

    await act(async () => {
      await result.current.copy('persistent');
      vi.advanceTimersByTime(10_000);
    });

    expect(result.current.isCopied).toBe(true);
    expect(result.current.copiedText).toBe('persistent');
  });

  it('clears previous copiedText and returns false when writeText rejects or clipboard API is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValueOnce(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    const { result, act } = await renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy('initial text');
    });
    expect(result.current.copiedText).toBe('initial text');
    expect(result.current.isCopied).toBe(true);


    writeText.mockRejectedValueOnce(new Error('Permission denied'));
    let ok = true;
    await act(async () => {
      ok = await result.current.copy('will fail');
    });

    expect(ok).toBe(false);
    expect(result.current.isCopied).toBe(false);
    expect(result.current.copiedText).toBeNull();


    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    });

    await act(async () => {
      ok = await result.current.copy('no-api');
    });

    expect(ok).toBe(false);
    expect(result.current.isCopied).toBe(false);
    expect(result.current.copiedText).toBeNull();
  });
});
