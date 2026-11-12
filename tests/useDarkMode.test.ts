import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';
import { useDarkMode } from '@/hooks/useDarkMode';

describe('useDarkMode', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
    vi.restoreAllMocks();
  });

  it('manages dark/light/system preferences and syncs class name on target', async () => {
    const customTarget = document.createElement('div');

    const { result, act } = await renderHook(() =>
      useDarkMode({
        storageKey: 'test-theme',
        darkClassName: 'theme-dark',
        target: customTarget,
        initializeWithValue: true,
      })
    );

    await act(async () => {
      result.current.enable();
    });
    expect(result.current.preference).toBe('dark');
    expect(result.current.isDarkMode).toBe(true);
    expect(customTarget.classList.contains('theme-dark')).toBe(true);

    await act(async () => {
      result.current.disable();
    });
    expect(result.current.preference).toBe('light');
    expect(result.current.isDarkMode).toBe(false);
    expect(customTarget.classList.contains('theme-dark')).toBe(false);

    await act(async () => {
      result.current.toggle();
    });
    expect(result.current.isDarkMode).toBe(true);

    await act(async () => {
      result.current.resetToSystem();
    });
    expect(result.current.preference).toBe('system');
  });
});
