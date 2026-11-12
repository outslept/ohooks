import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { useOnline } from '@/hooks/useOnline';

describe('useOnline', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('tracks navigator.onLine and updates on online/offline window events', async () => {
    const onLineSpy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);

    const { result, act } = await renderHook(() => useOnline());
    expect(result.current).toBe(true);

    await act(async () => {
      onLineSpy.mockReturnValue(false);
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(false);

    await act(async () => {
      onLineSpy.mockReturnValue(true);
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe(true);
  });
});
