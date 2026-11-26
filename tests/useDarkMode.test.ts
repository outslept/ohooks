import { useDarkMode } from '@/hooks/useDarkMode';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

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

  it('persists preference to localStorage, toggles default dark class on documentElement, and cleans up on unmount', async () => {
    const { result, unmount, act } = await renderHook(() => useDarkMode());

    expect(result.current.preference).toBe('system');

    await act(async () => {
      result.current.enable();
    });
    expect(result.current.preference).toBe('dark');
    expect(result.current.isDarkMode).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(window.localStorage.getItem('color-scheme-preference')).toBe(
      JSON.stringify('dark'),
    );

    await act(async () => {
      result.current.toggle();
    });
    expect(result.current.preference).toBe('light');
    expect(result.current.isDarkMode).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    await act(async () => {
      result.current.setPreference('dark');
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);


    await unmount();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('supports custom target, custom darkClassName, disable, and resetToSystem', async () => {
    const customTarget = document.createElement('div');

    const { result, act } = await renderHook(() =>
      useDarkMode({
        storageKey: 'custom-theme',
        darkClassName: 'theme-dark',
        target: customTarget,
        initializeWithValue: true,
      }),
    );

    await act(async () => {
      result.current.enable();
    });
    expect(customTarget.classList.contains('theme-dark')).toBe(true);

    await act(async () => {
      result.current.disable();
    });
    expect(result.current.preference).toBe('light');
    expect(result.current.isDarkMode).toBe(false);
    expect(customTarget.classList.contains('theme-dark')).toBe(false);

    await act(async () => {
      result.current.resetToSystem();
    });
    expect(result.current.preference).toBe('system');
  });

  it('does not modify DOM classes when applyDarkClass is false', async () => {
    const { result, act } = await renderHook(() =>
      useDarkMode({ applyDarkClass: false }),
    );

    await act(async () => {
      result.current.enable();
    });

    expect(result.current.isDarkMode).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
