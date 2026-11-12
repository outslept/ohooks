import { useHydrated } from '@/hooks/useHydrated';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { renderHook } from 'vitest-browser-react';

describe('useHydrated', () => {
  it('returns false during SSR and true after hydration', async () => {
    const Comp = () => createElement('span', null, String(useHydrated()));
    expect(renderToString(createElement(Comp))).toContain('false');

    const { result } = await renderHook(() => useHydrated());
    expect(result.current).toBe(true);
  });
});
