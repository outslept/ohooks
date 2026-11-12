import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

describe('useMediaQuery', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('evaluates media query and updates when change event fires', async () => {
    let matches = false;
    let listener: (() => void) | null = null;

    vi.spyOn(window, 'matchMedia').mockImplementation(((query: string) => ({
      get matches() {
        return matches;
      },
      media: query,
      onchange: null,
      addEventListener: (_type: string, cb: () => void) => {
        listener = cb;
      },
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia);

    const { result, act } = await renderHook(() =>
      useMediaQuery('(min-width: 800px)')
    );

    expect(result.current).toBe(false);

    await act(async () => {
      matches = true;
      listener?.();
    });

    expect(result.current).toBe(true);
  });
});
