import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { usePreferredLanguage } from '@/hooks/usePreferredLanguage';

describe('usePreferredLanguage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('tracks navigator.language and updates on languagechange event', async () => {
    const langSpy = vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');

    const { result, act } = await renderHook(() => usePreferredLanguage('ru'));
    expect(result.current).toBe('en-US');

    await act(async () => {
      langSpy.mockReturnValue('de-DE');
      window.dispatchEvent(new Event('languagechange'));
    });
    expect(result.current).toBe('de-DE');
  });
});
