import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { useDocumentVisibility } from '@/hooks/useDocumentVisibility';

describe('useDocumentVisibility', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reads document.visibilityState and updates on visibilitychange', async () => {
    const spy = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');

    const { result, act } = await renderHook(() => useDocumentVisibility());
    expect(result.current).toBe('visible');

    await act(async () => {
      spy.mockReturnValue('hidden');
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current).toBe('hidden');

    await act(async () => {
      spy.mockReturnValue('visible');
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current).toBe('visible');
  });
});
