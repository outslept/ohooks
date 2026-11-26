import { usePreferredLanguage } from '@/hooks/usePreferredLanguage';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('usePreferredLanguage', () => {
  const originalLanguage = Object.getOwnPropertyDescriptor(
    navigator,
    'language'
  );

  afterEach(() => {
    if (originalLanguage) {
      Object.defineProperty(navigator, 'language', originalLanguage);
    } else {
      Reflect.deleteProperty(navigator, 'language');
    }
  });

  it('returns defaultLanguage during SSR or when navigator.language is empty, and updates on languagechange', async () => {
    const ServerProbe = () =>
      createElement('span', null, usePreferredLanguage('ru'));
    expect(renderToString(createElement(ServerProbe))).toBe('<span>ru</span>');

    Object.defineProperty(navigator, 'language', {
      value: 'en-US',
      configurable: true,
    });

    const { result, act } = await renderHook(() => usePreferredLanguage('ru'));
    expect(result.current).toBe('en-US');

    await act(async () => {
      Object.defineProperty(navigator, 'language', {
        value: 'de-DE',
        configurable: true,
      });
      window.dispatchEvent(new Event('languagechange'));
    });
    expect(result.current).toBe('de-DE');

    await act(async () => {
      Object.defineProperty(navigator, 'language', {
        value: '',
        configurable: true,
      });
      window.dispatchEvent(new Event('languagechange'));
    });
    expect(result.current).toBe('ru');
  });
});
