import { useMediaQuery } from '@/hooks/useMediaQuery';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from 'vitest-browser-react';

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

describe('useMediaQuery', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('evaluates real media queries, updates when query changes, and cleans up listener on unmount', async () => {
    const addSpy = vi.spyOn(MediaQueryList.prototype, 'addEventListener');
    const removeSpy = vi.spyOn(MediaQueryList.prototype, 'removeEventListener');

    const { result, rerender, unmount } = await renderHook(
      (props?: { query: string }) =>
        useMediaQuery(props?.query ?? '(min-width: 999999px)'),
      { initialProps: { query: '(min-width: 999999px)' } }
    );

    expect(result.current).toBe(false);
    expect(addSpy).toHaveBeenCalledWith('change', expect.any(Function));

    await rerender({ query: '(min-width: 1px)' });
    expect(result.current).toBe(true);

    await unmount();
    expect(removeSpy).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('returns defaultValue during SSR', () => {
    const Probe = () =>
      createElement(
        'span',
        null,
        String(useMediaQuery('(min-width: 800px)', { defaultValue: true }))
      );

    expect(renderToString(createElement(Probe))).toBe('<span>true</span>');
  });
});
